using PharmacyManagement.Models;

namespace SupplierService.Service
{
    public interface ISupplierService
    {
        Task<IEnumerable<Supplier>> GetAllSuppliersAsync();
        Task<Supplier> GetSupplierByNameAsync(string supplierName);
        Task<Supplier> AddSupplierAsync(Supplier supplier);
        Task<Supplier> UpdateSupplierAsync(string supplierName, Supplier supplier);
        Task<bool> DeleteSupplierAsync(string supplierName);
        Task<IEnumerable<SupplierDrug>> GetSupplierDrugsAsync(string supplierName);
        Task<SupplierDrug> AddSupplierDrugAsync(string supplierName, string drugName);
        Task<bool> RemoveSupplierDrugAsync(string supplierName, string drugName);
        Task<IEnumerable<SupplierDrug>> GetAllSuppliersWithDrugsAsync();
        Task<IEnumerable<StockAlert>> GetStockAlertsAsync();
        Task<IEnumerable<StockAlert>> UpdateStockAlertAsync(string drugname, bool stockAlert);
        Task<IEnumerable<StockAlert>> DeleteStockAlertAsync(string drugname);
    }
}
