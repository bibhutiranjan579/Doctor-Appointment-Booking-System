using System.ComponentModel.DataAnnotations;

namespace DoctorAppointment.Core.Entities;

public class ChatConversation : BaseEntity
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = "New Chat";

    public bool IsActive { get; set; } = true;

    public User User { get; set; } = null!;
    public ICollection<AiChatMessage> Messages { get; set; } = new List<AiChatMessage>();
}
