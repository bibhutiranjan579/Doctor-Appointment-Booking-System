using DoctorAppointment.Core.Entities;

namespace DoctorAppointment.Core.Interfaces
{
    public interface IChatMessageRepository : IGenericRepository<ChatMessage>
    {
        Task<IEnumerable<ChatMessage>> GetConversationAsync(Guid userId1, Guid userId2, int page, int pageSize);
        Task<IEnumerable<ChatMessage>> GetUserMessagesAsync(Guid userId);
    }
}
