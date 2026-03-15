using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using PharmacyManagement.Models;

public class Review
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ReviewId { get; set; }
        public string UserEmail { get; set; }
        public string DrugName{ get; set; }
        public string Comment { get; set; }

        [Range(1, 5)]
        public double Rating { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;

    }
