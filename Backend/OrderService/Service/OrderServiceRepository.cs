using Microsoft.EntityFrameworkCore;
using OrderService.Service;
using PharmacyManagement.Data;
using PharmacyManagement.Models;
using PharmacyManagement.Exception_Handling;
using PharmacyManagement.EmailNotifications;

namespace OrderService.Service
{
    public class OrderServiceRepository : IOrderService
    {
        private readonly Pharmacy _context;
        private readonly IEmailService _emailService;

        public OrderServiceRepository(Pharmacy context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }


        public async Task<IEnumerable<object>> GetAllOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                .ToListAsync();

            if (!orders.Any())
                throw new CustomException("No orders available");

            // Get all payments once to match with orders
            var payments = await _context.Payments.ToListAsync();

            // Create anonymous object with isVerified included
            var result = orders.Select(order => new
            {
                order.OrderId,
                order.DoctorId,
                order.DoctorName,
                order.OrderDate,
                order.Status,
                order.OrderDetails,
                isVerified = payments.Any(p => p.OrderId == order.OrderId && p.IsVerified)
            });

            return result;
        }



        public async Task<IEnumerable<Order>> GetDoctorOrdersAsync(string doctorEmail)
        {
            var doctor = await _context.Doctors.Include(d => d.User)
                .FirstOrDefaultAsync(d => d.User.Email == doctorEmail);
            if (doctor == null) throw new CustomException("It's time to place some orders");

            return await _context.Orders
                .Where(o => o.DoctorId == doctor.DoctorId)
                .Include(o => o.OrderDetails)
                .ToListAsync();
        }


        public async Task<Order> PlaceOrderAsync(string doctorEmail, OrderRequest orderRequest)
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.User.Email == doctorEmail);

            if (doctor == null)
                throw new CustomException($"Doctor with email '{doctorEmail}' not found.");

            var order = new Order
            {
                DoctorId = doctor.DoctorId,
                DoctorName = doctor.DoctorName,
                Status = "Pending",
                OrderDate = DateTime.UtcNow,
                OrderDetails = new List<OrderDetail>()
            };

            double totalPrice = 0;
            List<string> drugNames = new List<string>();

            foreach (var item in orderRequest.OrderItems)
            {
                var drug = await _context.Drugs.FirstOrDefaultAsync(d => d.Name == item.DrugName);
                if (drug == null)
                    throw new CustomException($"Drug '{item.DrugName}' not found.");

                var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.DrugName == item.DrugName);
                if (inventory == null)
                    throw new CustomException($"Inventory for drug '{item.DrugName}' not found.");

                const int drugThreshold = 100;
                const int inventoryThreshold = 200;

                int requestedQuantity = item.Quantity;
                if (drug.Quantity >= requestedQuantity)
                {
                    drug.Quantity -= requestedQuantity;
                }
                else if (drug.Quantity + inventory.StockQuantity >= requestedQuantity)
                {
                    int remaining = requestedQuantity - drug.Quantity;
                    drug.Quantity = 0;

                    inventory.StockQuantity -= remaining;
                }
                else
                {
                    
                    throw new CustomException($"'{item.DrugName}' is out of stock. You'll be notified when it's restocked.");
                }

                if (inventory.StockQuantity < inventoryThreshold)
                {
                    bool alertExists = await _context.StockAlerts
                        .AnyAsync(a => a.DrugName == inventory.DrugName && !a.IsResolved);

                    if (!alertExists)
                    {
                        var alert = new StockAlert
                        {
                            DrugName = inventory.DrugName,
                            Message = $"Stock for '{inventory.DrugName}' is below threshold ({inventory.StockQuantity}).",
                            AlertDate = DateTime.UtcNow,
                            IsResolved = false,
                            Image = inventory.Image,
                        };
                        _context.StockAlerts.Add(alert);
                    }
                }
                var orderDetail = new OrderDetail
                {
                    DrugId = drug.DrugId,
                    DrugName = drug.Name,
                    Quantity = item.Quantity,
                    Image = drug.Image,
                    Price = drug.Price * item.Quantity
                };

                totalPrice += orderDetail.Price;
                order.OrderDetails.Add(orderDetail);
                drugNames.Add(drug.Name);
            }

            order.DrugName = drugNames.Count > 1 ? string.Join(", ", drugNames) : drugNames.FirstOrDefault();

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }
        


        public async Task<Order> UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _context.Orders.Include(o => o.OrderDetails).FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null) throw new CustomException($"No order is available with order id{orderId}");
            order.Status = status;
            await _context.SaveChangesAsync();
            var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.DoctorId == order.DoctorId);
            if (doctor != null)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = doctor.User.UserId,
                    Email=doctor.User.Email,
                    Message = $"Your order #{order.OrderId} status has been updated to '{status}'."
                });

                await _emailService.SendEmailAsync(doctor.User.Email, "Order Status Updated",
                    $"Your order #{order.OrderId} status is now '{status}'.");
            }

            await _context.SaveChangesAsync();
            return order;
        }
        public async Task<string> GetDoctorEmailByIdAsync(int doctorId)
        {
            var doctor = await _context.Users.FirstOrDefaultAsync(u => u.UserId == doctorId);
            return doctor?.Email;
        }
        public async Task DeleteOrderAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails) 
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                throw new CustomException($"Order with ID {orderId} not found.");
            }

            _context.OrderDetails.RemoveRange(order.OrderDetails); 
            _context.Orders.Remove(order); 
            await _context.SaveChangesAsync();
        }


        public async Task DeleteDrugFromOrderAsync(int orderId, string drugName)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                throw new KeyNotFoundException($"Order with ID {orderId} not found.");
            }

            if (!order.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase) && !order.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException($"Cannot delete drugs from a '{order.Status}' order.");
            }

            var drugToRemove = order.OrderDetails
                .FirstOrDefault(d => d.DrugName.Equals(drugName, StringComparison.OrdinalIgnoreCase));

            if (drugToRemove == null)
            {
                throw new KeyNotFoundException($"Drug '{drugName}' not found in order {orderId}.");
            }

            _context.OrderDetails.Remove(drugToRemove); // ✅ Remove drug
            await _context.SaveChangesAsync(); // ✅ Save before checking if order is empty

            // 🔥 Double-check if orderDetails is empty AND status is "Pending"
            var updatedOrder = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (updatedOrder != null && !updatedOrder.OrderDetails.Any() && (updatedOrder.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase) || updatedOrder.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase)))
            {
                _context.Orders.Remove(updatedOrder);
                await _context.SaveChangesAsync(); // ✅ Final Save
            }
        }

    }
}

