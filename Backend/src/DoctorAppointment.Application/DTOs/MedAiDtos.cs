namespace DoctorAppointment.Application.DTOs;

public class MedAiChatRequest
{
    public string Message { get; set; } = string.Empty;
    public string? ConversationId { get; set; }
    public List<MedAiMessageDto>? History { get; set; }
}

public class MedAiChatResponse
{
    public string Reply { get; set; } = string.Empty;
    public string ConversationId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsEmergency { get; set; }
}

public class MedAiMessageDto
{
    public string Role { get; set; } = string.Empty; // "user" or "assistant"
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
