using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Data;
using PharmacyManagement.Models;
using PharmacyManagement.Exception_Handling;

namespace SupplierService.Service
{
    public class SupplierServiceRepository : ISupplierService
    {
        private readonly Pharmacy _context;

        public SupplierServiceRepository(Pharmacy context)
        {
            _context = context;
        }


        public async Task<IEnumerable<Supplier>> GetAllSuppliersAsync()
        {
            var suppliers = await _context.Suppliers.ToListAsync();
            if (suppliers.Any())
            {
                return suppliers;
            }
            throw new CustomException("No suppliers");
        }


        public async Task<Supplier> GetSupplierByNameAsync(string supplierName)
        {
            var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Name == supplierName);
            if (supplier == null) throw new CustomException($"{supplierName} is not found");
            return supplier;
        }


        public async Task<Supplier> AddSupplierAsync(Supplier supplier)
        {
            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();
            return supplier;
        }


        public async Task<Supplier> UpdateSupplierAsync(string supplierName, Supplier supplier)
        {
            var existingSupplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Name == supplierName);
            if (existingSupplier == null) throw new CustomException($"{supplierName} is not found");

            existingSupplier.Name = supplier.Name;
            existingSupplier.ContactInfo = supplier.ContactInfo;
            existingSupplier.Email = supplier.Email;
            existingSupplier.Address = supplier.Address;

            await _context.SaveChangesAsync();
            return existingSupplier;
        }


        public async Task<bool> DeleteSupplierAsync(string supplierName)
        {
            var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Name == supplierName);
            if (supplier == null) throw new CustomException($"{supplierName} is not found");

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<IEnumerable<SupplierDrug>> GetSupplierDrugsAsync(string supplierName)
        {
            var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Name == supplierName);
            if (supplier == null) throw new CustomException($"{supplierName} is not found");

            return await _context.SupplierDrugs
                .Where(sd => sd.SupplierId == supplier.SupplierId)
                .Include(sd => sd.Drug)
                .ToListAsync();
        }


        public async Task<SupplierDrug> AddSupplierDrugAsync(string supplierName, string drugName)
        {

            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Name == supplierName);


            var drug = await _context.Drugs
                .FirstOrDefaultAsync(d => d.Name == drugName);


            if (supplier == null)
                throw new CustomException($"Supplier '{supplierName}' not found in database!");

            if (drug == null)
                throw new CustomException($"Drug '{drugName}' not found in database!");


            var supplierDrug = new SupplierDrug
            {
                SupplierId = supplier.SupplierId,
                DrugId = drug.DrugId,
                DrugName = drug.Name,
                Image = drug.Image,
                SupplierEmail = supplier.Email,
                SupplierName = supplier.Name,
            };


            var existingMapping = await _context.SupplierDrugs
                .FirstOrDefaultAsync(sd => sd.SupplierId == supplier.SupplierId && sd.DrugId == drug.DrugId);

            if (existingMapping != null)
                throw new CustomException($"Mapping already exists between '{supplierName}' and '{drugName}'.");


            _context.SupplierDrugs.Add(supplierDrug);
            await _context.SaveChangesAsync();
            return supplierDrug;
        }


        public async Task<bool> RemoveSupplierDrugAsync(string supplierName, string drugName)
        {
            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Name == supplierName);
            var drug = await _context.Drugs
                .FirstOrDefaultAsync(d => d.Name == drugName);

            if (supplier == null || drug == null)
                throw new CustomException($"{supplierName} is not found");

            var supplierDrug = await _context.SupplierDrugs
                .FirstOrDefaultAsync(sd => sd.SupplierId == supplier.SupplierId && sd.DrugId == drug.DrugId);

            if (supplierDrug == null) throw new CustomException($"{drugName} is not found");

            _context.SupplierDrugs.Remove(supplierDrug);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<SupplierDrug>> GetAllSuppliersWithDrugsAsync()
        {
            var supplierDrugs = await _context.SupplierDrugs.ToListAsync();
            if (!supplierDrugs.Any()) throw new CustomException("No suppliers and drugs found");
            return supplierDrugs;
        }

        public async Task<IEnumerable<StockAlert>> GetStockAlertsAsync()
        {
            var stockalerts = await _context.StockAlerts.ToListAsync();
            if (stockalerts.Any())
            {
                return stockalerts;
            }
            throw new CustomException("No alerts");
        }
        public async Task<IEnumerable<StockAlert>> UpdateStockAlertAsync(string drugname, bool stockAlert)
        {
            var existingAlert = await _context.StockAlerts.FirstOrDefaultAsync(s => s.DrugName == drugname); ;
            if (existingAlert == null) throw new CustomException("No drug found");
            else
            {
                existingAlert.IsResolved = stockAlert;
                await _context.SaveChangesAsync();
            }
            return await _context.StockAlerts.ToListAsync();

        }

        public  async Task<IEnumerable<StockAlert>> DeleteStockAlertAsync(string drugname)
        {
            var existingAlert = await _context.StockAlerts.FirstOrDefaultAsync(s => s.DrugName == drugname); ;
            if (existingAlert == null) throw new CustomException("No drug found");
            if (existingAlert.IsResolved) 
            {
                _context.StockAlerts.Remove(existingAlert);
                await _context.SaveChangesAsync();
                return await _context.StockAlerts.ToListAsync();
            }
            throw new CustomException("Alert cannot be deleted as it is not resolved");
        }
    }


}
