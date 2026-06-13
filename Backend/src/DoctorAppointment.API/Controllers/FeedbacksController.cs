using System.Security.Claims;
using DoctorAppointment.Application.Common;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoctorAppointment.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FeedbacksController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;
        private readonly IDoctorService _doctorService;

        public FeedbacksController(IFeedbackService feedbackService, IDoctorService doctorService)
        {
            _feedbackService = feedbackService;
            _doctorService = doctorService;
        }

        [HttpPost]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<ApiResponse<FeedbackDto>>> Create([FromBody] CreateFeedbackDto dto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var feedback = await _feedbackService.CreateAsync(dto, userId);
            return Ok(ApiResponse<FeedbackDto>.SuccessResponse(feedback, "Feedback submitted successfully."));
        }

        [HttpGet("doctor/{doctorId}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<DoctorRatingSummaryDto>>> GetDoctorSummary(Guid doctorId)
        {
            var summary = await _feedbackService.GetDoctorRatingSummaryAsync(doctorId);
            return Ok(ApiResponse<DoctorRatingSummaryDto>.SuccessResponse(summary));
        }

        [HttpGet("my")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FeedbackDto>>>> GetMyFeedbacks()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var feedbacks = await _feedbackService.GetByPatientAsync(userId);
            return Ok(ApiResponse<IEnumerable<FeedbackDto>>.SuccessResponse(feedbacks));
        }

        [HttpGet("doctor-view")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult<ApiResponse<DoctorRatingSummaryDto>>> GetMyDoctorFeedback([FromQuery] string? sortBy)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var doctor = await _doctorService.GetByUserIdAsync(userId);
            var summary = await _feedbackService.GetDoctorRatingSummaryAsync(doctor.Id);
            return Ok(ApiResponse<DoctorRatingSummaryDto>.SuccessResponse(summary));
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FeedbackDto>>>> GetAdminFeedbacks()
        {
            var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var feedbacks = await _feedbackService.GetByAdminAsync(adminId);
            return Ok(ApiResponse<IEnumerable<FeedbackDto>>.SuccessResponse(feedbacks));
        }

        [HttpGet("admin/analytics")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<AdminFeedbackAnalyticsDto>>> GetAdminAnalytics()
        {
            var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var analytics = await _feedbackService.GetAdminAnalyticsAsync(adminId);
            return Ok(ApiResponse<AdminFeedbackAnalyticsDto>.SuccessResponse(analytics));
        }

        [HttpPut("{id}/moderate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<FeedbackDto>>> Moderate(Guid id, [FromBody] ModerateFeedbackRequest request)
        {
            var feedback = await _feedbackService.ModerateAsync(id, request.Status);
            return Ok(ApiResponse<FeedbackDto>.SuccessResponse(feedback, "Feedback moderated."));
        }
    }

    public class ModerateFeedbackRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
