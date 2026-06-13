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
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        private readonly IUserRepository _userRepository;
        private readonly IHubContext<NotificationHub> _notificationHub;

        public AppointmentsController(IAppointmentService appointmentService, IUserRepository userRepository, IHubContext<NotificationHub> notificationHub)
        {
            _appointmentService = appointmentService;
            _userRepository = userRepository;
            _notificationHub = notificationHub;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<PagedResult<AppointmentDto>>>> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] AppointmentStatus? status = null)
        {
            var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _appointmentService.GetAppointmentsAsync(page, pageSize, status: status, adminUserId: adminId);
            return Ok(ApiResponse<PagedResult<AppointmentDto>>.SuccessResponse(result));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<AppointmentDto>>> GetById(Guid id)
        {
            var appointment = await _appointmentService.GetByIdAsync(id);
            return Ok(ApiResponse<AppointmentDto>.SuccessResponse(appointment));
        }

        [HttpGet("my-appointments")]
        public async Task<ActionResult<ApiResponse<IEnumerable<AppointmentDto>>>> GetMyAppointments()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Look up actual role from database to avoid stale JWT issues
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return Ok(ApiResponse<IEnumerable<AppointmentDto>>.SuccessResponse(Array.Empty<AppointmentDto>()));

            IEnumerable<AppointmentDto> appointments;
            try
            {
                if (user.Role == UserRole.Doctor)
                    appointments = await _appointmentService.GetByDoctorUserIdAsync(userId);
                else
                    appointments = await _appointmentService.GetByPatientUserIdAsync(userId);
            }
            catch (KeyNotFoundException)
            {
                return Ok(ApiResponse<IEnumerable<AppointmentDto>>.SuccessResponse(Array.Empty<AppointmentDto>()));
            }

            return Ok(ApiResponse<IEnumerable<AppointmentDto>>.SuccessResponse(appointments));
        }

        [HttpPost]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<ApiResponse<AppointmentDto>>> Create([FromBody] CreateAppointmentDto dto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var appointment = await _appointmentService.CreateAsync(userId, dto);

            // Notify doctor via SignalR (use DoctorUserId, not DoctorId)
            await _notificationHub.Clients.User(appointment.DoctorUserId.ToString())
                .SendAsync("ReceiveNotification", new { message = $"New appointment request from {appointment.PatientName}", appointmentId = appointment.Id });

            return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, ApiResponse<AppointmentDto>.SuccessResponse(appointment, "Appointment booked."));
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<ActionResult<ApiResponse<AppointmentDto>>> UpdateStatus(Guid id, [FromBody] UpdateAppointmentStatusDto dto)
        {
            var appointment = await _appointmentService.UpdateStatusAsync(id, dto);

            // Notify patient via SignalR (use PatientUserId, not PatientId)
            var statusLabels = new[] { "Pending", "Approved", "Rejected", "Completed" };
            var statusLabel = (int)dto.Status < statusLabels.Length ? statusLabels[(int)dto.Status] : dto.Status.ToString();
            await _notificationHub.Clients.User(appointment.PatientUserId.ToString())
                .SendAsync("ReceiveNotification", new { message = $"Your appointment has been {statusLabel}", appointmentId = appointment.Id });

            return Ok(ApiResponse<AppointmentDto>.SuccessResponse(appointment, "Appointment status updated."));
        }
    }
}
