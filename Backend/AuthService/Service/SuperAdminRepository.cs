using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Data;
using PharmacyManagement.EmailNotifications;
using PharmacyManagement.Exception_Handling;
using PharmacyManagement.Models;

namespace AuthService.Service
{
    public class SuperAdminRepository:ISuperAdmin
    {
        private readonly Pharmacy _context;
        private readonly IEmailService _emailService;

        public SuperAdminRepository(Pharmacy context,IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }
        public async Task<IEnumerable<Admin>> GetAllAdminsAsync()
        {
            
                var admins = await _context.Admins.Include(a => a.User).ToListAsync();
            if (admins.Any()) 
            {
                return admins;
            
            }
            throw new CustomException("No Admins Available");               
            
        }

        public async Task<Admin> ChangeAdminRoleAsync(int adminId, [FromBody] RoleUpdateRequest request)
        {
            var admin = await _context.Admins.Include(a => a.User).FirstOrDefaultAsync(a => a.AdminId == adminId);

            if (admin == null)
            {
                throw new CustomException("Admin is not found");
            }
            if (admin.AdminRole == "SuperAdmin")
            {
                throw new CustomException("Cannot update SuperAdmin role.");
            }


            admin.AdminRole = request.NewRole;
            await _context.SaveChangesAsync();

            
            if (admin.User != null && !string.IsNullOrEmpty(admin.User.Email))
            {
                var subject = "Your Admin Role Has Been Updated";
                var body = $"Hello {admin.User.Name},<br><br>Your role has been changed to <b>{request.NewRole}</b>.<br><br>Regards,<br>Pharmacy Management Team";
                await _emailService.SendEmailAsync(admin.User.Email, subject, body);
            }

            return admin;

        }
        public async Task<bool> DeleteAdminAsync(int adminId)
        {
            var admin = await _context.Admins.Include(a => a.User)
                                             .FirstOrDefaultAsync(a => a.AdminId == adminId);

            if (admin == null)
                throw new CustomException("Admin not found");
            if (admin.AdminRole == "SuperAdmin")
            {
                throw new CustomException("Cannot Delete SuperAdmin role.");
            }
            // Delete associated User as well
            if (admin.User != null)
            {
                _context.Users.Remove(admin.User);
            }

            _context.Admins.Remove(admin);
            await _context.SaveChangesAsync();

            return true;
        }

    }
}
