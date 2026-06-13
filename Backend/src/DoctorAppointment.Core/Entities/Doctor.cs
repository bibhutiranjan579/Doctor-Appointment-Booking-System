using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAppointment.Core.Entities
{
    public class Doctor : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string Specialization { get; set; } = string.Empty;

        public int Experience { get; set; }

        public Guid? HospitalId { get; set; }

        [ForeignKey(nameof(HospitalId))]
        public Hospital? Hospital { get; set; }

        [MaxLength(500)]
        public string AvailabilitySchedule { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? State { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public Guid? AdminUserId { get; set; }

        [ForeignKey(nameof(AdminUserId))]
        public User? AdminUser { get; set; }

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
