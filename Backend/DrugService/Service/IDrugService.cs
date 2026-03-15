using PharmacyManagement.Models;

namespace DrugService.Service
{
    public interface IDrugService
    {
        Task<IEnumerable<Drug>> GetAllDrugsAsync();
        Task<Drug> GetDrugByNameAsync(string name);
        Task<Drug> AddDrugAsync(Drug drug);
        Task<IEnumerable<object>> GetAvailableDrugsAsync();
        Task<Drug> UpdateDrugAsync(string name, UpdateDrugModel drug);
        Task<bool> DeleteDrugAsync(string name);
    }
}
