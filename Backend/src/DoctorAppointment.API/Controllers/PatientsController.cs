using System.Security.Claims;
using DoctorAppointment.Application.Common;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoctorAppointment.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientsController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<IEnumerable<PatientDto>>>> GetAll()
        {
            var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var patients = await _patientService.GetByAdminAsync(adminId);
            return Ok(ApiResponse<IEnumerable<PatientDto>>.SuccessResponse(patients));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<PatientDto>>> GetById(Guid id)
        {
            var patient = await _patientService.GetByIdAsync(id);
            return Ok(ApiResponse<PatientDto>.SuccessResponse(patient));
        }

        [HttpGet("profile")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<ApiResponse<PatientDto>>> GetProfile()
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var patient = await _patientService.GetByUserIdAsync(userId);
            return Ok(ApiResponse<PatientDto>.SuccessResponse(patient));
        }

        [HttpPut("profile")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<ApiResponse<PatientDto>>> UpdateProfile([FromBody] UpdatePatientDto dto)
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var patient = await _patientService.UpdatePatientAsync(userId, dto);
            return Ok(ApiResponse<PatientDto>.SuccessResponse(patient, "Profile updated."));
        }
    }
}
