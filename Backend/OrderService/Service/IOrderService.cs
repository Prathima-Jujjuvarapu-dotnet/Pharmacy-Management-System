using PharmacyManagement.Models;

namespace OrderService.Service
{
    public interface IOrderService
    {
        Task<IEnumerable<Object>> GetAllOrdersAsync();
        Task<IEnumerable<Order>> GetDoctorOrdersAsync(string doctorEmail);
        Task<Order> PlaceOrderAsync(string doctorEmail, OrderRequest orderRequest);
        Task<Order> UpdateOrderStatusAsync(int orderId, string status);
        
        Task<string> GetDoctorEmailByIdAsync(int doctorId);
        Task DeleteOrderAsync(int orderId);
        Task DeleteDrugFromOrderAsync(int orderId, string drugName);
    }
}
