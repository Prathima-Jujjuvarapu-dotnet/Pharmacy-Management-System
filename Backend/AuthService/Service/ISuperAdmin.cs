using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Models;

namespace AuthService.Service
{
    public interface ISuperAdmin
    {

        Task<IEnumerable<Admin>> GetAllAdminsAsync();
        Task<Admin> ChangeAdminRoleAsync(int adminId, [FromBody] RoleUpdateRequest request);
        Task<bool> DeleteAdminAsync(int adminId);
    }
}
