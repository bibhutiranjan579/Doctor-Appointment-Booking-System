namespace DoctorAppointment.Application.DTOs
{
    public class ChatMessageDto
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public Guid ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class SendMessageDto
    {
        public Guid ReceiverId { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class ChatContactDto
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public Guid AppointmentId { get; set; }
        public string Specialization { get; set; } = string.Empty;
        public bool CanChat { get; set; } = true;
    }
}
