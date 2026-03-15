using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Data;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly Pharmacy _context;

        public NotificationController(Pharmacy context)
        {
            _context = context;
        }

        // ✅ Get notifications by email
        [HttpGet("by-email/{email}")]
        public async Task<IActionResult> GetNotificationsByEmail(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound("User not found");

            var notifications = await _context.Notifications
                .Where(n => n.UserId == user.UserId && !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // ✅ Mark notification as read
        [HttpPost("mark-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // ✅ Create a generic notification
        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] Notification notification)
        {
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(notification);
        }

        [HttpPost("notify-me")]
        public async Task<IActionResult> NotifyMe([FromBody] RestockRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return NotFound("User not found");

            var restockExists = await _context.RestockRequests
                .AnyAsync(r => r.UserId == user.UserId && r.DrugName == request.DrugName);

            var notificationExists = await _context.Notifications
                .AnyAsync(n => n.UserId == user.UserId && n.Message.Contains(request.DrugName));

            var notificationIsRead = await _context.Notifications
                .AnyAsync(n => n.UserId == user.UserId && n.Message.Contains(request.DrugName) && n.IsRead);

            if (restockExists && notificationExists && notificationIsRead)
            {
                return Ok(new { message = "You've already requested notification for this drug. We'll let you know when it's restocked." });
            }

            if (!restockExists)
            {
                _context.RestockRequests.Add(new RestockRequest
                {
                    UserId = user.UserId,
                    Email = request.Email,
                    DrugName = request.DrugName
                });
            }

            _context.Notifications.Add(new Notification
            {
                UserId = user.UserId,
                Email = request.Email,
                Message = $"You will be notified when '{request.DrugName}' is restocked."
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification request saved." });
        }

    }
}
