using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmacyManagement.Models
{
    public class StockAlert
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string DrugName { get; set; }

        public string Image { get; set; }
        public string Message { get; set; }
        public DateTime AlertDate { get; set; }
        public bool IsResolved { get; set; }
    }
}
