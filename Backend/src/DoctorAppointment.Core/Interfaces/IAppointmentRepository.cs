using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Enums;

namespace DoctorAppointment.Core.Interfaces
{
    public interface IAppointmentRepository : IGenericRepository<Appointment>
    {
        Task<IEnumerable<Appointment>> GetByPatientIdAsync(Guid patientId);
        Task<IEnumerable<Appointment>> GetByDoctorIdAsync(Guid doctorId);
        Task<IEnumerable<Appointment>> GetByStatusAsync(AppointmentStatus status);
        Task<IEnumerable<Appointment>> GetPagedAppointmentsAsync(int page, int pageSize, Guid? doctorId = null, Guid? patientId = null, AppointmentStatus? status = null, Guid? adminUserId = null);
        Task<int> CountAsync(Guid? doctorId = null, Guid? patientId = null, AppointmentStatus? status = null, Guid? adminUserId = null);
    }
}
