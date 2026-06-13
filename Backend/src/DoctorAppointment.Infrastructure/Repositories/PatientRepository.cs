using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Interfaces;
using DoctorAppointment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DoctorAppointment.Infrastructure.Repositories
{
    public class PatientRepository : GenericRepository<Patient>, IPatientRepository
    {
        public PatientRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<Patient?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public override async Task<IEnumerable<Patient>> GetAllAsync()
        {
            return await _dbSet
                .Include(p => p.User)
                .ToListAsync();
        }

        public async Task<Patient?> GetByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }
    }
}
