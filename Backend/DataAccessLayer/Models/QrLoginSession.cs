using System.ComponentModel.DataAnnotations.Schema;

public class QrLoginSession
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string Token { get; set; }
    public string? Email { get; set; }
    public bool IsAuthenticated { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? AuthenticatedAt { get; set; }
}
