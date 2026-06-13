using AutoMapper;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Core.Entities;

namespace DoctorAppointment.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>()
                .ForMember(d => d.Role, o => o.MapFrom(s => s.Role.ToString()));

            // Doctor mappings
            CreateMap<Doctor, DoctorDto>()
                .ForMember(d => d.Name, o => o.MapFrom(s => s.User.Name))
                .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email))
                .ForMember(d => d.HospitalName, o => o.MapFrom(s => s.Hospital != null ? s.Hospital.Name : null))
                .ForMember(d => d.HospitalLocation, o => o.MapFrom(s => s.Hospital != null ? (s.Hospital.City + ", " + s.Hospital.State) : null))
                .ForMember(d => d.Distance, o => o.Ignore());

            // Patient mappings
            CreateMap<Patient, PatientDto>()
                .ForMember(d => d.Name, o => o.MapFrom(s => s.User.Name))
                .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email));

            // Hospital mappings
            CreateMap<Hospital, HospitalDto>()
                .ForMember(d => d.DoctorCount, o => o.MapFrom(s => s.Doctors != null ? s.Doctors.Count : 0))
                .ForMember(d => d.Distance, o => o.Ignore());
            CreateMap<CreateHospitalDto, Hospital>();

            // Appointment mappings
            CreateMap<Appointment, AppointmentDto>()
                .ForMember(d => d.PatientUserId, o => o.MapFrom(s => s.Patient.UserId))
                .ForMember(d => d.PatientName, o => o.MapFrom(s => s.Patient.User.Name))
                .ForMember(d => d.DoctorUserId, o => o.MapFrom(s => s.Doctor.UserId))
                .ForMember(d => d.DoctorName, o => o.MapFrom(s => s.Doctor.User.Name))
                .ForMember(d => d.Specialization, o => o.MapFrom(s => s.Doctor.Specialization))
                .ForMember(d => d.Payment, o => o.MapFrom(s => s.Payment));

            // Payment mappings
            CreateMap<Payment, PaymentInfoDto>()
                .ForMember(d => d.PaymentMethod, o => o.MapFrom(s => s.PaymentMethod.ToString()))
                .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

            // Chat mappings
            CreateMap<ChatMessage, ChatMessageDto>()
                .ForMember(d => d.SenderName, o => o.MapFrom(s => s.Sender.Name))
                .ForMember(d => d.ReceiverName, o => o.MapFrom(s => s.Receiver.Name));
        }
    }
}
