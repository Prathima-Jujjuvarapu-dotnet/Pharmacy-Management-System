using PharmacyManagement.Models;

namespace PaymentService.Service
{
    public interface IPaymentService
    {
        Task<IEnumerable<Payment>> GetAllPaymentsAsync();
        Task<IEnumerable<Payment>> GetDoctorPaymentsAsync(string doctorEmail);
        Task<List<Payment>> MakePaymentAsync(PaymentRequest paymentRequest);
        Task<IEnumerable<Payment>> GetUnverifiedPaymentsAsync(); // Not yet verified
        Task<Payment?> GetPaymentByIdAsync(int paymentId); // Get single payment
        Task<bool> VerifyPaymentAsync(int paymentId); // Mark payment as verified

    }
}
