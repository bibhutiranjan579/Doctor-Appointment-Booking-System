using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DoctorAppointment.Core.Enums;

namespace DoctorAppointment.Core.Entities
{
    public class Payment : BaseEntity
    {
        [Required]
        public Guid AppointmentId { get; set; }

        [ForeignKey(nameof(AppointmentId))]
        public Appointment Appointment { get; set; } = null!;

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        [Required]
        public PaymentStatus Status { get; set; } = PaymentStatus.Success;

        [MaxLength(100)]
        public string TransactionId { get; set; } = string.Empty;

        /// <summary>
        /// Masked card number (last 4 digits) or UPI ID
        /// </summary>
        [MaxLength(50)]
        public string PaymentDetail { get; set; } = string.Empty;
    }
}
