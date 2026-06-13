using DoctorAppointment.Core.Entities;

namespace DoctorAppointment.Core.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
    }
}
