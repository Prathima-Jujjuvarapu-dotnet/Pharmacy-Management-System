using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PharmacyManagement.Data;
using PharmacyManagement.Models;
using Microsoft.Extensions.Caching.Memory;
using BCrypt.Net;
using System.Dynamic;
using Microsoft.AspNetCore.Authorization;
using PharmacyManagement.EmailNotifications;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly Pharmacy _context;
        private readonly ILogger<AuthController> _logger;
        private readonly IEmailService _emailService;

        public UserProfileController(Pharmacy context, ILogger<AuthController> logger, IEmailService emailService)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
        }
        [HttpGet("get-user-profile-by-email/{email}")]
        public async Task<IActionResult> GetUserProfileByEmail(string email)
        {
            var profile = await _context.UserProfiles
                .Include(p => p.User)
                .Where(p => p.Email.ToLower() == email.ToLower())
                .SingleOrDefaultAsync();

            if (profile == null)
            {
                return NotFound("User profile not found.");
            }

            var role = profile.User?.Role;
            string welcomeMessage = role switch
            {
                "Doctor" => $"Welcome Dr. {profile.Name}",
                "Admin" => $"Welcome {profile.AdminRole} {profile.Name}",
                _ => $"Welcome {profile.Name}"
            };

            dynamic result = new ExpandoObject();
            result.UserProfileId = profile.UserProfileId;
            result.UserId = profile.UserId;
            result.Name = profile.Name;
            result.Email = profile.Email;
            result.Contact = profile.Contact;
            result.PasswordHash = "********";
            result.Address = profile.Address;
            result.ProfileImageUrl = profile.ProfileImageUrl;
            result.Role = role;
            result.Message = welcomeMessage;

            if (role == "Admin")
            {
                result.AdminRole = profile.AdminRole;
            }
            else if (role == "Doctor")
            {
                result.Specialization = profile.Specialization;
            }

            return Ok(result);
        }
        [HttpPut("update-profile-by-email/{email}")]
        public async Task<IActionResult> UpdateProfileByEmail(string email, [FromBody] UpdateProfile model)
        {
            var user = await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.Doctor)
                .Include(u => u.Admin)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return NotFound("User not found.");

            // Update User fields
            if (IsValid(model.Name))
                user.Name = model.Name;

            if (IsValid(model.Contact))
                user.Contact = model.Contact;

            // Update UserProfile fields
            if (user.UserProfile != null)
            {
                if (IsValid(model.Name))
                    user.UserProfile.Name = model.Name;

                if (IsValid(model.Contact))
                    user.UserProfile.Contact = model.Contact;

                if (IsValid(model.Address))
                    user.UserProfile.Address = model.Address;

                if (IsValid(model.ProfileImageUrl))
                    user.UserProfile.ProfileImageUrl = model.ProfileImageUrl;

                // Always sync email if user has one
                if (!string.IsNullOrWhiteSpace(user.Email))
                    user.UserProfile.Email = user.Email;
            }

            // Doctor-specific updates
            if (user.Role == "Doctor" && user.Doctor != null)
            {
                if (IsValid(model.Specialization))
                {
                    user.Doctor.Specialization = model.Specialization;
                    if (user.UserProfile != null)
                        user.UserProfile.Specialization = model.Specialization;
                }

                if (IsValid(model.Name))
                {
                    user.Doctor.DoctorName = model.Name;

                    var orders = await _context.Orders
                        .Where(o => o.DoctorId == user.Doctor.DoctorId)
                        .ToListAsync();
                    foreach (var order in orders)
                        order.DoctorName = model.Name;

                    var payments = await _context.Payments
                        .Where(p => p.DoctorId == user.Doctor.DoctorId)
                        .ToListAsync();
                    foreach (var payment in payments)
                        payment.DoctorName = model.Name;

                    _context.Orders.UpdateRange(orders);
                    _context.Payments.UpdateRange(payments);
                }
            }

            // Admin-specific updates
            if (user.Role == "Admin" && user.Admin != null && IsValid(model.Name))
            {
                user.Admin.AdminName = model.Name;
                if (user.UserProfile != null)
                    user.UserProfile.AdminRole = user.Admin.AdminRole;
            }

            await _context.SaveChangesAsync();
            return Ok("Profile updated successfully.");
        }
        private bool IsValid(string value) => !string.IsNullOrWhiteSpace(value) && value != "string";

        [HttpPost("update-profile-image")]
        public async Task<IActionResult> UpdateProfileImage([FromForm] UpdateImageModel model)
        {
            var userProfile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.Email == model.Email);

            if (userProfile == null)
                return NotFound("User profile not found");

            string newImagePath = userProfile.ProfileImageUrl ?? "profile-images/avatars/default.png";

            if (!string.IsNullOrEmpty(model.SelectedAvatar))
            {
                newImagePath = $"profile-images/avatars/{model.SelectedAvatar}";
            }
            else if (model.UploadedImage != null)
            {
                if (!userProfile.ProfileImageUrl.Contains("avatars"))
                {
                    var oldPath = Path.Combine("wwwroot", userProfile.ProfileImageUrl);
                    if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
                }

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(model.UploadedImage.FileName)}";
                var filePath = Path.Combine("wwwroot/profile-images", fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.UploadedImage.CopyToAsync(stream);
                }

                newImagePath = $"profile-images/{fileName}";
            }

            userProfile.ProfileImageUrl = newImagePath;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile image updated", imageUrl = newImagePath });
        }
        [HttpDelete("delete-account")]
        public async Task<IActionResult> DeleteAccount(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound("User not found");

            if (!user.IsActive)
                return BadRequest("Account already deleted");

            user.IsActive = false;
            //user.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Account deleted successfully");
        }

        [AllowAnonymous]
        [HttpPost("reactivate-with-security")]
        public async Task<IActionResult> ReactivateWithSecurity([FromBody] ReactivateSecurityModel model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

            if (user == null)
                return NotFound("User not found.");

            if (user.IsActive)
                return BadRequest("Account is already active.");

            if (user.Contact != model.PhoneNumber) // or DOB, etc.
                return Unauthorized("Security answer does not match.");

            user.IsActive = true;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Account reactivated successfully , You can login now " });
        }

          


    }

    
}