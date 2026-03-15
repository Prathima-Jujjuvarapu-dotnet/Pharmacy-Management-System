using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
    public class OrderRequest
    {
        public List<OrderItem> OrderItems { get; set; }
    }
}
