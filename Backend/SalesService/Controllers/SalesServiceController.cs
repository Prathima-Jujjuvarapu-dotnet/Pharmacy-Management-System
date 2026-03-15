using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalesService.Service;
using PharmacyManagement.Models;

namespace SalesService.Controllers
{
    [Authorize(Roles = "SalesAdmin,SuperAdmin")]
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly ISalesService _salesService;

        public SalesController(ISalesService salesService)
        {
            _salesService = salesService;
        }

        
        [HttpGet("DrugSales/{drugName}")]
        public async Task<IActionResult> GetSalesByDrug(string drugName)
        {
            var sales = await _salesService.GetSalesByDrugAsync(drugName);

            var response = sales.Select(s => new
            {
                s.SalesId,
                s.DrugName,
                s.Quantity,
                s.Price,
                s.Total,
                s.SaleDate,
                s.Image,
                Doctor = new
                {
                    s.Doctor.DoctorId,
                    s.Doctor.User.Name,
                    s.Doctor.User.Email,
                    s.Doctor.User.Contact
                }
            });

            return Ok(response);
        }


        [HttpGet("get-sales")]
        public async Task<IActionResult> GetAllSales()
        {
            var sales = await _salesService.GetAllSalesAsync();

            var response = sales.Select(s => new
            {
                s.SalesId,
                s.DrugName,
                s.Quantity,
                s.Price,
                s.Total,
                s.SaleDate,
                s.Image,
                Doctor = new
                {
                    s.Doctor.DoctorId,
                    s.Doctor.User.Name,
                    s.Doctor.User.Email,
                    s.Doctor.User.Contact
                }
            });

            return Ok(response);
        }



        [HttpGet("get-doctor-sales/{doctorEmail}")]
        public async Task<IActionResult> GetDoctorSales(string doctorEmail)
        {
            return Ok(await _salesService.GetDoctorSalesAsync(doctorEmail));
        }

     
        [HttpGet("get-high-demand-drugs")]
        public async Task<IActionResult> GetHighDemandDrugs()
        {
            return Ok(await _salesService.GetHighDemandDrugsAsync());
        }

     
       
    }
}
