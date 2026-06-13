using DoctorAppointment.Core.Entities;

namespace DoctorAppointment.Core.Interfaces
{
    public interface IPatientRepository : IGenericRepository<Patient>
    {
        Task<Patient?> GetByUserIdAsync(Guid userId);
    }
}
