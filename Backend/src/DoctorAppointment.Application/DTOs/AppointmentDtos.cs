using DoctorAppointment.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace DoctorAppointment.Application.DTOs
{
    public class AppointmentDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public Guid PatientUserId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid DoctorId { get; set; }
        public Guid DoctorUserId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public AppointmentStatus Status { get; set; }
        public string Notes { get; set; } = string.Empty;
        public PaymentInfoDto? Payment { get; set; }
    }

    public class CreateAppointmentDto
    {
        public Guid DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Notes { get; set; } = string.Empty;

        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        [Required]
        [Range(0.01, 100000)]
        public decimal Amount { get; set; }

        /// <summary>
        /// Masked card last 4 digits or UPI ID
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string PaymentDetail { get; set; } = string.Empty;
    }

    public class UpdateAppointmentStatusDto
    {
        public AppointmentStatus Status { get; set; }
    }

    public class PaymentInfoDto
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string PaymentDetail { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
