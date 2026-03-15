using AuthService.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Exception_Handling;
using PharmacyManagement.Models;

namespace AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin")] 
    public class SuperAdminController : ControllerBase
    {
        private readonly ISuperAdmin _superAdmin;

        public SuperAdminController(ISuperAdmin superAdmin)
        {
            _superAdmin = superAdmin;
        }
      
        [HttpGet("get-all-admins")]
        public async Task<ActionResult<IEnumerable<Admin>>> GetAllAdmins()
        {
            var admins = await _superAdmin.GetAllAdminsAsync();

            if (admins != null && admins.Any())  
            {
                return Ok(admins);  
            }

            throw new CustomException("No admins available");
        }

        [HttpPut("change-role/{adminId}")]
        public async Task<IActionResult> ChangeAdminRole(int adminId, [FromBody] RoleUpdateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NewRole))
                return BadRequest("New role is required.");

            var updatedAdmin = await _superAdmin.ChangeAdminRoleAsync(adminId, request);
            if (updatedAdmin == null)
                return NotFound("Admin not found.");

            return Ok(updatedAdmin);
        }

        [HttpDelete("delete-admin/{adminId}")]
        public async Task<IActionResult> DeleteAdmin(int adminId)
        {
            var result = await _superAdmin.DeleteAdminAsync(adminId);

            if (result)
                return Ok(new { message = "Admin deleted successfully." });

            return BadRequest("Failed to delete admin.");
        }

    }
}
