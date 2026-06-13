using AutoMapper;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Interfaces;

namespace DoctorAppointment.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IChatMessageRepository _chatRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public ChatService(IChatMessageRepository chatRepository, IUserRepository userRepository, IMapper mapper)
        {
            _chatRepository = chatRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<ChatMessageDto> SendMessageAsync(Guid senderUserId, SendMessageDto dto)
        {
            var sender = await _userRepository.GetByIdAsync(senderUserId)
                ?? throw new KeyNotFoundException("Sender not found.");
            var receiver = await _userRepository.GetByIdAsync(dto.ReceiverId)
                ?? throw new KeyNotFoundException("Receiver not found.");

            var message = new ChatMessage
            {
                SenderId = senderUserId,
                ReceiverId = dto.ReceiverId,
                Message = dto.Message,
                Timestamp = DateTime.UtcNow
            };

            await _chatRepository.AddAsync(message);

            return new ChatMessageDto
            {
                Id = message.Id,
                SenderId = message.SenderId,
                SenderName = sender.Name,
                ReceiverId = message.ReceiverId,
                ReceiverName = receiver.Name,
                Message = message.Message,
                Timestamp = message.Timestamp
            };
        }

        public async Task<IEnumerable<ChatMessageDto>> GetConversationAsync(Guid userId1, Guid userId2, int page, int pageSize)
        {
            var messages = await _chatRepository.GetConversationAsync(userId1, userId2, page, pageSize);
            return _mapper.Map<IEnumerable<ChatMessageDto>>(messages);
        }
    }
}
