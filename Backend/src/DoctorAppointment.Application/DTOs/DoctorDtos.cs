namespace DoctorAppointment.Application.DTOs
{
    public class DoctorDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public int Experience { get; set; }
        public Guid? HospitalId { get; set; }
        public string? HospitalName { get; set; }
        public string? HospitalLocation { get; set; }
        public string AvailabilitySchedule { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? State { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double? Distance { get; set; }
    }

    public class CreateDoctorDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public int Experience { get; set; }
        public Guid? HospitalId { get; set; }
        public string AvailabilitySchedule { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? State { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }

    public class UpdateDoctorDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public int Experience { get; set; }
        public Guid? HospitalId { get; set; }
        public string AvailabilitySchedule { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? State { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }

    public class NearbySearchDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double RadiusKm { get; set; } = 10;
        public string? Specialization { get; set; }
        public Guid? HospitalId { get; set; }
        public string SortBy { get; set; } = "distance";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
