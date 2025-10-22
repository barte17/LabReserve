using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        [MaxLength(450)]
        public string UserId { get; set; }
        
        [MaxLength(256)]
        public string UserEmail { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Action { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string EntityType { get; set; }
        
        public int? EntityId { get; set; }
        
        [MaxLength(500)]
        public string Details { get; set; }
    }
}