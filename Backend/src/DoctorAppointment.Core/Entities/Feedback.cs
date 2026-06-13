using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAppointment.Core.Entities
{
    public class Feedback : BaseEntity
    {
        [Required]
        public Guid AppointmentId { get; set; }

        [ForeignKey(nameof(AppointmentId))]
        public Appointment Appointment { get; set; } = null!;

        [Required]
        public Guid PatientId { get; set; }

        [ForeignKey(nameof(PatientId))]
        public Patient Patient { get; set; } = null!;

        [Required]
        public Guid DoctorId { get; set; }

        [ForeignKey(nameof(DoctorId))]
        public Doctor Doctor { get; set; } = null!;

        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string Comment { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Tags { get; set; } = string.Empty;

        public bool IsAnonymous { get; set; }

        [MaxLength(20)]
        public string Sentiment { get; set; } = string.Empty;

        public bool IsFlagged { get; set; }

        [MaxLength(20)]
        public string ModerationStatus { get; set; } = "Approved";
    }
}
