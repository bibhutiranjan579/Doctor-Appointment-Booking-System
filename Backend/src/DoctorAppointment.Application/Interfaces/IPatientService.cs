using DoctorAppointment.Application.DTOs;

namespace DoctorAppointment.Application.Interfaces
{
    public interface IPatientService
    {
        Task<PatientDto> GetByIdAsync(Guid id);
        Task<PatientDto> GetByUserIdAsync(Guid userId);
        Task<PatientDto> UpdatePatientAsync(Guid userId, UpdatePatientDto dto);
        Task<IEnumerable<PatientDto>> GetAllAsync();
        Task<IEnumerable<PatientDto>> GetByAdminAsync(Guid adminUserId);
    }
}
