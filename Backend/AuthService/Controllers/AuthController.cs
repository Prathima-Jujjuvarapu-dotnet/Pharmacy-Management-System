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
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly Pharmacy _context;
        private readonly ILogger<AuthController> _logger;
        private readonly IEmailService _emailService;

        public AuthController(Pharmacy context, IConfiguration configuration, ILogger<AuthController> logger, IEmailService emailService, IMemoryCache cache)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _emailService = emailService;

        }


        private string GenerateJwtToken(User user)
        {

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Email, user.Email),
            };

            if (user.Role == "Admin")
            {
                _logger.LogInformation("User is Admin");
                var admin = _context.Admins.FirstOrDefault(a => a.UserId == user.UserId);
                if (admin != null)
                {
                    claims.Add(new Claim(ClaimTypes.Role, admin.AdminRole));
                    _logger.LogInformation($"Assigned Role from Admins Table: {admin.AdminRole}");
                }
                else
                {
                    claims.Add(new Claim(ClaimTypes.Role, "Admin"));
                }
            }
            else
            {
                _logger.LogInformation("User is Doctor");
                claims.Add(new Claim(ClaimTypes.Role, user.Role));
            }
            _logger.LogInformation("Started Generating Token Based on Role");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );
            _logger.LogInformation("Successfully generated Token");
            return new JwtSecurityTokenHandler().WriteToken(token);

        }




        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] Register model)
        {
            _logger.LogInformation("Entered into Registration");
            if (!ModelState.IsValid)
            {
                _logger.LogError("Entered Incorrect Data");
                return BadRequest(ModelState);
            }
            if (string.IsNullOrEmpty(model.Name) || string.IsNullOrEmpty(model.Contact))
            {
                _logger.LogError("Missing Name or Contact.");
                return BadRequest("Name and Contact are required.");
            }


            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
            {
                _logger.LogError("Email is already registered");
                return BadRequest("Email is already in use");
            }


            if (string.IsNullOrEmpty(model.Role) || (model.Role != "Doctor" && model.Role != "Admin"))
            {
                _logger.LogError("Incorrect role");
                return BadRequest("Invalid Role. It must be 'Doctor' or 'Admin'");
            }


            if (model.Role == "Admin")
            {
                _logger.LogInformation("User is registering as Admin");
                var validAdminRoles = new HashSet<string> { "SuperAdmin", "DrugAdmin", "OrderAdmin", "SupplierAdmin", "PaymentAdmin", "SalesAdmin" };

                if (string.IsNullOrEmpty(model.AdminRole) || !validAdminRoles.Contains(model.AdminRole))
                {
                    _logger.LogError("Invalid role during registering");
                    return BadRequest("Invalid Admin Role");
                }
            }


            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.Password);


            var user = new User
            {
                Name = model.Name,
                Email = model.Email,
                Contact = model.Contact,
                Role = model.Role,
                PasswordHash = hashedPassword
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            string profileImageUrl = "/profile-images/avatars/avatar1.png";
            if (!string.IsNullOrEmpty(model.SelectedAvatar))
            {
                profileImageUrl = model.SelectedAvatar;
            }
            // If user uploaded an image
            else if (model.UploadedImage != null)
            {
                var extension = Path.GetExtension(model.UploadedImage.FileName).ToLower();
                var fileName = $"{Guid.NewGuid()}{extension}";
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/profile-images");
                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var filePath = Path.Combine(folderPath, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.UploadedImage.CopyToAsync(stream);
                }

                profileImageUrl = $"/profile-images/{fileName}";
            }
            var userProfile = new UserProfile
            {
                Name = user.Name,
                Email = user.Email,
                Contact = user.Contact,
                PasswordHash = user.PasswordHash,
                Address = "",
                UserId = user.UserId,
                ProfileImageUrl = profileImageUrl,
                Specialization = model.Role == "Doctor" ? model.Specialization : null,
                AdminRole = model.Role == "Admin" ? model.AdminRole : null
            };
            _context.UserProfiles.Add(userProfile);
            await _context.SaveChangesAsync();

            if (user.Role == "Admin")
            {
                var admin = new Admin
                {
                    UserId = user.UserId,
                    AdminName = user.Name,
                    AdminRole = model.AdminRole,
                    AdminEmail = user.Email,
                };

                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();
            }

            else if (user.Role == "Doctor")
            {
                if (string.IsNullOrEmpty(model.Specialization))
                {
                    return BadRequest("Specialization is required for doctors.");
                }

                var doctor = new Doctor
                {
                    UserId = user.UserId,
                    DoctorName = user.Name,
                    Specialization = model.Specialization
                };

                _context.Doctors.Add(doctor);
                await _context.SaveChangesAsync();

            }
            string subject = "Welcome to Pharmacy Management System";
            string body = $@"<p>Hello {user.Name},</p><p>Welcome to our platform! Your account has been successfully registered.</p>
            <p>You can now log in and start managing your pharmacy needs.</p><br> <p>Best Regards,</p><p><strong>Pharmacy Management Team</strong></p>";

            await _emailService.SendEmailAsync(user.Email, subject, body);
            _logger.LogInformation("Email sent successfully");

            return Ok(new { success = true, message = "User registered successfully!" });
        }



        [HttpPost("login-password")]
        public async Task<IActionResult> Login([FromBody] Login model)
        {
            if (ModelState.IsValid)
            {

                var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.Email);


                if (user == null)
                {
                    return Unauthorized("Invalid email or password");
                }

                if (!user.IsActive)
                {
                    _logger.LogWarning("User account is inactive");
                    return Unauthorized("Your account is inactive. Please kindly activate");
                }

                if (!BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                {
                    return Unauthorized("Invalid email or password");
                }


                var token = GenerateJwtToken(user);
                return Ok(new { Token = token });
            }

            return BadRequest("Invalid login data");
        }


        [HttpPost("request-otp")]
        public async Task<IActionResult> RequestOtp([FromBody] RequestOtp model)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.Email && u.Role == "Doctor");
            if (user == null)
            {
                return NotFound("Only doctors can log in with OTP");
            }

            string otp = new Random().Next(100000, 999999).ToString();


            var otpRecord = new OtpRecords
            {
                Email = model.Email,
                Otp = otp,
                ExpirationTime = DateTime.UtcNow.AddMinutes(2)
            };

            _context.OtpRecords.Add(otpRecord);
            await _context.SaveChangesAsync();

            string subject = "Your OTP Code for Login";
            string body = $"<p>Hello {user.Name},</p><p>Your OTP for login is: <strong>{otp}</strong>.</p><p>This OTP is valid for 2 minutes.</p>";

            await _emailService.SendEmailAsync(user.Email, subject, body);

            return Ok(new { success = true, message = "OTP has been sent to your email." });
        }

        [HttpPost("login-with-otp")]
        public async Task<IActionResult> LoginWithOtp([FromBody] OtpLogin model)
        {
            var otpRecord = await _context.OtpRecords
         .Where(o => o.Email == model.Email && o.Otp == model.Otp)
         .FirstOrDefaultAsync();

            if (otpRecord == null || otpRecord.ExpirationTime < DateTime.UtcNow)
            {
                return BadRequest("Invalid or expired OTP");
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.Email && u.Role == "Doctor");
            if (user == null)
            {
                return BadRequest("Invalid login attempt");
            }

            var token = GenerateJwtToken(user);

            string subject = "Login Notification";
            string body = $@"<p>Hello {user.Name},</p><p>You have successfully logged into your account on <strong>{DateTime.UtcNow}</strong>.</p> <p>If this wasn't you, please contact support immediately.</p>
                <br><p>Best Regards,</p><p><strong>Pharmacy Management Team</strong></p>";

            await _emailService.SendEmailAsync(user.Email, subject, body);


            _context.OtpRecords.Remove(otpRecord);
            await _context.SaveChangesAsync();

            return Ok(new { Token = token });
        }
        [HttpPost("request-reset-password")]
        public async Task<IActionResult> RequestResetPassword([FromBody] RequestPasswordReset model)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                return NotFound("User not found");
            }
            string otp = new Random().Next(100000, 999999).ToString();
            var otpRecord = new OtpRecords
            {
                Email = model.Email,
                Otp = otp,
                ExpirationTime = DateTime.UtcNow.AddMinutes(2)
            };

            _context.OtpRecords.Add(otpRecord);
            await _context.SaveChangesAsync();

            string subject = "Your OTP for Password Reset";
            string body = $"<p>Hello {user.Name},</p><p>Your OTP for Password Reset is: <strong>{otp}</strong>.</p><p>This OTP is valid for 2 minutes.</p>";

            await _emailService.SendEmailAsync(user.Email, subject, body);

            return Ok(new { success = true, message = "OTP has been sent to your email." });
        }
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPassword model)
        {
            var otpRecord = await _context.OtpRecords
                .Where(o => o.Email == model.Email && o.Otp == model.Otp)
                .FirstOrDefaultAsync();
            if (otpRecord == null || otpRecord.ExpirationTime < DateTime.UtcNow)
            {
                return BadRequest("Invalid or expired OTP");
            }
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                return BadRequest("Invalid email");
            }
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
            user.PasswordHash = hashedPassword;
            _context.Users.Update(user);
            _context.OtpRecords.Remove(otpRecord);
            await _context.SaveChangesAsync();
            string subject = "Your Password has been Reset";
            string body = $"<p>Hello {user.Name},</p><p>Your password has been successfully reset.</p> <p>If this wasn't you, please contact support immediately.</p>//<br><p>Best Regards,</p><p><strong>Pharmacy Management Team</strong></p>\";";
            await _emailService.SendEmailAsync(user.Email, subject, body);
            return Ok(new { success = true, message = "Password has been reset successfully." });
        }
        [HttpPost("qr-session")]
        public async Task<IActionResult> CreateQrSession()
        {
            var token = "qr-" + Guid.NewGuid().ToString("N").Substring(0, 10);

            var session = new QrLoginSession
            {
                Token = token,
                IsAuthenticated = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.QrLoginSessions.Add(session);
            await _context.SaveChangesAsync();

            return Ok(new { Token = token });
        }
        [HttpPost("qr-authenticate")]
        public async Task<IActionResult> AuthenticateViaQr([FromBody] QrLoginRequest model)
        {
            _logger.LogInformation("Received QR login request: Token={Token}, Email={Email}", model.Token, model.Email);
            var session = await _context.QrLoginSessions.FirstOrDefaultAsync(s => s.Token == model.Token);
            if (session == null)
            {
                _logger.LogWarning("QR session not found for token: {Token}", model.Token);
                return BadRequest("Invalid or expired QR session");
            }

            if (session.IsAuthenticated)
            {
                _logger.LogWarning("QR session already authenticated: {Token}", model.Token);
                return BadRequest("QR session already used");
            }

            if (session.CreatedAt.AddMinutes(20) < DateTime.UtcNow)
            {
                _logger.LogWarning("QR session expired: {Token}", model.Token);
                return BadRequest("QR session expired");
            }

            var user = await _context.Users
                .SingleOrDefaultAsync(u => u.Email.ToLower() == model.Email.ToLower());

            if (user == null)
            {
                _logger.LogWarning("User not found: {Email}", model.Email);
                return Unauthorized("Invalid credentials");
            }

            if (!user.IsActive)
            {
                _logger.LogWarning("User inactive: {Email}", model.Email);
                return Unauthorized("User is inactive");
            }

            if (!BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
            {
                _logger.LogWarning("Password mismatch for: {Email}", model.Email);
                return Unauthorized("Invalid credentials");
            }

            if (user.Role != "Doctor")
            {
                _logger.LogWarning("QR login attempted by non-doctor: {Email}", user.Email);
                return Unauthorized("QR code is only for doctors");
            }
            session.Email = user.Email;
            session.IsAuthenticated = true;
            session.AuthenticatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _logger.LogInformation("QR login successful for: {Email}", user.Email);
            return Ok(new { success = true });
        }

        [HttpGet("qr-status/{token}")]
        public async Task<IActionResult> CheckQrStatus(string token)
        {
            var session = await _context.QrLoginSessions.FirstOrDefaultAsync(s => s.Token == token);
            if (session == null)
            {
                return NotFound("Session not found");
            }

            if (session.IsAuthenticated)
            {
                var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == session.Email);
                if (user == null)
                {
                    return Unauthorized("User not found");
                }

                var jwt = GenerateJwtToken(user); // Use your existing method
                return Ok(new { authenticated = true, token = jwt });
            }

            return Ok(new { authenticated = false });
        }


    }

}

