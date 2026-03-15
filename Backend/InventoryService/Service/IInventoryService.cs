using PharmacyManagement.Models;

namespace InventoryService.Service
{
    public interface IInventoryService
    {
        Task<IEnumerable<Inventory>> GetInventoryAsync();
        Task<Inventory> GetInventoryByDrugNameAsync(string drugName);
        Task<Inventory> UpdateStockAsync(string drugName, int stockQuantity);
        Task<Inventory> UpdatePriceAsync(string drugName, double pricePerUnit);
        Task<Inventory> UpdateExpiryDateAsync(string drugName, DateTime expiryDate);
    }
}
