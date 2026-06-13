using System.Security.Claims;
using DoctorAppointment.Application.Common;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DoctorAppointment.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserRepository _userRepository;

        public AuthController(IAuthService authService, IUserRepository userRepository)
        {
            _authService = authService;
            _userRepository = userRepository;
        }

        [HttpPost("register")]
        [EnableRateLimiting("register")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Registration successful."));
        }

        [HttpPost("login")]
        [EnableRateLimiting("login")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Login successful."));
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetProfile()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return NotFound(ApiResponse<UserProfileDto>.ErrorResponse("User not found."));
            var dto = new UserProfileDto { Name = user.Name, Email = user.Email, Role = user.Role.ToString() };
            return Ok(ApiResponse<UserProfileDto>.SuccessResponse(dto));
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<UserProfileDto>>> UpdateProfile([FromBody] UpdateUserProfileDto dto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return NotFound(ApiResponse<UserProfileDto>.ErrorResponse("User not found."));
            user.Name = dto.Name;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);
            var result = new UserProfileDto { Name = user.Name, Email = user.Email, Role = user.Role.ToString() };
            return Ok(ApiResponse<UserProfileDto>.SuccessResponse(result, "Profile updated."));
        }
    }
}
