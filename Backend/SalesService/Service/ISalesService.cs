using PharmacyManagement.Models;

namespace SalesService.Service
{
    public interface ISalesService
    {
        Task<IEnumerable<Sales>> GetAllSalesAsync();
        Task<IEnumerable<object>> GetDoctorSalesAsync(string doctorEmail); 
        Task<IEnumerable<Sales>> GetSalesByDrugAsync(string drugName); 
        //Task NotifySupplierForRestock();
        Task<IEnumerable<string>> GetHighDemandDrugsAsync();
    }
}
