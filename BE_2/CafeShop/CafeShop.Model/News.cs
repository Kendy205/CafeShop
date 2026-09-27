using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class News
    {
        [Key]
        public int NewsId { get; set; }
        public int UserId { get; set; }
        
        [StringLength(255)]
        public string? Title { get; set; }
        
        [StringLength(255)]
        public string? Slug { get; set; }
        
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        
        [StringLength(50)]
        public string? Status { get; set; } = "DRAFT"; // DRAFT, SCHEDULED, PUBLISHED, ARCHIVED
        
        public DateTime? ScheduledPublishAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        public bool IsDeleted { get; set; } = false;
        public int ViewCount { get; set; } = 0;
        
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}
