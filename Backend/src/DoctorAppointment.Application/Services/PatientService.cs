using AutoMapper;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Core.Interfaces;

namespace DoctorAppointment.Application.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IMapper _mapper;

        public PatientService(IPatientRepository patientRepository, IAppointmentRepository appointmentRepository, IDoctorRepository doctorRepository, IMapper mapper)
        {
            _patientRepository = patientRepository;
            _appointmentRepository = appointmentRepository;
            _doctorRepository = doctorRepository;
            _mapper = mapper;
        }

        public async Task<PatientDto> GetByIdAsync(Guid id)
        {
            var patient = await _patientRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Patient not found.");
            return _mapper.Map<PatientDto>(patient);
        }

        public async Task<PatientDto> GetByUserIdAsync(Guid userId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId)
                ?? throw new KeyNotFoundException("Patient not found.");
            return _mapper.Map<PatientDto>(patient);
        }

        public async Task<PatientDto> UpdatePatientAsync(Guid userId, UpdatePatientDto dto)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId)
                ?? throw new KeyNotFoundException("Patient not found.");

            patient.Age = dto.Age;
            patient.Gender = dto.Gender;
            patient.PhoneNumber = dto.PhoneNumber;
            patient.MedicalHistory = dto.MedicalHistory;
            patient.UpdatedAt = DateTime.UtcNow;

            await _patientRepository.UpdateAsync(patient);
            return _mapper.Map<PatientDto>(patient);
        }

        public async Task<IEnumerable<PatientDto>> GetAllAsync()
        {
            var patients = await _patientRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<PatientDto>>(patients);
        }

        public async Task<IEnumerable<PatientDto>> GetByAdminAsync(Guid adminUserId)
        {
            // Get all doctors managed by this admin
            var adminDoctors = await _doctorRepository.FindAsync(d => d.AdminUserId == adminUserId);
            var doctorIds = adminDoctors.Select(d => d.Id).ToHashSet();

            // Get all patients who have appointments with those doctors
            var allPatients = await _patientRepository.GetAllAsync();
            var scopedPatients = new List<Core.Entities.Patient>();
            foreach (var patient in allPatients)
            {
                var appointments = await _appointmentRepository.GetByPatientIdAsync(patient.Id);
                if (appointments.Any(a => doctorIds.Contains(a.DoctorId)))
                    scopedPatients.Add(patient);
            }
            return _mapper.Map<IEnumerable<PatientDto>>(scopedPatients);
        }
    }
}
