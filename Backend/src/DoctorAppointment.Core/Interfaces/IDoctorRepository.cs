using DoctorAppointment.Core.Entities;

namespace DoctorAppointment.Core.Interfaces
{
    public interface IDoctorRepository : IGenericRepository<Doctor>
    {
        Task<IEnumerable<Doctor>> GetBySpecializationAsync(string specialization);
        Task<IEnumerable<Doctor>> GetByHospitalAsync(Guid hospitalId);
        Task<Doctor?> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Doctor>> SearchDoctorsAsync(string? specialization, Guid? hospitalId, string? location, int page, int pageSize);
        Task<int> CountSearchAsync(string? specialization, Guid? hospitalId, string? location);
    }
}
