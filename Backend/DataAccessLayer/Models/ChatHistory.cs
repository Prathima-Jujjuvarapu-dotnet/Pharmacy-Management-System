using System.ComponentModel.DataAnnotations.Schema;

public class ChatHistory
     {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string UserMessage { get; set; }
        public string BotResponse { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
