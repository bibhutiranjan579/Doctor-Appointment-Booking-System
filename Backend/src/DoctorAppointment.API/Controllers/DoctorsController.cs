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
    public class DoctorsController : ControllerBase
    {
        private readonly IDoctorService _doctorService;

        public DoctorsController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<IEnumerable<DoctorDto>>>> GetAll()
        {
            // If caller is Admin, return only their doctors
            if (User.Identity?.IsAuthenticated == true && User.IsInRole("Admin"))
            {
                var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var adminDoctors = await _doctorService.GetByAdminAsync(adminId);
                return Ok(ApiResponse<IEnumerable<DoctorDto>>.SuccessResponse(adminDoctors));
            }
            var doctors = await _doctorService.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<DoctorDto>>.SuccessResponse(doctors));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<DoctorDto>>> GetById(Guid id)
        {
            var doctor = await _doctorService.GetByIdAsync(id);
            return Ok(ApiResponse<DoctorDto>.SuccessResponse(doctor));
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<PagedResult<DoctorDto>>>> Search(
            [FromQuery] string? specialization,
            [FromQuery] Guid? hospitalId,
            [FromQuery] string? location = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _doctorService.SearchDoctorsAsync(specialization, hospitalId, location, page, pageSize);
            return Ok(ApiResponse<PagedResult<DoctorDto>>.SuccessResponse(result));
        }

        [HttpGet("nearby")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<PagedResult<DoctorDto>>>> Nearby(
            [FromQuery] double lat,
            [FromQuery] double lng,
            [FromQuery] double radius = 10,
            [FromQuery] string? specialization = null,
            [FromQuery] Guid? hospitalId = null,
            [FromQuery] string sortBy = "distance",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var search = new NearbySearchDto
            {
                Latitude = lat,
                Longitude = lng,
                RadiusKm = radius,
                Specialization = specialization,
                HospitalId = hospitalId,
                SortBy = sortBy,
                Page = page,
                PageSize = pageSize
            };
            var result = await _doctorService.SearchNearbyAsync(search);
            return Ok(ApiResponse<PagedResult<DoctorDto>>.SuccessResponse(result));
        }

        [HttpGet("profile")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult<ApiResponse<DoctorDto>>> GetProfile()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var doctor = await _doctorService.GetByUserIdAsync(userId);
            return Ok(ApiResponse<DoctorDto>.SuccessResponse(doctor));
        }

        [HttpPut("profile")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult<ApiResponse<DoctorDto>>> UpdateProfile([FromBody] UpdateDoctorDto dto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var doctor = await _doctorService.GetByUserIdAsync(userId);
            var updated = await _doctorService.UpdateDoctorAsync(doctor.Id, dto);
            return Ok(ApiResponse<DoctorDto>.SuccessResponse(updated, "Profile updated."));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<DoctorDto>>> Create([FromBody] CreateDoctorDto dto)
        {
            var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var doctor = await _doctorService.CreateDoctorAsync(dto, adminId);
            return CreatedAtAction(nameof(GetById), new { id = doctor.Id }, ApiResponse<DoctorDto>.SuccessResponse(doctor, "Doctor created."));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<DoctorDto>>> Update(Guid id, [FromBody] UpdateDoctorDto dto)
        {
            var doctor = await _doctorService.UpdateDoctorAsync(id, dto);
            return Ok(ApiResponse<DoctorDto>.SuccessResponse(doctor, "Doctor updated."));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(Guid id)
        {
            await _doctorService.DeleteDoctorAsync(id);
            return Ok(ApiResponse<string>.SuccessResponse("Deleted", "Doctor deleted."));
        }
    }
}
