using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
    public class UpdateProfile
    {
        public string? Name { get; set; }
        //public string specialization { get; set; }
        public string? Contact { get; set; }
        public string? Address { get; set; }
        public string? Specialization { get; set; } // "Cardiologist", "Dermatologist", etc.
        public string? ProfileImageUrl { get; set; }

    }
}
