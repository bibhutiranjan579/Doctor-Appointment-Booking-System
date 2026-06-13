using DoctorAppointment.Application.Common;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Core.Enums;

namespace DoctorAppointment.Application.Interfaces
{
    public interface IAppointmentService
    {
        Task<AppointmentDto> GetByIdAsync(Guid id);
        Task<PagedResult<AppointmentDto>> GetAppointmentsAsync(int page, int pageSize, Guid? doctorId = null, Guid? patientId = null, AppointmentStatus? status = null, Guid? adminUserId = null);
        Task<AppointmentDto> CreateAsync(Guid patientUserId, CreateAppointmentDto dto);
        Task<AppointmentDto> UpdateStatusAsync(Guid id, UpdateAppointmentStatusDto dto);
        Task<IEnumerable<AppointmentDto>> GetByDoctorUserIdAsync(Guid doctorUserId);
        Task<IEnumerable<AppointmentDto>> GetByPatientUserIdAsync(Guid patientUserId);
    }
}
