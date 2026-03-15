using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
    public class Drug
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DrugId { get; set; }
        public string Name { get; set; }
        public double Price { get; set; }
        public string Manufacturer { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }
        public string Image { get; set; }
        public double Rating { get; set; }
        public int ReviewCount { get; set; }            
        public string Ingredients { get; set; }         
        public string Storage { get; set; }             
        public string Warnings { get; set; }            
        public string QuantityPerPack { get; set; }     
        public DateTime ExpiryDate { get; set; }        
        public bool PrescriptionRequired { get; set; }  
        public string Category { get; set; }            
        public string Usage { get; set; }               

    }


}
