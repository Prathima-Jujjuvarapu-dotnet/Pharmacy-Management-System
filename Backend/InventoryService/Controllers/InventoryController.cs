using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InventoryService.Service;
using PharmacyManagement.Models;

namespace InventoryService.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }
        [Authorize(Roles = "SupplierAdmin,SuperAdmin")]
        [HttpGet("GetAllInventory")]
        public async Task<IActionResult> GetAllInventory()
        {
            return Ok(await _inventoryService.GetInventoryAsync());
        }

        
        [Authorize(Roles = "SupplierAdmin,SuperAdmin")]
        [HttpGet("GetInventoryByDrug/{drugName}")]
        public async Task<IActionResult> GetInventoryByDrug(string drugName)
        {
            var inventory = await _inventoryService.GetInventoryByDrugNameAsync(drugName);
            if (inventory == null) return NotFound("Inventory not found.");
            return Ok(inventory);
        }

        
        [Authorize(Roles = "SupplierAdmin")]
        [HttpPut("UpdateStock/{drugName}")]
        public async Task<IActionResult> UpdateStock(string drugName, [FromBody] int stockQuantity)
        {
            var updatedInventory = await _inventoryService.UpdateStockAsync(drugName, stockQuantity);
            if (updatedInventory == null) return NotFound("Inventory not found.");
            return Ok(updatedInventory);
        }

        
        [Authorize(Roles = "SupplierAdmin")]
        [HttpPut("UpdatePrice/{drugName}")]
        public async Task<IActionResult> UpdatePrice(string drugName, [FromBody] double pricePerUnit)
        {
            var updatedInventory = await _inventoryService.UpdatePriceAsync(drugName, pricePerUnit);
            if (updatedInventory == null) return NotFound("Inventory not found.");
            return Ok(updatedInventory);
        }

        
        [Authorize(Roles = "SupplierAdmin")]
        [HttpPut("UpdateExpiry/{drugName}")]
        public async Task<IActionResult> UpdateExpiry(string drugName, [FromBody] DateTime expiryDate)
        {
            var updatedInventory = await _inventoryService.UpdateExpiryDateAsync(drugName, expiryDate);
            if (updatedInventory == null) return NotFound("Inventory not found.");
            return Ok(updatedInventory);
        }


    }

}


