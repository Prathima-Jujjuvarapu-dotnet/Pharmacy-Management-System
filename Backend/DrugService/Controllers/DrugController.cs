using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DrugService.Service;
using PharmacyManagement.Models;
using PharmacyManagement.Data;
using Microsoft.EntityFrameworkCore;

namespace DrugService.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DrugController : ControllerBase
    {
        private readonly IDrugService _drugService;
        private readonly Pharmacy _context;

        public DrugController(IDrugService drugService,Pharmacy pharmacy)
        {
            _drugService = drugService;
            _context = pharmacy;
        }

       
        [Authorize(Roles = "Doctor,DrugAdmin,SuperAdmin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllDrugs()
        {
            return Ok(await _drugService.GetAllDrugsAsync());
        }

       
        [Authorize(Roles = "Doctor,DrugAdmin,SuperAdmin")]
        [HttpGet("{name}")]
        public async Task<IActionResult> GetDrugByName(string name)
        {
            var drug = await _drugService.GetDrugByNameAsync(name);
            if (drug == null) return NotFound($"Drug '{name}' not found.");
            return Ok(drug);
        }
        [AllowAnonymous]
        [HttpGet("available-drugs")]
        public async Task<IActionResult> GetAvailableDrugs()
        {
            var drugs = await _drugService.GetAvailableDrugsAsync();
            return Ok(drugs);
        }

       
        [Authorize(Roles = "DrugAdmin,SuperAdmin")]
        [HttpPost("add")]
        public async Task<IActionResult> AddDrug([FromBody] Drug drug)
        {
            return Ok(await _drugService.AddDrugAsync(drug));
        }

        
        [Authorize(Roles = "DrugAdmin,SuperAdmin")]
        [HttpPut("update/{name}")]
        public async Task<IActionResult> UpdateDrug(string name, [FromBody] UpdateDrugModel model)
        {
            var drug = await _drugService.UpdateDrugAsync(name, model);
            if (drug == null) return NotFound($"Drug '{name}' not found.");
            return Ok(drug);
        }

       
        [Authorize(Roles = "DrugAdmin,SuperAdmin")]
        [HttpDelete("delete/{name}")]
        public async Task<IActionResult> DeleteDrug(string name)
        {
            var result = await _drugService.DeleteDrugAsync(name);
            if (!result)
                return NotFound(new { message = $"Drug '{name}' not found." });

            return Ok(new { message = $"Drug '{name}' deleted successfully." });
        }
        [HttpGet("details/{id}")]
        public async Task<IActionResult> GetDrugById(int id)
        {
            var drug = await _context.Drugs.FindAsync(id);
            if (drug == null)
            {
                return NotFound();
            }
            return Ok(drug);
        }
        [HttpPost("add-review")]
        public async Task<IActionResult> AddReview([FromBody] Review review)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Optional: Validate if drug exists by name
            var drug = await _context.Drugs.FirstOrDefaultAsync(d => d.Name == review.DrugName);
            if (drug == null) return NotFound("Drug not found");

            review.Date = DateTime.UtcNow;

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // ✅ Update rating and review count using DrugName
            var reviews = await _context.Reviews.Where(r => r.DrugName == review.DrugName).ToListAsync();
            drug.ReviewCount = reviews.Count;
            drug.Rating = reviews.Average(r => r.Rating);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Review added successfully", review });
        }


        [HttpGet("drug-review/{drugName}")]
        public async Task<IActionResult> GetReviewsForDrug(string drugName)
        {
            var reviews = await _context.Reviews
                .Where(r => r.DrugName == drugName)
                .OrderByDescending(r => r.Date)
                .ToListAsync();

            return Ok(reviews);
        }



        // ✅ Optional: Get average rating and count
        [HttpGet("summary/{drugName}")]
        public async Task<IActionResult> GetReviewSummary(string drugName)
        {
            var reviews = await _context.Reviews
                .Where(r => r.DrugName == drugName)
                .ToListAsync();

            if (!reviews.Any())
                return Ok(new { rating = 0, count = 0 });

            var avgRating = reviews.Average(r => r.Rating);
            var count = reviews.Count;

            return Ok(new { rating = avgRating, count });
        }


    }
}
