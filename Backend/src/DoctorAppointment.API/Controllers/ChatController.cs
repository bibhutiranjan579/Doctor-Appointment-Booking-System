using System.Security.Claims;
using DoctorAppointment.API.Hubs;
using DoctorAppointment.Application.Common;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Core.Enums;
using DoctorAppointment.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DoctorAppointment.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IAppointmentService _appointmentService;
        private readonly IUserRepository _userRepository;
        private readonly IHubContext<ChatHub> _chatHub;

        public ChatController(IChatService chatService, IAppointmentService appointmentService, IUserRepository userRepository, IHubContext<ChatHub> chatHub)
        {
            _chatService = chatService;
            _appointmentService = appointmentService;
            _userRepository = userRepository;
            _chatHub = chatHub;
        }

        [HttpPost("send")]
        public async Task<ActionResult<ApiResponse<ChatMessageDto>>> SendMessage([FromBody] SendMessageDto dto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var message = await _chatService.SendMessageAsync(userId, dto);

            // Send real-time notification via SignalR to receiver
            await _chatHub.Clients.User(dto.ReceiverId.ToString())
                .SendAsync("ReceiveMessage", message);

            return Ok(ApiResponse<ChatMessageDto>.SuccessResponse(message, "Message sent."));
        }

        [HttpGet("conversation/{otherUserId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ChatMessageDto>>>> GetConversation(
            Guid otherUserId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var messages = await _chatService.GetConversationAsync(userId, otherUserId, page, pageSize);
            return Ok(ApiResponse<IEnumerable<ChatMessageDto>>.SuccessResponse(messages));
        }

        [HttpGet("contacts")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ChatContactDto>>>> GetContacts()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Look up actual role from database to avoid stale JWT issues
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return Ok(ApiResponse<IEnumerable<ChatContactDto>>.SuccessResponse(new List<ChatContactDto>()));

            var isDoctor = user.Role == UserRole.Doctor;

            IEnumerable<AppointmentDto> appointments;
            try
            {
                if (isDoctor)
                    appointments = await _appointmentService.GetByDoctorUserIdAsync(userId);
                else
                    appointments = await _appointmentService.GetByPatientUserIdAsync(userId);
            }
            catch (KeyNotFoundException)
            {
                return Ok(ApiResponse<IEnumerable<ChatContactDto>>.SuccessResponse(new List<ChatContactDto>()));
            }

            // Only approved/completed appointments allow chat
            var approvedAppts = appointments.Where(a =>
                a.Status == AppointmentStatus.Approved || a.Status == AppointmentStatus.Completed);

            // Group by user, determine if any active (approved) appointment exists
            var contacts = approvedAppts
                .GroupBy(a => isDoctor ? a.PatientUserId : a.DoctorUserId)
                .Select(g =>
                {
                    var hasApproved = g.Any(a => a.Status == AppointmentStatus.Approved);
                    var first = g.First();
                    return isDoctor
                        ? new ChatContactDto { UserId = first.PatientUserId, Name = first.PatientName, Role = "Patient", AppointmentId = first.Id, Specialization = "", CanChat = hasApproved }
                        : new ChatContactDto { UserId = first.DoctorUserId, Name = "Dr. " + first.DoctorName, Role = "Doctor", AppointmentId = first.Id, Specialization = first.Specialization, CanChat = hasApproved };
                })
                .ToList();

            return Ok(ApiResponse<IEnumerable<ChatContactDto>>.SuccessResponse(contacts));
        }
    }
}
