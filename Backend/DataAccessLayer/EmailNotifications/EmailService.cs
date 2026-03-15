using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace PharmacyManagement.EmailNotifications
{
    public class EmailService:IEmailService
    {
        private readonly string _smtpServer;
        private readonly int _port;
        private readonly string _senderEmail;
        private readonly string _senderName;
        private readonly string _password;

        public EmailService(IConfiguration configuration)
        {
            var emailSettings = configuration.GetSection("EmailNotification");
            _smtpServer = emailSettings["SmtpServer"];
            _port = int.Parse(emailSettings["Port"]);
            _senderEmail = emailSettings["SenderEmail"];
            _senderName = emailSettings["SenderName"];
            _password = emailSettings["Password"];
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var smtpClient = new SmtpClient(_smtpServer)
            {
                Port = _port,
                Credentials = new NetworkCredential(_senderEmail, _password),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_senderEmail, _senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}
