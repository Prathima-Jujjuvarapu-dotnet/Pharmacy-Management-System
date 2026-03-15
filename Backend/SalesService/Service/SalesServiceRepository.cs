using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Data;
using PharmacyManagement.Models;
using PharmacyManagement.Exception_Handling;
using SalesService.Service;

public class SalesServiceRepository : ISalesService
{
    private readonly Pharmacy _context;

    public SalesServiceRepository(Pharmacy context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Sales>> GetAllSalesAsync()
    {
        
        var deliveredOrders = await _context.Orders
            .Where(o => o.Status == "Delivered")
            .Include(o => o.OrderDetails)
            .ToListAsync();

        List<Sales> newSales = new List<Sales>();

        foreach (var order in deliveredOrders)
        {
           
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DoctorId == order.DoctorId);

            if (doctor == null) continue;

            foreach (var detail in order.OrderDetails)
            {
               
                bool saleExists = await _context.SalesRecords.AnyAsync(s =>
                    s.DoctorId == doctor.DoctorId &&
                    s.DrugName == detail.DrugName &&
                    s.SaleDate == order.OrderDate);

                if (!saleExists)
                {
                    var sale = new Sales
                    {
                        DrugName = detail.DrugName,
                        Quantity = detail.Quantity,
                        Price = detail.Price / detail.Quantity,
                        Total = detail.Price,
                        SaleDate = order.OrderDate,
                        DoctorId = doctor.DoctorId,
                        Doctor = doctor,
                        Image=detail.Image
                    };
                    newSales.Add(sale);
                }
            }
        }

        
        if (newSales.Any())
        {
            _context.SalesRecords.AddRange(newSales);
            await _context.SaveChangesAsync();
        }

     
        return await _context.SalesRecords
            .Include(s => s.Doctor)
            .ThenInclude(d => d.User)
            .ToListAsync();
    }




    public async Task<IEnumerable<object>> GetDoctorSalesAsync(string doctorEmail)
    {
        var doctor = await _context.Doctors.Include(d => d.User)
            .FirstOrDefaultAsync(d => d.User.Email == doctorEmail);

        if (doctor == null) throw new CustomException("Doctor is not found");

        return await _context.SalesRecords
         .Where(s => s.Doctor.User.Email == doctorEmail && s.Doctor != null)
         .Select(s => new
         {
             s.SalesId,
             s.DrugName,
             s.Quantity,
             s.Price,
             s.Total,
             s.SaleDate,
             s.Image,
             DoctorId = s.DoctorId,
             Doctor = new
             {
                 s.Doctor.DoctorId,
                 s.Doctor.User.Name,
                 s.Doctor.User.Email,
                 s.Doctor.User.Contact,
                 s.Doctor.Specialization
             }
         })
         .ToListAsync();

    }


    public async Task<IEnumerable<string>> GetHighDemandDrugsAsync()
    {
        var highDemandDrugs = await _context.OrderDetails
            .Join(_context.Orders.Where(o => o.Status == "Delivered"),
                od => od.OrderId,
                o => o.OrderId,
                (od, o) => new { od.DrugName, od.Quantity })
            .GroupBy(od => od.DrugName)
            .OrderByDescending(g => g.Sum(od => od.Quantity))
            .Take(5)
            .Select(g => g.Key)
            .ToListAsync();

        return highDemandDrugs;
    }

    public async Task<IEnumerable<Sales>> GetSalesByDrugAsync(string drugName)
    {
        return await _context.SalesRecords
         .Where(s => s.DrugName == drugName)
         .Include(s => s.Doctor)
             .ThenInclude(d => d.User)  
         .ToListAsync();
    }


  
}
