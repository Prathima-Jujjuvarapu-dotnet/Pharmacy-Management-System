using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.EmailNotifications
{
    public interface IEmailService
    {
        Task SendEmailAsync(string receiver, string subject, string message);
    }
}
