using AutoMapper;
using DoctorAppointment.Application.Common;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Enums;
using DoctorAppointment.Core.Interfaces;

namespace DoctorAppointment.Application.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IGenericRepository<Payment> _paymentRepository;
        private readonly IMapper _mapper;

        public AppointmentService(
            IAppointmentRepository appointmentRepository,
            IPatientRepository patientRepository,
            IDoctorRepository doctorRepository,
            IGenericRepository<Payment> paymentRepository,
            IMapper mapper)
        {
            _appointmentRepository = appointmentRepository;
            _patientRepository = patientRepository;
            _doctorRepository = doctorRepository;
            _paymentRepository = paymentRepository;
            _mapper = mapper;
        }

        public async Task<AppointmentDto> GetByIdAsync(Guid id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Appointment not found.");
            return _mapper.Map<AppointmentDto>(appointment);
        }

        public async Task<PagedResult<AppointmentDto>> GetAppointmentsAsync(int page, int pageSize, Guid? doctorId = null, Guid? patientId = null, AppointmentStatus? status = null, Guid? adminUserId = null)
        {
            var appointments = await _appointmentRepository.GetPagedAppointmentsAsync(page, pageSize, doctorId, patientId, status, adminUserId);
            var totalCount = await _appointmentRepository.CountAsync(doctorId, patientId, status, adminUserId);

            return new PagedResult<AppointmentDto>
            {
                Items = _mapper.Map<IEnumerable<AppointmentDto>>(appointments),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<AppointmentDto> CreateAsync(Guid patientUserId, CreateAppointmentDto dto)
        {
            var patient = await _patientRepository.GetByUserIdAsync(patientUserId)
                ?? throw new KeyNotFoundException("Patient profile not found.");

            var doctor = await _doctorRepository.GetByIdAsync(dto.DoctorId)
                ?? throw new KeyNotFoundException("Doctor not found.");

            var appointment = new Appointment
            {
                PatientId = patient.Id,
                DoctorId = dto.DoctorId,
                AppointmentDate = dto.AppointmentDate,
                Notes = dto.Notes,
                Status = AppointmentStatus.Pending
            };

            await _appointmentRepository.AddAsync(appointment);

            // Create payment record (simulated — always succeeds)
            var payment = new Payment
            {
                AppointmentId = appointment.Id,
                Amount = dto.Amount,
                PaymentMethod = dto.PaymentMethod,
                Status = PaymentStatus.Success,
                TransactionId = $"TXN-{Guid.NewGuid():N}"[..20].ToUpperInvariant(),
                PaymentDetail = dto.PaymentDetail
            };

            await _paymentRepository.AddAsync(payment);

            // Re-fetch with all navigation properties
            var created = await _appointmentRepository.GetByIdAsync(appointment.Id);
            return _mapper.Map<AppointmentDto>(created!);
        }

        public async Task<AppointmentDto> UpdateStatusAsync(Guid id, UpdateAppointmentStatusDto dto)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Appointment not found.");

            appointment.Status = dto.Status;
            appointment.UpdatedAt = DateTime.UtcNow;

            await _appointmentRepository.UpdateAsync(appointment);

            // Re-fetch with navigation properties to ensure proper mapping
            var updated = await _appointmentRepository.GetByIdAsync(id);
            return _mapper.Map<AppointmentDto>(updated!);
        }

        public async Task<IEnumerable<AppointmentDto>> GetByDoctorUserIdAsync(Guid doctorUserId)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(doctorUserId)
                ?? throw new KeyNotFoundException("Doctor profile not found.");
            var appointments = await _appointmentRepository.GetByDoctorIdAsync(doctor.Id);
            return _mapper.Map<IEnumerable<AppointmentDto>>(appointments);
        }

        public async Task<IEnumerable<AppointmentDto>> GetByPatientUserIdAsync(Guid patientUserId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(patientUserId)
                ?? throw new KeyNotFoundException("Patient profile not found.");
            var appointments = await _appointmentRepository.GetByPatientIdAsync(patient.Id);
            return _mapper.Map<IEnumerable<AppointmentDto>>(appointments);
        }
    }
}
