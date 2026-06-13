using DoctorAppointment.Core.Entities;

namespace DoctorAppointment.Application.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
    }
}
