using System.ComponentModel.DataAnnotations.Schema;

public class RestockRequest
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string Email{ get; set; }
    public int UserId { get; set; }
    public string DrugName { get; set; }
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
}
