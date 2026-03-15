using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace PharmacyManagement.Models
{
    public class Sales
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int SalesId { get; set; }

        public string DrugName { get; set; }  // ✅ Store Drug Name instead of DrugId
        public string Image { get; set; }
        public int Quantity { get; set; }
        public double Price { get; set; }
        public double Total { get; set; }
        public DateTime SaleDate { get; set; }

        public int DoctorId { get; set; } // ✅ Store Doctor ID
        [JsonIgnore]
        public Doctor Doctor { get; set; }  // ✅ Reference to the Doctor (User)
    }
        
}
