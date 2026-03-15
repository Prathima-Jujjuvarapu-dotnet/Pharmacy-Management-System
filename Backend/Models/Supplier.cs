using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
    public class Supplier
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SupplierId { get; set; }

        public string Name { get; set; }
        public string ContactInfo { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }

       // public ICollection<SupplierDrug> SupplierDrugs { get; set; }
    }

}
