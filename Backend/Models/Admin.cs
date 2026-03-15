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
   public class Admin
    {
        
            [Key]
            [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
            public int AdminId { get; set; }
            public string AdminName { get; set; }
            public string AdminEmail { get; set; }
            public int UserId { get; set; }
            [JsonIgnore]
            public User User { get; set; }

            // ✅ Stores the exact admin role ("DrugAdmin", "OrderAdmin", etc.)
            public string AdminRole { get; set; }
        

    }

}
