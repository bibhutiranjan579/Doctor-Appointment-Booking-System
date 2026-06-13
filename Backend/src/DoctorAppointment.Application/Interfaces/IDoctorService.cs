using DoctorAppointment.Application.Common;
using DoctorAppointment.Application.DTOs;

namespace DoctorAppointment.Application.Interfaces
{
    public interface IDoctorService
    {
        Task<DoctorDto> GetByIdAsync(Guid id);
        Task<DoctorDto> GetByUserIdAsync(Guid userId);
        Task<PagedResult<DoctorDto>> SearchDoctorsAsync(string? specialization, Guid? hospitalId, string? location, int page, int pageSize);
        Task<PagedResult<DoctorDto>> SearchNearbyAsync(NearbySearchDto search);
        Task<DoctorDto> CreateDoctorAsync(CreateDoctorDto dto, Guid? adminUserId = null);
        Task<DoctorDto> UpdateDoctorAsync(Guid id, UpdateDoctorDto dto);
        Task DeleteDoctorAsync(Guid id);
        Task<IEnumerable<DoctorDto>> GetAllAsync();
        Task<IEnumerable<DoctorDto>> GetByAdminAsync(Guid adminUserId);
    }
}
