using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Interfaces;
using DoctorAppointment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DoctorAppointment.Infrastructure.Repositories
{
    public class DoctorRepository : GenericRepository<Doctor>, IDoctorRepository
    {
        public DoctorRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<Doctor?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(d => d.User)
                .Include(d => d.Hospital)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public override async Task<IEnumerable<Doctor>> GetAllAsync()
        {
            return await _dbSet
                .Include(d => d.User)
                .Include(d => d.Hospital)
                .ToListAsync();
        }

        public async Task<IEnumerable<Doctor>> GetBySpecializationAsync(string specialization)
        {
            return await _dbSet
                .Include(d => d.User)
                .Include(d => d.Hospital)
                .Where(d => d.Specialization.Contains(specialization))
                .ToListAsync();
        }

        public async Task<IEnumerable<Doctor>> GetByHospitalAsync(Guid hospitalId)
        {
            return await _dbSet
                .Include(d => d.User)
                .Include(d => d.Hospital)
                .Where(d => d.HospitalId == hospitalId)
                .ToListAsync();
        }

        public async Task<Doctor?> GetByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Include(d => d.User)
                .Include(d => d.Hospital)
                .FirstOrDefaultAsync(d => d.UserId == userId);
        }

        public async Task<IEnumerable<Doctor>> SearchDoctorsAsync(string? specialization, Guid? hospitalId, string? location, int page, int pageSize)
        {
            var query = _dbSet
                .Include(d => d.User)
                .Include(d => d.Hospital)
                .AsQueryable();

            if (!string.IsNullOrEmpty(specialization))
                query = query.Where(d => d.Specialization.Contains(specialization));

            if (hospitalId.HasValue)
                query = query.Where(d => d.HospitalId == hospitalId.Value);

            if (!string.IsNullOrEmpty(location))
                query = query.Where(d => d.Hospital != null && (d.Hospital.City.Contains(location) || d.Hospital.State.Contains(location) || d.Hospital.Country.Contains(location)));

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> CountSearchAsync(string? specialization, Guid? hospitalId, string? location)
        {
            var query = _dbSet
                .Include(d => d.Hospital)
                .AsQueryable();

            if (!string.IsNullOrEmpty(specialization))
                query = query.Where(d => d.Specialization.Contains(specialization));

            if (hospitalId.HasValue)
                query = query.Where(d => d.HospitalId == hospitalId.Value);

            if (!string.IsNullOrEmpty(location))
                query = query.Where(d => d.Hospital != null && (d.Hospital.City.Contains(location) || d.Hospital.State.Contains(location) || d.Hospital.Country.Contains(location)));

            return await query.CountAsync();
        }

        public override async Task<IEnumerable<Doctor>> FindAsync(System.Linq.Expressions.Expression<Func<Doctor, bool>> predicate)
        {
            return await _dbSet
                .Include(d => d.User)
                .Include(d => d.Hospital)
                .Where(predicate)
                .ToListAsync();
        }
    }
}
