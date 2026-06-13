using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Interfaces;
using DoctorAppointment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DoctorAppointment.Infrastructure.Repositories
{
    public class ChatMessageRepository : GenericRepository<ChatMessage>, IChatMessageRepository
    {
        public ChatMessageRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<ChatMessage>> GetConversationAsync(Guid userId1, Guid userId2, int page, int pageSize)
        {
            return await _dbSet
                .Include(c => c.Sender)
                .Include(c => c.Receiver)
                .Where(c =>
                    (c.SenderId == userId1 && c.ReceiverId == userId2) ||
                    (c.SenderId == userId2 && c.ReceiverId == userId1))
                .OrderByDescending(c => c.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .OrderBy(c => c.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<ChatMessage>> GetUserMessagesAsync(Guid userId)
        {
            return await _dbSet
                .Include(c => c.Sender)
                .Include(c => c.Receiver)
                .Where(c => c.SenderId == userId || c.ReceiverId == userId)
                .OrderByDescending(c => c.Timestamp)
                .ToListAsync();
        }
    }
}
