using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using OrderService.Service;
using PharmacyManagement.Models;
using PharmacyManagement.EmailNotifications;

namespace OrderService.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IEmailService _emailService;

        public OrderController(IOrderService orderService,IEmailService emailService)
        {
            _orderService = orderService;
            _emailService = emailService;
        }

     
        [Authorize(Roles = "OrderAdmin,SuperAdmin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllOrders()
        {
            return Ok(await _orderService.GetAllOrdersAsync());
        }

      
        [Authorize(Roles = "Doctor")]
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetDoctorOrders()
        {
            var doctorEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(doctorEmail)) return Unauthorized("Email claim not found in token.");

            return Ok(await _orderService.GetDoctorOrdersAsync(doctorEmail));
        }

        
        [Authorize(Roles = "Doctor")]
        [HttpPost("place-order")]
        public async Task<IActionResult> PlaceOrder([FromBody] OrderRequest orderRequest)
        {
            var doctorEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(doctorEmail)) return Unauthorized("Email claim not found in token.");

            try
            {
                var newOrder = await _orderService.PlaceOrderAsync(doctorEmail, orderRequest);
                var subject = "Order Placed Successfully!";
                var message = $"Dear Doctor, Your order (ID: {newOrder.DrugName}) has been placed successfully.";
                await _emailService.SendEmailAsync(doctorEmail, subject, message);
                return Ok(newOrder);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        
       
        [Authorize(Roles = "OrderAdmin,SuperAdmin")]
        [HttpPut("{orderId}")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] string status)
        {
            var updatedOrder = await _orderService.UpdateOrderStatusAsync(orderId, status);
            if (updatedOrder == null) return NotFound("Order not found.");
            var doctorEmail = await _orderService.GetDoctorEmailByIdAsync(updatedOrder.DoctorId);

            if (string.IsNullOrEmpty(doctorEmail)) return BadRequest("Doctor email not found.");

           
            var doctorSubject = "Order Status Updated!";
            var doctorMessage = $"Dear Doctor, Your order (DrugName: {orderId}) status has been updated to {status}.";
            await _emailService.SendEmailAsync(doctorEmail, doctorSubject, doctorMessage);

            
            return Ok(updatedOrder);
        }
        [Authorize(Roles = "Doctor")]
        [HttpDelete("{orderId}")]
        public async Task<IActionResult> DeleteOrder(int orderId)
        {
            await _orderService.DeleteOrderAsync(orderId);
            return Ok(new { message = "Order deleted successfully" });
        }

        
        [Authorize(Roles = "Doctor")]
        [HttpDelete("{orderId}/drugs/{drugName}")]
        public async Task<IActionResult> DeleteDrugFromOrder(int orderId, string drugName)
        {
            await _orderService.DeleteDrugFromOrderAsync(orderId, drugName);
            return Ok(new { message = $"{drugName} removed from order" });
        }
    }
}
