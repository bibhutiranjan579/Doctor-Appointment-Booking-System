using AutoMapper;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Enums;
using DoctorAppointment.Core.Interfaces;

namespace DoctorAppointment.Application.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IGenericRepository<Feedback> _feedbackRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly ISentimentAnalysisService _sentimentService;
        private readonly IMapper _mapper;

        public FeedbackService(
            IGenericRepository<Feedback> feedbackRepository,
            IAppointmentRepository appointmentRepository,
            IPatientRepository patientRepository,
            IDoctorRepository doctorRepository,
            ISentimentAnalysisService sentimentService,
            IMapper mapper)
        {
            _feedbackRepository = feedbackRepository;
            _appointmentRepository = appointmentRepository;
            _patientRepository = patientRepository;
            _doctorRepository = doctorRepository;
            _sentimentService = sentimentService;
            _mapper = mapper;
        }

        public async Task<FeedbackDto> CreateAsync(CreateFeedbackDto dto, Guid patientUserId)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId)
                ?? throw new KeyNotFoundException("Appointment not found.");

            if (appointment.Status != AppointmentStatus.Completed)
                throw new InvalidOperationException("You can only leave feedback for completed appointments.");

            var patient = await _patientRepository.GetByUserIdAsync(patientUserId)
                ?? throw new KeyNotFoundException("Patient not found.");

            if (appointment.PatientId != patient.Id)
                throw new InvalidOperationException("You can only leave feedback for your own appointments.");

            var existing = await _feedbackRepository.FindAsync(f => f.AppointmentId == dto.AppointmentId);
            if (existing.Any())
                throw new InvalidOperationException("Feedback already submitted for this appointment.");

            // Sentiment analysis & spam detection
            var sentiment = _sentimentService.AnalyzeSentiment(dto.Comment);
            var isFlagged = _sentimentService.DetectSpam(dto.Comment, dto.Rating);

            var feedback = new Feedback
            {
                AppointmentId = dto.AppointmentId,
                PatientId = patient.Id,
                DoctorId = appointment.DoctorId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                Tags = string.Join(",", dto.Tags ?? new List<string>()),
                IsAnonymous = dto.IsAnonymous,
                Sentiment = sentiment,
                IsFlagged = isFlagged,
                ModerationStatus = isFlagged ? "Pending" : "Approved"
            };

            await _feedbackRepository.AddAsync(feedback);
            return await BuildFeedbackDto(feedback);
        }

        public async Task<IEnumerable<FeedbackDto>> GetByDoctorAsync(Guid doctorId, string? sortBy = null)
        {
            var feedbacks = await _feedbackRepository.FindAsync(f => f.DoctorId == doctorId && f.ModerationStatus == "Approved");
            var sorted = sortBy switch
            {
                "highest" => feedbacks.OrderByDescending(f => f.Rating),
                "lowest" => feedbacks.OrderBy(f => f.Rating),
                _ => feedbacks.OrderByDescending(f => f.CreatedAt)
            };

            var result = new List<FeedbackDto>();
            foreach (var f in sorted)
                result.Add(await BuildFeedbackDto(f));
            return result;
        }

        public async Task<IEnumerable<FeedbackDto>> GetByPatientAsync(Guid patientUserId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(patientUserId);
            if (patient == null) return Enumerable.Empty<FeedbackDto>();

            var feedbacks = await _feedbackRepository.FindAsync(f => f.PatientId == patient.Id);
            var result = new List<FeedbackDto>();
            foreach (var f in feedbacks.OrderByDescending(f => f.CreatedAt))
                result.Add(await BuildFeedbackDto(f));
            return result;
        }

        public async Task<DoctorRatingSummaryDto> GetDoctorRatingSummaryAsync(Guid doctorId)
        {
            var doctor = await _doctorRepository.GetByIdAsync(doctorId)
                ?? throw new KeyNotFoundException("Doctor not found.");

            var feedbacks = await _feedbackRepository.FindAsync(f => f.DoctorId == doctorId && f.ModerationStatus == "Approved");
            var feedbackList = feedbacks.ToList();

            var dtos = new List<FeedbackDto>();
            foreach (var f in feedbackList.OrderByDescending(f => f.CreatedAt))
                dtos.Add(await BuildFeedbackDto(f));

            // Rating distribution
            var distribution = new Dictionary<int, int> { {1,0}, {2,0}, {3,0}, {4,0}, {5,0} };
            foreach (var f in feedbackList)
                distribution[f.Rating]++;

            // Sentiment summary
            var sentimentSummary = new SentimentSummaryDto
            {
                Positive = feedbackList.Count(f => f.Sentiment == "Positive"),
                Neutral = feedbackList.Count(f => f.Sentiment == "Neutral"),
                Negative = feedbackList.Count(f => f.Sentiment == "Negative")
            };

            // Top keywords
            var allKeywords = feedbackList
                .SelectMany(f => _sentimentService.ExtractKeywords(f.Comment))
                .GroupBy(k => k)
                .OrderByDescending(g => g.Count())
                .Take(10)
                .Select(g => g.Key)
                .ToList();

            return new DoctorRatingSummaryDto
            {
                DoctorId = doctorId,
                DoctorName = doctor.User?.Name ?? string.Empty,
                Specialization = doctor.Specialization,
                AverageRating = feedbackList.Count > 0 ? feedbackList.Average(f => f.Rating) : 0,
                TotalReviews = feedbackList.Count,
                RatingDistribution = distribution,
                SentimentSummary = sentimentSummary,
                TopKeywords = allKeywords,
                Feedbacks = dtos
            };
        }

        public async Task<IEnumerable<FeedbackDto>> GetByAdminAsync(Guid adminUserId)
        {
            var adminDoctors = await _doctorRepository.FindAsync(d => d.AdminUserId == adminUserId);
            var doctorIds = adminDoctors.Select(d => d.Id).ToHashSet();

            var allFeedbacks = await _feedbackRepository.GetAllAsync();
            var filtered = allFeedbacks.Where(f => doctorIds.Contains(f.DoctorId)).OrderByDescending(f => f.CreatedAt);

            var result = new List<FeedbackDto>();
            foreach (var f in filtered)
                result.Add(await BuildFeedbackDto(f));
            return result;
        }

        public async Task<AdminFeedbackAnalyticsDto> GetAdminAnalyticsAsync(Guid adminUserId)
        {
            var adminDoctors = await _doctorRepository.FindAsync(d => d.AdminUserId == adminUserId);
            var doctorIds = adminDoctors.Select(d => d.Id).ToHashSet();
            var doctorMap = adminDoctors.ToDictionary(d => d.Id, d => d.User?.Name ?? string.Empty);

            var allFeedbacks = await _feedbackRepository.GetAllAsync();
            var feedbacks = allFeedbacks.Where(f => doctorIds.Contains(f.DoctorId)).ToList();

            var distribution = new Dictionary<int, int> { {1,0}, {2,0}, {3,0}, {4,0}, {5,0} };
            foreach (var f in feedbacks) distribution[f.Rating]++;

            var sentimentSummary = new SentimentSummaryDto
            {
                Positive = feedbacks.Count(f => f.Sentiment == "Positive"),
                Neutral = feedbacks.Count(f => f.Sentiment == "Neutral"),
                Negative = feedbacks.Count(f => f.Sentiment == "Negative")
            };

            // Doctor performance
            var doctorGroups = feedbacks.GroupBy(f => f.DoctorId).ToList();
            var performances = doctorGroups.Select(g => new DoctorPerformanceDto
            {
                DoctorId = g.Key,
                DoctorName = doctorMap.GetValueOrDefault(g.Key, "Unknown"),
                AverageRating = g.Average(f => f.Rating),
                ReviewCount = g.Count()
            }).ToList();

            // Monthly trends (last 6 months)
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
            var monthlyTrends = feedbacks
                .Where(f => f.CreatedAt >= sixMonthsAgo)
                .GroupBy(f => new { f.CreatedAt.Year, f.CreatedAt.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new MonthlyTrendDto
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    ReviewCount = g.Count(),
                    AverageRating = g.Average(f => f.Rating)
                }).ToList();

            // Top keywords
            var topKeywords = feedbacks
                .SelectMany(f => _sentimentService.ExtractKeywords(f.Comment))
                .GroupBy(k => k)
                .OrderByDescending(g => g.Count())
                .Take(15)
                .Select(g => g.Key)
                .ToList();

            // Build recent + flagged DTOs
            var recentDtos = new List<FeedbackDto>();
            foreach (var f in feedbacks.OrderByDescending(f => f.CreatedAt).Take(10))
                recentDtos.Add(await BuildFeedbackDto(f));

            var flaggedDtos = new List<FeedbackDto>();
            foreach (var f in feedbacks.Where(f => f.IsFlagged).OrderByDescending(f => f.CreatedAt))
                flaggedDtos.Add(await BuildFeedbackDto(f));

            return new AdminFeedbackAnalyticsDto
            {
                TotalReviews = feedbacks.Count,
                PlatformAverageRating = feedbacks.Count > 0 ? feedbacks.Average(f => f.Rating) : 0,
                UniqueDoctorsRated = feedbacks.Select(f => f.DoctorId).Distinct().Count(),
                UniquePatientsReviewed = feedbacks.Select(f => f.PatientId).Distinct().Count(),
                SentimentSummary = sentimentSummary,
                FlaggedReviews = feedbacks.Count(f => f.IsFlagged),
                TopDoctors = performances.OrderByDescending(p => p.AverageRating).Take(5).ToList(),
                LowRatedDoctors = performances.Where(p => p.AverageRating < 3).OrderBy(p => p.AverageRating).Take(5).ToList(),
                RatingDistribution = distribution,
                MonthlyTrends = monthlyTrends,
                TopKeywords = topKeywords,
                RecentFeedbacks = recentDtos,
                FlaggedFeedbacks = flaggedDtos
            };
        }

        public async Task<FeedbackDto> ModerateAsync(Guid feedbackId, string status)
        {
            var feedback = await _feedbackRepository.GetByIdAsync(feedbackId)
                ?? throw new KeyNotFoundException("Feedback not found.");

            feedback.ModerationStatus = status;
            feedback.UpdatedAt = DateTime.UtcNow;
            await _feedbackRepository.UpdateAsync(feedback);

            return await BuildFeedbackDto(feedback);
        }

        private async Task<FeedbackDto> BuildFeedbackDto(Feedback feedback)
        {
            var doctor = await _doctorRepository.GetByIdAsync(feedback.DoctorId);
            var patient = await _patientRepository.GetByIdAsync(feedback.PatientId);

            return new FeedbackDto
            {
                Id = feedback.Id,
                AppointmentId = feedback.AppointmentId,
                PatientId = feedback.PatientId,
                PatientName = feedback.IsAnonymous ? "Anonymous" : (patient?.User?.Name ?? string.Empty),
                DoctorId = feedback.DoctorId,
                DoctorName = doctor?.User?.Name ?? string.Empty,
                Rating = feedback.Rating,
                Comment = feedback.Comment,
                Tags = string.IsNullOrEmpty(feedback.Tags) ? new List<string>() : feedback.Tags.Split(',').ToList(),
                IsAnonymous = feedback.IsAnonymous,
                Sentiment = feedback.Sentiment,
                IsFlagged = feedback.IsFlagged,
                ModerationStatus = feedback.ModerationStatus,
                CreatedAt = feedback.CreatedAt
            };
        }
    }
}
