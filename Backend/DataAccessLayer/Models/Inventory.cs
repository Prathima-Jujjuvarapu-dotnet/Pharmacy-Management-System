using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
    public class Inventory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int InventoryId { get; set; }

        public string DrugName { get; set; }
        //  public Drug Drug { get; set; }
        public string Image { get; set; }
        public int StockQuantity { get; set; }
        //public int ReorderLevel { get; set; }
        public double PricePerUnit { get; set; }
        public DateTime ExpiryDate { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
