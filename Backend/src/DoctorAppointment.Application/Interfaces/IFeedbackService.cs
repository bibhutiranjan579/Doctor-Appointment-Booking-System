using DoctorAppointment.Application.DTOs;

namespace DoctorAppointment.Application.Interfaces
{
    public interface IFeedbackService
    {
        Task<FeedbackDto> CreateAsync(CreateFeedbackDto dto, Guid patientUserId);
        Task<IEnumerable<FeedbackDto>> GetByDoctorAsync(Guid doctorId, string? sortBy = null);
        Task<IEnumerable<FeedbackDto>> GetByPatientAsync(Guid patientUserId);
        Task<DoctorRatingSummaryDto> GetDoctorRatingSummaryAsync(Guid doctorId);
        Task<IEnumerable<FeedbackDto>> GetByAdminAsync(Guid adminUserId);
        Task<AdminFeedbackAnalyticsDto> GetAdminAnalyticsAsync(Guid adminUserId);
        Task<FeedbackDto> ModerateAsync(Guid feedbackId, string status);
    }
}
