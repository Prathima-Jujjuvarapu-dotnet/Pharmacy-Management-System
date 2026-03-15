using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
    public class UserProfile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserProfileId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        //public string specialization { get; set; }
        public string Contact { get; set; }
        public string PasswordHash { get; set; }
        public string? AdminRole { get; set; } // "DrugAdmin", "OrderAdmin", etc.
        public string? Specialization { get; set; } // "Cardiologist", "Dermatologist", etc.
        public int UserId { get; set; }
        public User User { get; set; }
        public string? Address { get; set; }
        public string? ProfileImageUrl { get; set; }

    }
}
