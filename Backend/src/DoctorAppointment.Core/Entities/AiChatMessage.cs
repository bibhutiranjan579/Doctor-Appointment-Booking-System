using System.ComponentModel.DataAnnotations;

namespace DoctorAppointment.Core.Entities;

public class AiChatMessage : BaseEntity
{
    [Required]
    public Guid ConversationId { get; set; }

    [Required]
    [MaxLength(10)]
    public string Sender { get; set; } = string.Empty; // "user" or "assistant"

    [Required]
    public string Message { get; set; } = string.Empty;

    public bool IsEmergency { get; set; }

    public ChatConversation Conversation { get; set; } = null!;
}
