using AutoMapper;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Interfaces;

namespace DoctorAppointment.Application.Services
{
    public class HospitalService : IHospitalService
    {
        private readonly IHospitalRepository _hospitalRepository;
        private readonly IMapper _mapper;

        public HospitalService(IHospitalRepository hospitalRepository, IMapper mapper)
        {
            _hospitalRepository = hospitalRepository;
            _mapper = mapper;
        }

        public async Task<HospitalDto> GetByIdAsync(Guid id)
        {
            var hospital = await _hospitalRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Hospital not found.");
            return _mapper.Map<HospitalDto>(hospital);
        }

        public async Task<IEnumerable<HospitalDto>> GetAllAsync()
        {
            var hospitals = await _hospitalRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<HospitalDto>>(hospitals);
        }

        public async Task<IEnumerable<HospitalDto>> GetByAdminAsync(Guid adminUserId)
        {
            var hospitals = await _hospitalRepository.FindAsync(h => h.AdminUserId == adminUserId);
            return _mapper.Map<IEnumerable<HospitalDto>>(hospitals);
        }

        public async Task<IEnumerable<HospitalDto>> SearchNearbyAsync(double lat, double lng, double radiusKm)
        {
            var all = await _hospitalRepository.GetAllAsync();
            var nearby = all
                .Where(h => h.Latitude.HasValue && h.Longitude.HasValue)
                .Select(h => new
                {
                    Hospital = h,
                    Distance = CalculateHaversineDistance(lat, lng, h.Latitude!.Value, h.Longitude!.Value)
                })
                .Where(x => x.Distance <= radiusKm)
                .OrderBy(x => x.Distance)
                .Select(x =>
                {
                    var dto = _mapper.Map<HospitalDto>(x.Hospital);
                    dto.Distance = Math.Round(x.Distance, 1);
                    return dto;
                });
            return nearby;
        }

        public async Task<HospitalDto> CreateAsync(CreateHospitalDto dto, Guid? adminUserId = null)
        {
            var hospital = _mapper.Map<Hospital>(dto);
            hospital.AdminUserId = adminUserId;
            await _hospitalRepository.AddAsync(hospital);
            return _mapper.Map<HospitalDto>(hospital);
        }

        public async Task<HospitalDto> UpdateAsync(Guid id, UpdateHospitalDto dto)
        {
            var hospital = await _hospitalRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Hospital not found.");

            hospital.Name = dto.Name;
            hospital.City = dto.City;
            hospital.State = dto.State;
            hospital.Country = dto.Country;
            hospital.Latitude = dto.Latitude;
            hospital.Longitude = dto.Longitude;
            hospital.UpdatedAt = DateTime.UtcNow;

            await _hospitalRepository.UpdateAsync(hospital);
            return _mapper.Map<HospitalDto>(hospital);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _hospitalRepository.DeleteAsync(id);
        }

        private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371;
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
