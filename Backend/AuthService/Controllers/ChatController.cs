using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly Pharmacy _context;

        public ChatController(Pharmacy context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest request)
        {
            string userMessage = request.Message.ToLower();
            string botResponse;

            // Pharmacy-specific + multilingual logic
            if (userMessage.Contains("namaste") || userMessage.Contains("नमस्ते"))
                botResponse = "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?";
            else if (userMessage.Contains("telugu") || userMessage.Contains("హలో"))
                botResponse = "హలో! మీకు ఎలా సహాయం చేయగలను?";
            else if (userMessage.Contains("hello") || userMessage.Contains("hi"))
                botResponse = "Hello! Welcome to the Pharmacy Management System. How can I assist you?";
            else if (userMessage.Contains("medicine") || userMessage.Contains("drug"))
                botResponse = "You can search for medicines by name, category, or availability. Need help with a specific drug?";
            else if (userMessage.Contains("inventory"))
                botResponse = "Inventory includes stock levels, expiry dates, and supplier info. Want to check current stock?";
            else if (userMessage.Contains("order"))
                botResponse = "You can place, track, or cancel orders. What would you like to do?";
            else if (userMessage.Contains("payment"))
                botResponse = "Payments can be made via card, UPI, or cash. Need help with a transaction?";
            else if (userMessage.Contains("sales"))
                botResponse = "Sales reports include daily, weekly, and monthly summaries. Want to view today's sales?";
            else if (userMessage.Contains("supplier"))
                botResponse = "Suppliers provide inventory. You can view supplier details or update stock.";
            else if (userMessage.Contains("login") || userMessage.Contains("auth"))
                botResponse = "Authentication is required to access services. Are you having trouble logging in?";
            else if (userMessage.Contains("report"))
                botResponse = "Reports include inventory, sales, and order summaries. Which report do you need?";
            else if (userMessage.Contains("expiry"))
                botResponse = "You can check for expired or soon-to-expire medicines in the inventory section.";
            else if (userMessage.Contains("thank"))
                botResponse = "You're welcome! Let me know if you need anything else.";
            else if (userMessage.Contains("bye"))
                botResponse = "Goodbye! Stay healthy and take care!";
            else
                botResponse = "I'm not sure I understand. You can ask about medicines, inventory, orders, payments, or reports.";

            // Save to database
            var chat = new ChatHistory
            {
                UserMessage = request.Message,
                BotResponse = botResponse,
                Timestamp = DateTime.UtcNow
            };

            _context.ChatHistories.Add(chat);
            await _context.SaveChangesAsync();

            return Ok(new { reply = botResponse });
        }

        [HttpGet("history")]
        public IActionResult GetHistory()
        {
            var history = _context.ChatHistories
                .OrderByDescending(c => c.Timestamp)
                .Select(c => new { c.UserMessage, c.BotResponse, c.Timestamp })
                .ToList();

            return Ok(history);
        }
    }

   
}
