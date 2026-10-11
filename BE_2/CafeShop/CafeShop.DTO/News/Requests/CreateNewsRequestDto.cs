using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using System;

namespace CafeShop.DTO.News.Requests
{
    public class CreateNewsRequestDto
    {
        [Required(ErrorMessage = "Tiêu đề không được để trống")]
        [StringLength(255, ErrorMessage = "Tiêu đề không được vượt quá 255 ký tự")]
        public string Title { get; set; } = string.Empty;

        public string? Summary { get; set; }
        
        [Required(ErrorMessage = "Nội dung không được để trống")]
        public string Content { get; set; } = string.Empty;
        
        public IFormFile? ImageFile { get; set; }
        
        [StringLength(50)]
        public string? Status { get; set; }
        
        public DateTime? ScheduledPublishAt { get; set; }
    }
}
