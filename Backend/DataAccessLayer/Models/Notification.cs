using System.ComponentModel.DataAnnotations.Schema;

public class Notification
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string Email{ get; set; }
    public int UserId { get; set; } // Target user (admin/pharmacist)
    public string Message { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
