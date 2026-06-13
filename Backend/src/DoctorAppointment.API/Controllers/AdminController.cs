using System.Security.Claims;
using DoctorAppointment.Application.Common;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;

namespace DoctorAppointment.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IDoctorService _doctorService;
        private readonly IPatientService _patientService;
        private readonly IMapper _mapper;

        public AdminController(IUserRepository userRepository, IDoctorService doctorService, IPatientService patientService, IMapper mapper)
        {
            _userRepository = userRepository;
            _doctorService = doctorService;
            _patientService = patientService;
            _mapper = mapper;
        }

        [HttpGet("users")]
        public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetAllUsers()
        {
            var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Get admin's doctors and their user IDs
            var adminDoctors = await _doctorService.GetByAdminAsync(adminId);
            var doctorUserIds = adminDoctors.Select(d => d.UserId).ToHashSet();

            // Get admin's patients and their user IDs
            var adminPatients = await _patientService.GetByAdminAsync(adminId);
            var patientUserIds = adminPatients.Select(p => p.UserId).ToHashSet();

            // Collect all scoped user IDs (admin + their doctors + their patients)
            var scopedUserIds = new HashSet<Guid> { adminId };
            scopedUserIds.UnionWith(doctorUserIds);
            scopedUserIds.UnionWith(patientUserIds);

            var allUsers = await _userRepository.GetAllAsync();
            var scopedUsers = allUsers.Where(u => scopedUserIds.Contains(u.Id));
            var userDtos = _mapper.Map<IEnumerable<UserDto>>(scopedUsers);
            return Ok(ApiResponse<IEnumerable<UserDto>>.SuccessResponse(userDtos));
        }
    }
}
