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
    public class HospitalsController : ControllerBase
    {
        private readonly IHospitalService _hospitalService;

        public HospitalsController(IHospitalService hospitalService)
        {
            _hospitalService = hospitalService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<IEnumerable<HospitalDto>>>> GetAll()
        {
            // If caller is Admin, return only their hospitals
            if (User.Identity?.IsAuthenticated == true && User.IsInRole("Admin"))
            {
                var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var adminHospitals = await _hospitalService.GetByAdminAsync(adminId);
                return Ok(ApiResponse<IEnumerable<HospitalDto>>.SuccessResponse(adminHospitals));
            }
            var hospitals = await _hospitalService.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<HospitalDto>>.SuccessResponse(hospitals));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<HospitalDto>>> GetById(Guid id)
        {
            var hospital = await _hospitalService.GetByIdAsync(id);
            return Ok(ApiResponse<HospitalDto>.SuccessResponse(hospital));
        }

        [HttpGet("nearby")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<IEnumerable<HospitalDto>>>> Nearby(
            [FromQuery] double lat,
            [FromQuery] double lng,
            [FromQuery] double radius = 10)
        {
            var hospitals = await _hospitalService.SearchNearbyAsync(lat, lng, radius);
            return Ok(ApiResponse<IEnumerable<HospitalDto>>.SuccessResponse(hospitals));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<HospitalDto>>> Create([FromBody] CreateHospitalDto dto)
        {
            var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var hospital = await _hospitalService.CreateAsync(dto, adminId);
            return CreatedAtAction(nameof(GetById), new { id = hospital.Id }, ApiResponse<HospitalDto>.SuccessResponse(hospital, "Hospital created."));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<HospitalDto>>> Update(Guid id, [FromBody] UpdateHospitalDto dto)
        {
            var hospital = await _hospitalService.UpdateAsync(id, dto);
            return Ok(ApiResponse<HospitalDto>.SuccessResponse(hospital, "Hospital updated."));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(Guid id)
        {
            await _hospitalService.DeleteAsync(id);
            return Ok(ApiResponse<string>.SuccessResponse("Deleted", "Hospital deleted."));
        }
    }
}
