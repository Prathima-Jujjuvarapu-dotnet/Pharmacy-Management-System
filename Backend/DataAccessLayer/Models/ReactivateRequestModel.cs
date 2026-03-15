using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace PharmacyManagement.Models
{
    public class ReactivateRequestModel
    {
        public string? Email { get; set; }
    }
}