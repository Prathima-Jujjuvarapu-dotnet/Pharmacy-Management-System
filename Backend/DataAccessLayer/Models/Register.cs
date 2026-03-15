using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace PharmacyManagement.Models
{
    public class Register
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Contact { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public string? AdminRole { get; set; }
        public string? Specialization { get; set; } 
        public string? SelectedAvatar { get; set; } // e.g., "/profile-images/avatars/avatar2.png"
        public IFormFile? UploadedImage { get; set; } 

    }
}
