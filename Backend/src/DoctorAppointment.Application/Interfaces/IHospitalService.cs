using DoctorAppointment.Application.DTOs;

namespace DoctorAppointment.Application.Interfaces
{
    public interface IHospitalService
    {
        Task<HospitalDto> GetByIdAsync(Guid id);
        Task<IEnumerable<HospitalDto>> GetAllAsync();
        Task<IEnumerable<HospitalDto>> GetByAdminAsync(Guid adminUserId);
        Task<IEnumerable<HospitalDto>> SearchNearbyAsync(double lat, double lng, double radiusKm);
        Task<HospitalDto> CreateAsync(CreateHospitalDto dto, Guid? adminUserId = null);
        Task<HospitalDto> UpdateAsync(Guid id, UpdateHospitalDto dto);
        Task DeleteAsync(Guid id);
    }
}
