using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PaymentId { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; }
        public bool IsVerified { get; set; } = false;

        public string DrugName { get; set; }
        public string DoctorName { get; set; }

        public double Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        // public string TransactionId { get; set; }
        public int DoctorId { get; set; }
        public PaymentMethod PaymentMethod { get; set; } // UPI, Cash, etc.
        public string? UpiApp { get; set; } // GPay, PhonePe, etc.
        public string? TransactionId { get; set; }
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Success; 

    }

}
