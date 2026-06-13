namespace DoctorAppointment.Application.DTOs
{
    public class PatientDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string MedicalHistory { get; set; } = string.Empty;
    }

    public class UpdatePatientDto
    {
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string MedicalHistory { get; set; } = string.Empty;
    }
}
