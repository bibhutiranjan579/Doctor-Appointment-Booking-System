using AutoMapper;
using DoctorAppointment.Application.Common;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Enums;
using DoctorAppointment.Core.Interfaces;

namespace DoctorAppointment.Application.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public DoctorService(IDoctorRepository doctorRepository, IUserRepository userRepository, IMapper mapper)
        {
            _doctorRepository = doctorRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<DoctorDto> GetByIdAsync(Guid id)
        {
            var doctor = await _doctorRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Doctor not found.");
            return _mapper.Map<DoctorDto>(doctor);
        }

        public async Task<DoctorDto> GetByUserIdAsync(Guid userId)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId)
                ?? throw new KeyNotFoundException("Doctor not found.");
            return _mapper.Map<DoctorDto>(doctor);
        }

        public async Task<PagedResult<DoctorDto>> SearchDoctorsAsync(string? specialization, Guid? hospitalId, string? location, int page, int pageSize)
        {
            var doctors = await _doctorRepository.SearchDoctorsAsync(specialization, hospitalId, location, page, pageSize);
            var totalCount = await _doctorRepository.CountSearchAsync(specialization, hospitalId, location);

            return new PagedResult<DoctorDto>
            {
                Items = _mapper.Map<IEnumerable<DoctorDto>>(doctors),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<PagedResult<DoctorDto>> SearchNearbyAsync(NearbySearchDto search)
        {
            var allDoctors = await _doctorRepository.GetAllAsync();
            var doctorList = allDoctors.ToList();

            // Filter by specialization/hospital
            if (!string.IsNullOrEmpty(search.Specialization))
                doctorList = doctorList.Where(d => d.Specialization.Contains(search.Specialization, StringComparison.OrdinalIgnoreCase)).ToList();
            if (search.HospitalId.HasValue)
                doctorList = doctorList.Where(d => d.HospitalId == search.HospitalId.Value).ToList();

            // Calculate distance and filter by radius
            var doctorsWithDistance = doctorList
                .Select(d =>
                {
                    // Use doctor's own coordinates, or fall back to hospital coordinates
                    double? lat = d.Latitude ?? d.Hospital?.Latitude;
                    double? lng = d.Longitude ?? d.Hospital?.Longitude;

                    double? distance = (lat.HasValue && lng.HasValue)
                        ? CalculateHaversineDistance(search.Latitude, search.Longitude, lat.Value, lng.Value)
                        : null;

                    return new { Doctor = d, Distance = distance };
                })
                .Where(x => x.Distance.HasValue && x.Distance.Value <= search.RadiusKm)
                .ToList();

            // Sort
            var sorted = search.SortBy?.ToLower() switch
            {
                "experience" => doctorsWithDistance.OrderByDescending(x => x.Doctor.Experience).ToList(),
                "name" => doctorsWithDistance.OrderBy(x => x.Doctor.User?.Name).ToList(),
                _ => doctorsWithDistance.OrderBy(x => x.Distance).ToList()
            };

            var totalCount = sorted.Count;
            var paged = sorted.Skip((search.Page - 1) * search.PageSize).Take(search.PageSize).ToList();

            var dtos = paged.Select(x =>
            {
                var dto = _mapper.Map<DoctorDto>(x.Doctor);
                dto.Distance = Math.Round(x.Distance!.Value, 1);
                return dto;
            });

            return new PagedResult<DoctorDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = search.Page,
                PageSize = search.PageSize
            };
        }

        public async Task<DoctorDto> CreateDoctorAsync(CreateDoctorDto dto, Guid? adminUserId = null)
        {
            var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
                throw new InvalidOperationException("A user with this email already exists.");

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = UserRole.Doctor
            };
            await _userRepository.AddAsync(user);

            var doctor = new Doctor
            {
                UserId = user.Id,
                Specialization = dto.Specialization,
                Experience = dto.Experience,
                HospitalId = dto.HospitalId,
                AvailabilitySchedule = dto.AvailabilitySchedule,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                AdminUserId = adminUserId
            };
            await _doctorRepository.AddAsync(doctor);

            return _mapper.Map<DoctorDto>(doctor);
        }

        public async Task<DoctorDto> UpdateDoctorAsync(Guid id, UpdateDoctorDto dto)
        {
            var doctor = await _doctorRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Doctor not found.");

            // Update user name/email
            var user = await _userRepository.GetByIdAsync(doctor.UserId)
                ?? throw new KeyNotFoundException("User not found.");
            if (!string.IsNullOrWhiteSpace(dto.Name)) user.Name = dto.Name;
            if (!string.IsNullOrWhiteSpace(dto.Email)) user.Email = dto.Email;
            await _userRepository.UpdateAsync(user);

            doctor.Specialization = dto.Specialization;
            doctor.Experience = dto.Experience;
            doctor.HospitalId = dto.HospitalId;
            doctor.AvailabilitySchedule = dto.AvailabilitySchedule;
            doctor.Latitude = dto.Latitude;
            doctor.Longitude = dto.Longitude;
            doctor.UpdatedAt = DateTime.UtcNow;

            await _doctorRepository.UpdateAsync(doctor);
            return _mapper.Map<DoctorDto>(doctor);
        }

        public async Task DeleteDoctorAsync(Guid id)
        {
            var doctor = await _doctorRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Doctor not found.");

            await _doctorRepository.DeleteAsync(id);
            await _userRepository.DeleteAsync(doctor.UserId);
        }

        public async Task<IEnumerable<DoctorDto>> GetAllAsync()
        {
            var doctors = await _doctorRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<DoctorDto>>(doctors);
        }

        public async Task<IEnumerable<DoctorDto>> GetByAdminAsync(Guid adminUserId)
        {
            var doctors = await _doctorRepository.FindAsync(d => d.AdminUserId == adminUserId);
            return _mapper.Map<IEnumerable<DoctorDto>>(doctors);
        }

        /// <summary>Haversine formula — returns distance in km between two coordinates.</summary>
        private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth's radius in km
            var dLat = DegreesToRadians(lat2 - lat1);
            var dLon = DegreesToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                  + Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2))
                  * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private static double DegreesToRadians(double deg) => deg * Math.PI / 180.0;
    }
}
