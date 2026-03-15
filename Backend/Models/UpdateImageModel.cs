using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace PharmacyManagement.Models
{
    public class UpdateImageModel
    {
        public string Email { get; set; }
        public string? SelectedAvatar { get; set; } // optional
        public IFormFile? UploadedImage { get; set; } // optional
    }
}
