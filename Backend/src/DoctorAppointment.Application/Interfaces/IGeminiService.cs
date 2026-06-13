using DoctorAppointment.Application.DTOs;

namespace DoctorAppointment.Application.Interfaces;

public interface IGeminiService
{
    Task<MedAiChatResponse> GetMedicalResponseAsync(MedAiChatRequest request);
}
