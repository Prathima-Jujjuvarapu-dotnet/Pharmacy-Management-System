using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
   

    public class User
    {
            [Key]
            [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
            public int UserId { get; set; }

            public string Name { get; set; }
            public string Email { get; set; }
            public string Contact { get; set; }
            public string PasswordHash { get; set; }

            // ✅ Only "Admin" or "Doctor"
            public string Role { get; set; }
            public bool IsActive { get; set; } = true;

        // ✅ One-to-One Relation
        [JsonIgnore]
            public Admin Admin { get; set; }
            public Doctor Doctor { get; set; }
            public UserProfile UserProfile { get; set; }


    }

}
