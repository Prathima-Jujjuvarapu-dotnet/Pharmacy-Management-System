using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
    public class OrderItem
    {
        //[Key]
        //public int OrderItemId{get;set;}
        //public int OrderId { get; set; }
        public string DrugName { get; set; }  // 🔥 Doctor provides only the Name
        public int Quantity { get; set; }
    }
}
