using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
    public class PaymentRequest
    {
        public string DoctorEmail { get; set; }
        public List<string> DrugNames { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string? UpiApp { get; set; }
        public string? TransactionId { get; set; }


        

    }
}
