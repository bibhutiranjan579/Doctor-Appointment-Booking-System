namespace DoctorAppointment.Application.DTOs
{
    public class FeedbackDto
    {
        public Guid Id { get; set; }
        public Guid AppointmentId { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public bool IsAnonymous { get; set; }
        public string Sentiment { get; set; } = string.Empty;
        public bool IsFlagged { get; set; }
        public string ModerationStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateFeedbackDto
    {
        public Guid AppointmentId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public bool IsAnonymous { get; set; }
    }

    public class DoctorRatingSummaryDto
    {
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new();
        public SentimentSummaryDto SentimentSummary { get; set; } = new();
        public List<string> TopKeywords { get; set; } = new();
        public List<FeedbackDto> Feedbacks { get; set; } = new();
    }

    public class SentimentSummaryDto
    {
        public int Positive { get; set; }
        public int Neutral { get; set; }
        public int Negative { get; set; }
    }

    public class AdminFeedbackAnalyticsDto
    {
        public int TotalReviews { get; set; }
        public double PlatformAverageRating { get; set; }
        public int UniqueDoctorsRated { get; set; }
        public int UniquePatientsReviewed { get; set; }
        public SentimentSummaryDto SentimentSummary { get; set; } = new();
        public int FlaggedReviews { get; set; }
        public List<DoctorPerformanceDto> TopDoctors { get; set; } = new();
        public List<DoctorPerformanceDto> LowRatedDoctors { get; set; } = new();
        public Dictionary<int, int> RatingDistribution { get; set; } = new();
        public List<MonthlyTrendDto> MonthlyTrends { get; set; } = new();
        public List<string> TopKeywords { get; set; } = new();
        public List<FeedbackDto> RecentFeedbacks { get; set; } = new();
        public List<FeedbackDto> FlaggedFeedbacks { get; set; } = new();
    }

    public class DoctorPerformanceDto
    {
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
    }

    public class MonthlyTrendDto
    {
        public string Month { get; set; } = string.Empty;
        public int ReviewCount { get; set; }
        public double AverageRating { get; set; }
    }
}
