using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
    public class OtpRecords
    {
        public int Id { get; set; }  // Primary key
        public string Email { get; set; }  // User's email associated with the OTP
        public string Otp { get; set; }  // The OTP string
        public DateTime ExpirationTime { get; set; }
    }
}
