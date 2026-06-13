using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Interfaces;
using DoctorAppointment.Infrastructure.Data;

namespace DoctorAppointment.Infrastructure.Repositories
{
    public class HospitalRepository : GenericRepository<Hospital>, IHospitalRepository
    {
        public HospitalRepository(ApplicationDbContext context) : base(context) { }
    }
}
