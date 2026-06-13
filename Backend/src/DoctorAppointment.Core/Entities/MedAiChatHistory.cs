using System.ComponentModel.DataAnnotations;

namespace DoctorAppointment.Core.Entities
{
    public class MedAiChatHistory : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string ConversationId { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty; // "user" or "assistant"

        [Required]
        public string Content { get; set; } = string.Empty;

        public bool IsEmergency { get; set; }

        public User User { get; set; } = null!;
    }
}
