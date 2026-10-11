using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CafeShop.Model
{
    public class FeedbackImage
    {
        [Key]
        public int FeedbackImageId { get; set; }

        [Required]
        public int FeedbackId { get; set; }

        [Required]
        public string ImageUrl { get; set; }

        public string? ImagePublicId { get; set; } // Dành cho Cloudinary xóa ảnh

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("FeedbackId")]
        public virtual Feedback? Feedback { get; set; }
    }
}
