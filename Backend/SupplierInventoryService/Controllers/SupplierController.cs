using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupplierService.Service;
using PharmacyManagement.Models;
using PharmacyManagement.Exception_Handling;

namespace SupplierService.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierController : ControllerBase
    {
        private readonly ISupplierService _supplierService;

        public SupplierController(ISupplierService supplierService)
        {
            _supplierService = supplierService;
        }

       
        [Authorize(Roles = "SupplierAdmin,SuperAdmin")]
        [HttpGet]
        public async Task<IActionResult> GetAllSuppliers()
        {
            return Ok(await _supplierService.GetAllSuppliersAsync());
        }
        [Authorize(Roles ="SupplierAdmin,SuperAdmin")]
        [HttpGet("all-suppliers-drugs")]
        public async Task<IActionResult> GetAllSuppliersWithDrugs()
        {
            var suppliers = await _supplierService.GetAllSuppliersWithDrugsAsync();
            if (suppliers == null) return NotFound("No suppliers and drugs found.");
            return Ok(suppliers);
        }

        [Authorize(Roles = "SupplierAdmin,SuperAdmin")]
        [HttpGet("{supplierName}")]
        public async Task<IActionResult> GetSupplierByName(string supplierName)
        {
            var supplier = await _supplierService.GetSupplierByNameAsync(supplierName);
            if (supplier == null) return NotFound("Supplier not found.");
            return Ok(supplier);
        }

       
        [Authorize(Roles = "SupplierAdmin")]
        [HttpPost("add-supplier")]
        public async Task<IActionResult> AddSupplier([FromBody] Supplier supplier)
        {
            try
            {
                var newSupplier = await _supplierService.AddSupplierAsync(supplier);
                return Ok(newSupplier);
            }
            catch (Exception ex)
            {
               
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        
        [Authorize(Roles = "SupplierAdmin")]
        [HttpPut("{supplierName}/update")]
        public async Task<IActionResult> UpdateSupplier(string supplierName, [FromBody] Supplier supplier)
        {
            var updatedSupplier = await _supplierService.UpdateSupplierAsync(supplierName, supplier);
            if (updatedSupplier == null) return NotFound("Supplier not found.");
            return Ok(updatedSupplier);
        }

        
        [Authorize(Roles = "SupplierAdmin")]
        [HttpDelete("{supplierName}/delete")]
        public async Task<IActionResult> DeleteSupplier(string supplierName)
        {
            var success = await _supplierService.DeleteSupplierAsync(supplierName);
            if (!success) return NotFound("Supplier not found.");
            return Ok("Supplier deleted successfully.");
        }

        
        [Authorize(Roles = "SupplierAdmin")]
        [HttpGet("{supplierName}/drugs")]
        public async Task<IActionResult> GetSupplierDrugs(string supplierName)
        {
            var supplierDrugs = await _supplierService.GetSupplierDrugsAsync(supplierName);
            if (supplierDrugs == null) return NotFound("Supplier not found or no associated drugs.");
            return Ok(supplierDrugs);
        }

       
        [Authorize(Roles = "SupplierAdmin")]
        [HttpPost("{supplierName}/add-drug/{drugName}")]
        public async Task<IActionResult> AddSupplierDrug(string supplierName, string drugName)
        {
            try
            {
                var supplierDrug = await _supplierService.AddSupplierDrugAsync(supplierName, drugName);
                return Ok(supplierDrug);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

       
        [Authorize(Roles = "SupplierAdmin")]
        [HttpDelete("{supplierName}/remove-drug/{drugName}")]
        public async Task<IActionResult> RemoveSupplierDrug(string supplierName, string drugName)
        {

            try
            {
                var success = await _supplierService.RemoveSupplierDrugAsync(supplierName, drugName);

                
                return Ok(new { message = "Supplier-Drug association removed." });

            }
            catch (Exception ex)
            {
                
                return StatusCode(500, "Something went wrong.");
            }
        }
        [Authorize(Roles = "SupplierAdmin,SuperAdmin")]
        [HttpGet("stocks")]
        public async Task<IActionResult> GetStockAlerts()
        {
            var stockAlerts = await _supplierService.GetStockAlertsAsync();
            if (stockAlerts == null) return NotFound("No stock alerts found.");
            return Ok(stockAlerts);
        }

        [Authorize(Roles = "SupplierAdmin,SuperAdmin")]
        [HttpPut("UpdateStock/{drugname}")]
        public async Task<ActionResult<StockAlert>> PutStockAlert(string drugname, bool stockAlert)
        {
            var updatedStockAlert = await _supplierService.UpdateStockAlertAsync(drugname, stockAlert);

            // If updatedStockAlert is null, it means the alert was deleted after being resolved
            if (updatedStockAlert == null)
            {
                return NoContent();  // Return 204 No Content if deleted
            }

            return Ok(updatedStockAlert);
        }


        [Authorize(Roles = "SupplierAdmin,SuperAdmin")]
        [HttpDelete("DeleteStock/{drugname}")]
        public async Task<ActionResult<StockAlert>> DeleteAlert(string drugname)
        {
            var updatedStockAlert = await _supplierService.DeleteStockAlertAsync(drugname);

            // If updatedStockAlert is null, it means the alert was deleted after being resolved
            if (updatedStockAlert == null)
            {
                return NoContent();  // Return 204 No Content if deleted
            }

            return Ok(updatedStockAlert);
        }



    }
}
