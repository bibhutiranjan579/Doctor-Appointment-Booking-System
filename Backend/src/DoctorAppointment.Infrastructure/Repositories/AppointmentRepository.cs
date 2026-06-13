using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Enums;
using DoctorAppointment.Core.Interfaces;
using DoctorAppointment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DoctorAppointment.Infrastructure.Repositories
{
    public class AppointmentRepository : GenericRepository<Appointment>, IAppointmentRepository
    {
        public AppointmentRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<Appointment?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Payment)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Appointment>> GetByPatientIdAsync(Guid patientId)
        {
            return await _dbSet
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Payment)
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetByDoctorIdAsync(Guid doctorId)
        {
            return await _dbSet
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Payment)
                .Where(a => a.DoctorId == doctorId)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetByStatusAsync(AppointmentStatus status)
        {
            return await _dbSet
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Payment)
                .Where(a => a.Status == status)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetPagedAppointmentsAsync(int page, int pageSize, Guid? doctorId = null, Guid? patientId = null, AppointmentStatus? status = null, Guid? adminUserId = null)
        {
            var query = _dbSet
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Payment)
                .AsQueryable();

            if (adminUserId.HasValue)
                query = query.Where(a => a.Doctor.AdminUserId == adminUserId.Value);
            if (doctorId.HasValue)
                query = query.Where(a => a.DoctorId == doctorId.Value);
            if (patientId.HasValue)
                query = query.Where(a => a.PatientId == patientId.Value);
            if (status.HasValue)
                query = query.Where(a => a.Status == status.Value);

            return await query
                .OrderByDescending(a => a.AppointmentDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> CountAsync(Guid? doctorId = null, Guid? patientId = null, AppointmentStatus? status = null, Guid? adminUserId = null)
        {
            var query = _dbSet.AsQueryable();
            if (adminUserId.HasValue)
                query = query.Where(a => a.Doctor.AdminUserId == adminUserId.Value);
            if (doctorId.HasValue)
                query = query.Where(a => a.DoctorId == doctorId.Value);
            if (patientId.HasValue)
                query = query.Where(a => a.PatientId == patientId.Value);
            if (status.HasValue)
                query = query.Where(a => a.Status == status.Value);
            return await query.CountAsync();
        }
    }
}
