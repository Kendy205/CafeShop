using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CafeShop.Model
{
    public class FeedbackReply
    {
        [Key]
        public int FeedbackReplyId { get; set; }

        [Required]
        public int FeedbackId { get; set; }

        [Required]
        public int AdminUserId { get; set; }

        [Required]
        public string ReplyContent { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("FeedbackId")]
        public virtual Feedback? Feedback { get; set; }

        [ForeignKey("AdminUserId")]
        public virtual User? AdminUser { get; set; }
    }
}
