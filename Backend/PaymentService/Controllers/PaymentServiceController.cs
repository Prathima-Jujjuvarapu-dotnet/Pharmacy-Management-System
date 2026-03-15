using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using PaymentService.Service;
using PharmacyManagement.Models;
using PharmacyManagement.EmailNotifications;

namespace PaymentService.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IEmailService _emailService;

        public PaymentController(IPaymentService paymentService, IEmailService emailService)
        {
            _paymentService = paymentService;
            _emailService = emailService;
        }


        [Authorize(Roles = "PaymentAdmin,SuperAdmin,OrderAdmin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllPayments()
        {
            return Ok(await _paymentService.GetAllPaymentsAsync());
        }


        [Authorize(Roles = "Doctor")]
        [HttpGet("my-payments")]
        public async Task<IActionResult> GetDoctorPayments()
        {
            var doctorEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(doctorEmail)) return Unauthorized("Email claim not found in token.");

            return Ok(await _paymentService.GetDoctorPaymentsAsync(doctorEmail));
        }

        [Authorize(Roles = "PaymentAdmin,SuperAdmin")]
        [HttpGet("unverified")]
        public async Task<IActionResult> GetUnverifiedPayments()
        {
            var result = await _paymentService.GetUnverifiedPaymentsAsync();
            return Ok(result);
        }


        [Authorize(Roles = "PaymentAdmin,SuperAdmin")]
        [HttpGet("{paymentId}")]
        public async Task<IActionResult> GetPaymentById(int paymentId)
        {
            var payment = await _paymentService.GetPaymentByIdAsync(paymentId);
            if (payment == null)
                return NotFound("Payment not found");
            return Ok(payment);
        }


        [Authorize(Roles = "PaymentAdmin,SuperAdmin")]
        [HttpPost("verify/{paymentId}")]
        public async Task<IActionResult> VerifyPayment(int paymentId)
        {
            var success = await _paymentService.VerifyPaymentAsync(paymentId);
            if (!success)
                return NotFound("Payment not found");
            return Ok("Payment verified successfully");
        }


        [Authorize(Roles = "Doctor")]
        [HttpPost("make-payment")]
        public async Task<IActionResult> MakePayment([FromBody] PaymentRequest paymentRequest)
        {
            var doctorEmail = paymentRequest.DoctorEmail;

            if (string.IsNullOrEmpty(doctorEmail))
                return BadRequest(new { error = "Doctor email is missing from token." });

            try
            {
                var payments = await _paymentService.MakePaymentAsync(paymentRequest);

                if (payments == null || !payments.Any())
                {
                    string failedBody = $"Dear Doctor,\n\nYour payment attempt failed. No valid approved orders were found for the selected drugs.\n\n" +
                                        $"Payment Method: {paymentRequest.PaymentMethod}" +
                                        (paymentRequest.UpiApp != null ? $"\nUPI App: {paymentRequest.UpiApp}" : "") +
                                        (paymentRequest.TransactionId != null ? $"\nTransaction ID: {paymentRequest.TransactionId}" : "");

                    await _emailService.SendEmailAsync(doctorEmail, "Payment Failed", failedBody);
                    return BadRequest(new { error = "Payment processing failed." });
                }

                string paymentDetails = string.Join("\n", payments.Select(p => $"- {p.DrugName}: ₹{p.Amount}"));

                string successBody = $"Dear Doctor,\n\nYour payment has been successfully processed:\n{paymentDetails}\n\n" +
                                     $"Payment Method: {paymentRequest.PaymentMethod}" +
                                     (paymentRequest.UpiApp != null ? $"\nUPI App: {paymentRequest.UpiApp}" : "") +
                                     (paymentRequest.TransactionId != null ? $"\nTransaction ID: {paymentRequest.TransactionId}" : "");

                await _emailService.SendEmailAsync(doctorEmail, "Payment Confirmation", successBody);

                return Ok(payments);
            }
            catch (Exception ex)
            {
                string errorBody = $"Dear Doctor,\n\nYour payment attempt failed due to a system error:\n{ex.Message}\n\n" +
                                   $"Please try again later or contact support.";

                await _emailService.SendEmailAsync(doctorEmail, "Payment Error", errorBody);
                return BadRequest(new { error = ex.Message });
            }
        }


        [Authorize(Roles = "Doctor")]
        [HttpPost("initiate")]
        public async Task<IActionResult> InitiatePayment([FromBody] InitiatePaymentRequest request)
        {
            var config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();

            var apiKey = config["Instamojo:ApiKey"];
            var authToken = config["Instamojo:AuthToken"];
            var endpoint = config["Instamojo:Endpoint"];

            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("X-Api-Key", apiKey);
            client.DefaultRequestHeaders.Add("X-Auth-Token", authToken);

            if (request.DrugNames == null || !request.DrugNames.Any())
                return BadRequest(new { error = "No drugs provided for payment." });

            var payload = new Dictionary<string, string>
    {
        { "purpose", "Pharmacy Payment" },
        { "amount", request.Amount.ToString("F2") },
        { "buyer_name", request.DoctorEmail.Split('@')[0] },
        { "email", request.DoctorEmail },
        { "phone", "9999999999" },
        { "redirect_url", "http://localhost:4200/#/payment-success" },
        { "send_email", "true" },
        { "send_sms", "true" },
        { "allow_repeated_payments", "false" }
    };

            var content = new FormUrlEncodedContent(payload);
            var response = await client.PostAsync(endpoint, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return BadRequest(new { error = "Failed to create payment", details = responseBody });

            return Ok(responseBody);
        }
        [Authorize(Roles = "Doctor")]
        [HttpPost("webhook")]
        public async Task<IActionResult> HandleWebhook([FromBody] InstamojoWebhookPayload payload)
        {
            Console.WriteLine($"Webhook received for Payment ID: {payload.payment_id}, Status: {payload.status}");

            // TODO: Save to DB, verify MAC, update payment status, etc.

            return Ok();
        }
    }

}
