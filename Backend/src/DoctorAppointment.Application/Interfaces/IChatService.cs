using DoctorAppointment.Application.DTOs;

namespace DoctorAppointment.Application.Interfaces
{
    public interface IChatService
    {
        Task<ChatMessageDto> SendMessageAsync(Guid senderUserId, SendMessageDto dto);
        Task<IEnumerable<ChatMessageDto>> GetConversationAsync(Guid userId1, Guid userId2, int page, int pageSize);
    }
}
