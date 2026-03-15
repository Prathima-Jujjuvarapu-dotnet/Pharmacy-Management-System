using Microsoft.EntityFrameworkCore;
using PaymentService.Service;
using PharmacyManagement.Data;
using PharmacyManagement.Models;
using PharmacyManagement.Exception_Handling;

namespace PaymentService.Service
{
    public class PaymentServiceRepository : IPaymentService
    {
        private readonly Pharmacy _context;

        public PaymentServiceRepository(Pharmacy context)
        {
            _context = context;
        }


        public async Task<IEnumerable<Payment>> GetAllPaymentsAsync()
        {
            var payments = await _context.Payments.Include(p => p.Order).ToListAsync();
            if (payments.Any()) return payments;
            throw new CustomException("No payments available");
        }


        public async Task<IEnumerable<Payment>> GetDoctorPaymentsAsync(string doctorEmail)
        {
            var doctor = await _context.Doctors
        .Include(d => d.User)
        .FirstOrDefaultAsync(d => d.User.Email == doctorEmail);

            if (doctor == null) throw new CustomException("No payments available");

            return await _context.Payments
                .Include(p => p.Order)
                .ThenInclude(o => o.OrderDetails)
                .Where(p => p.Order != null && p.Order.DoctorId == doctor.DoctorId)
                .ToListAsync();
        }
        public async Task<IEnumerable<Payment>> GetUnverifiedPaymentsAsync()
        {
            return await _context.Payments
                .Where(p => !p.IsVerified)
                .ToListAsync();
        }


        public async Task<Payment?> GetPaymentByIdAsync(int paymentId)
        {
            return await _context.Payments.FindAsync(paymentId);
        }


        public async Task<bool> VerifyPaymentAsync(int paymentId)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
                return false;

            payment.IsVerified = true;
            _context.Payments.Update(payment);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<List<Payment>> MakePaymentAsync(PaymentRequest paymentRequest)
        {
            var doctor = await _context.Doctors
        .Include(d => d.User)
        .FirstOrDefaultAsync(d => d.User.Email == paymentRequest.DoctorEmail);

            if (doctor == null)
                throw new CustomException("Doctor not found.");

            if (!Enum.IsDefined(typeof(PaymentMethod), paymentRequest.PaymentMethod))
                throw new CustomException("Invalid payment method.");

            if (paymentRequest.PaymentMethod == PaymentMethod.UPI && string.IsNullOrEmpty(paymentRequest.UpiApp))
                throw new CustomException("UPI app is required for UPI payments.");

            var pendingOrders = await _context.Orders
                .Where(o => o.DoctorId == doctor.DoctorId && o.Status == "Approved" &&
                            paymentRequest.DrugNames.Contains(o.DrugName))
                .Include(o => o.OrderDetails)
                .ToListAsync();

            if (!pendingOrders.Any())
                throw new CustomException("No approved orders found for the selected drugs.");

            List<Payment> payments = new List<Payment>();

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    foreach (var order in pendingOrders)
                    {
                        if (order.OrderDetails == null || !order.OrderDetails.Any())
                            throw new CustomException($"Order {order.OrderId} has no valid order details.");

                        var payment = new Payment
                        {
                            OrderId = order.OrderId,
                            DoctorId = doctor.DoctorId,
                            DoctorName = doctor.DoctorName,
                            DrugName = order.DrugName,
                            Amount = order.OrderDetails.Sum(od => od.Price),
                            PaymentDate = DateTime.UtcNow,
                            PaymentMethod = paymentRequest.PaymentMethod,
                            UpiApp = paymentRequest.UpiApp,
                            TransactionId = paymentRequest.TransactionId,
                            PaymentStatus = PaymentStatus.Success,
                        };

                        _context.Payments.Add(payment);
                        order.Status = "Paid";
                        payments.Add(payment);
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return payments;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }

    }
        





    }



