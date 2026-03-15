//using DrugService.Exception_Handling;
using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Data;
using PharmacyManagement.Exception_Handling;
using PharmacyManagement.Models;

namespace DrugService.Service
{
    public class DrugServiceRepository : IDrugService
    {
        private readonly Pharmacy _context;

        public DrugServiceRepository(Pharmacy context)
        {
            _context = context;
        }

   
        public async Task<IEnumerable<Drug>> GetAllDrugsAsync()
        {
            return await _context.Drugs.ToListAsync();
        }

        
        public async Task<Drug> GetDrugByNameAsync(string name)
        {
            var drug= await _context.Drugs.FirstOrDefaultAsync(d => d.Name == name);
            if(drug==null) throw new CustomException("Drug Not Found");
            else
            {
                return drug;
            }
        }

        
        public async Task<Drug> AddDrugAsync(Drug drug)
        {
            _context.Drugs.Add(drug);
            await _context.SaveChangesAsync();

          
            var inventory = new Inventory
            {
                DrugName = drug.Name,
                Image = drug.Image,
                StockQuantity = 0, 
                PricePerUnit = drug.Price,
                ExpiryDate = DateTime.UtcNow.AddYears(1),
                LastUpdated = DateTime.UtcNow
            };

            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();
            return drug;
        }

        public async Task<IEnumerable<object>> GetAvailableDrugsAsync()
    {
        var drugs = await _context.Drugs.ToListAsync();
        var inventories = await _context.Inventories.ToListAsync();

        var result = drugs.Select(d =>
        {
            var inventory = inventories.FirstOrDefault(i => i.DrugName == d.Name);
            return new
            {
                DrugName = d.Name,
                DrugQuantity = d.Quantity,
                StockQuantity = inventory?.StockQuantity ?? 0,
                IsOutOfStock = (d.Quantity + (inventory?.StockQuantity ?? 0)) <= 0
            };
        });

        return result;
    }
       public async Task<Drug> UpdateDrugAsync(string name, UpdateDrugModel updatedDrug)
{
    var drug = await _context.Drugs.FirstOrDefaultAsync(d => d.Name == name);
    if (drug == null) throw new CustomException("Drug Not Found");

    if (!string.IsNullOrWhiteSpace(updatedDrug.Name)) drug.Name = updatedDrug.Name;
    if (updatedDrug.Price.HasValue && updatedDrug.Price.Value > 0) drug.Price = updatedDrug.Price.Value;
    if (!string.IsNullOrWhiteSpace(updatedDrug.Manufacturer)) drug.Manufacturer = updatedDrug.Manufacturer;
    if (!string.IsNullOrWhiteSpace(updatedDrug.Description)) drug.Description = updatedDrug.Description;
    if (updatedDrug.Quantity.HasValue && updatedDrug.Quantity.Value >= 0) drug.Quantity = updatedDrug.Quantity.Value;
    if (!string.IsNullOrWhiteSpace(updatedDrug.Image)) drug.Image = updatedDrug.Image;
    if (updatedDrug.Rating.HasValue && updatedDrug.Rating.Value >= 0) drug.Rating = updatedDrug.Rating.Value;
    if (updatedDrug.ReviewCount.HasValue && updatedDrug.ReviewCount.Value >= 0) drug.ReviewCount = updatedDrug.ReviewCount.Value;
    if (!string.IsNullOrWhiteSpace(updatedDrug.Ingredients)) drug.Ingredients = updatedDrug.Ingredients;
    if (!string.IsNullOrWhiteSpace(updatedDrug.Storage)) drug.Storage = updatedDrug.Storage;
    if (!string.IsNullOrWhiteSpace(updatedDrug.Warnings)) drug.Warnings = updatedDrug.Warnings;
    if (!string.IsNullOrWhiteSpace(updatedDrug.QuantityPerPack)) drug.QuantityPerPack = updatedDrug.QuantityPerPack;
    if (updatedDrug.ExpiryDate.HasValue && updatedDrug.ExpiryDate.Value > DateTime.MinValue) drug.ExpiryDate = updatedDrug.ExpiryDate.Value;
    if (updatedDrug.PrescriptionRequired.HasValue) drug.PrescriptionRequired = updatedDrug.PrescriptionRequired.Value;
    if (!string.IsNullOrWhiteSpace(updatedDrug.Category)) drug.Category = updatedDrug.Category;
    if (!string.IsNullOrWhiteSpace(updatedDrug.Usage)) drug.Usage = updatedDrug.Usage;

    var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.DrugName == name);
    if (inventory != null)
    {
        if (!string.IsNullOrWhiteSpace(updatedDrug.Name)) inventory.DrugName = updatedDrug.Name;
        if (!string.IsNullOrWhiteSpace(updatedDrug.Image)) inventory.Image = updatedDrug.Image;
        if (updatedDrug.Price.HasValue && updatedDrug.Price.Value > 0) inventory.PricePerUnit = updatedDrug.Price.Value;
        if (updatedDrug.ExpiryDate.HasValue && updatedDrug.ExpiryDate.Value > DateTime.MinValue) inventory.ExpiryDate = updatedDrug.ExpiryDate.Value;

        inventory.LastUpdated = DateTime.UtcNow;
    }

    await _context.SaveChangesAsync();
    return drug;
}


        
        public async Task<bool> DeleteDrugAsync(string name)
        {
            var drug = await _context.Drugs.FirstOrDefaultAsync(d => d.Name == name);
            if (drug == null) throw new CustomException("Drug Not Found");
            var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.DrugName == name);
            if (inventory != null)
            {
                _context.Inventories.Remove(inventory);
            }
            _context.Drugs.Remove(drug);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
