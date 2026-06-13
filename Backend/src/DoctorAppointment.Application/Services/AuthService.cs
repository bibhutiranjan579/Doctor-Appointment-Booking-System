using AutoMapper;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Core.Entities;
using DoctorAppointment.Core.Enums;
using DoctorAppointment.Core.Interfaces;

namespace DoctorAppointment.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthService(IUserRepository userRepository, IPatientRepository patientRepository, IJwtTokenService jwtTokenService)
        {
            _userRepository = userRepository;
            _patientRepository = patientRepository;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
                throw new InvalidOperationException("A user with this email already exists.");

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role
            };

            await _userRepository.AddAsync(user);

            if (dto.Role == UserRole.Patient)
            {
                var patient = new Patient
                {
                    UserId = user.Id,
                    Age = dto.Age ?? 0,
                    Gender = dto.Gender ?? string.Empty
                };
                await _patientRepository.AddAsync(patient);
            }

            var token = _jwtTokenService.GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString(),
                UserId = user.Id
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email)
                ?? throw new UnauthorizedAccessException("Invalid email or password.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password.");

            // Validate role if provided
            if (!string.IsNullOrEmpty(dto.Role) && user.Role.ToString() != dto.Role)
                throw new UnauthorizedAccessException($"This account is registered as {user.Role}. Please select the correct role.");

            var token = _jwtTokenService.GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString(),
                UserId = user.Id
            };
        }
    }
}
