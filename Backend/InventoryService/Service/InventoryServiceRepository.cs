using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Data;
using PharmacyManagement.Models;
using PharmacyManagement.Exception_Handling;
using PharmacyManagement.EmailNotifications;

namespace InventoryService.Service
{
    public class InventoryServiceRepository : IInventoryService
    {
        private readonly Pharmacy _context;
        private readonly IEmailService _emailService;

        public InventoryServiceRepository(Pharmacy context,IEmailService emailService)
        {
            _context = context;
            _emailService=emailService ;
        }

        
        public async Task<IEnumerable<Inventory>> GetInventoryAsync()
        {
            var inventory= await _context.Inventories.ToListAsync();
            if (inventory == null) throw new CustomException("Inventory is empty");
            return inventory;
        }

       
        public async Task<Inventory> GetInventoryByDrugNameAsync(string drugName)
        {
            var inventory= await _context.Inventories.FirstOrDefaultAsync(i => i.DrugName == drugName);
            if (inventory == null) throw new CustomException($"Drug {drugName} is not found");
            return inventory;
        }
        public async Task<Inventory> UpdateStockAsync(string drugName, int stockQuantity)
        {
            var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.DrugName == drugName);
            if (inventory == null) throw new CustomException($"Drug {drugName} is not found");

            inventory.StockQuantity = stockQuantity;
            await _context.SaveChangesAsync();
            // Notify users who requested restock
            var requests = await _context.RestockRequests.Where(r => r.DrugName == drugName).ToListAsync();
            foreach (var request in requests)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = request.UserId,
                    Email=request.Email,
                    Message = $"Drug '{drugName}' is now restocked and available."
                });

                var user = await _context.Users.FindAsync(request.UserId);
                if (user != null)
                {
                    await _emailService.SendEmailAsync(user.Email, "Drug Restocked",
                        $"Hello, the drug '{drugName}' you requested is now restocked.");
                }
            }

            _context.RestockRequests.RemoveRange(requests);
            await _context.SaveChangesAsync();

            return inventory;
        }



     
        public async Task<Inventory> UpdatePriceAsync(string drugName, double pricePerUnit)
        {
            var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.DrugName == drugName);
            if (inventory == null) throw new CustomException($"Drug {drugName} is not found");

            inventory.PricePerUnit = pricePerUnit;
            inventory.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return inventory;
        }

     
        public async Task<Inventory> UpdateExpiryDateAsync(string drugName, DateTime expiryDate)
        {
            var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.DrugName == drugName);
            if (inventory == null) throw new CustomException($"Drug {drugName} is not found");

            inventory.ExpiryDate = expiryDate;
            inventory.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return inventory;
        }
     

    }
}
