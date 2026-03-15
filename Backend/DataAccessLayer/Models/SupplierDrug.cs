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
    public class SupplierDrug
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SupplierDrugId { get; set; }

        public int SupplierId { get; set; }

        [JsonIgnore]
        public Supplier? Supplier { get; set; }

        public int DrugId { get; set; }

        [JsonIgnore]
        public Drug? Drug { get; set; }
        public string DrugName { get; set; }
        public string Image { get; set; }
        public string SupplierName { get; set; }
        public string SupplierEmail { get; set; } 


    }
}
