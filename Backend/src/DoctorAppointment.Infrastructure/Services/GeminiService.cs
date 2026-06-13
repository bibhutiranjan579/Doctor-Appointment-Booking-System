using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DoctorAppointment.Infrastructure.Services;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly ILogger<GeminiService> _logger;

    private static readonly string[] EmergencyKeywords = [
        "chest pain", "heart attack", "difficulty breathing", "can't breathe",
        "stroke", "seizure", "severe bleeding", "unconscious", "unresponsive",
        "anaphylaxis", "choking", "suicide", "self-harm", "overdose",
        "severe head injury", "poisoning", "cardiac arrest"
    ];

    private const string SystemPrompt = @"You are MedAI, a healthcare assistant chatbot for the MedBook platform. Your role:

1. Help users understand common symptoms and possible causes.
2. Provide basic precautionary advice (rest, hydration, OTC meds).
3. Give general health guidance.
4. Clearly tell users when they should consult a doctor.
5. Explain how to book appointments on the platform.
6. NEVER provide medical diagnoses or prescriptions.
7. ALWAYS include a disclaimer that your advice is informational only.
8. For severe symptoms, IMMEDIATELY recommend emergency medical attention.

Response format guidelines:
- Use clear headings with markdown **bold** formatting.
- Use bullet points for lists.
- Keep responses concise but helpful (200-400 words max).
- End with a brief disclaimer.
- If user describes symptoms, structure response as:
  **Symptoms Noted** | **Possible Causes** | **Basic Precautions** | **When to See a Doctor**

Platform info: Users can book appointments via the 'Book Appointment' page. They can search doctors by specialization and hospital.";

    public GeminiService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiService> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["GeminiSettings:ApiKey"] ?? "";
        _logger = logger;
    }

    public async Task<MedAiChatResponse> GetMedicalResponseAsync(MedAiChatRequest request)
    {
        var conversationId = request.ConversationId ?? Guid.NewGuid().ToString();

        // Check for emergency keywords first
        bool isEmergency = IsEmergencyMessage(request.Message);

        if (isEmergency)
        {
            return new MedAiChatResponse
            {
                Reply = GetEmergencyResponse(request.Message),
                ConversationId = conversationId,
                Timestamp = DateTime.UtcNow,
                IsEmergency = true
            };
        }

        try
        {
            var reply = await CallGeminiApiAsync(request);
            return new MedAiChatResponse
            {
                Reply = reply,
                ConversationId = conversationId,
                Timestamp = DateTime.UtcNow,
                IsEmergency = false
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini API");
            return new MedAiChatResponse
            {
                Reply = "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment. If you have an urgent medical concern, please contact emergency services or visit your nearest hospital.",
                ConversationId = conversationId,
                Timestamp = DateTime.UtcNow,
                IsEmergency = false
            };
        }
    }

    private static readonly string[] Models = [
        "gemini-2.5-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-1.5-flash"
    ];

    private async Task<string> CallGeminiApiAsync(MedAiChatRequest request)
    {
        var contents = new List<object>();

        // Add system instruction as first user/model pair
        contents.Add(new { role = "user", parts = new[] { new { text = "System: " + SystemPrompt } } });
        contents.Add(new { role = "model", parts = new[] { new { text = "Understood. I am MedAI, a healthcare assistant. I will provide informational health guidance, never diagnose, and always recommend professional medical advice when appropriate." } } });

        // Add conversation history
        if (request.History != null)
        {
            foreach (var msg in request.History.TakeLast(10)) // Keep last 10 messages for context
            {
                contents.Add(new
                {
                    role = msg.Role == "user" ? "user" : "model",
                    parts = new[] { new { text = msg.Content } }
                });
            }
        }

        // Add current message
        contents.Add(new { role = "user", parts = new[] { new { text = request.Message } } });

        var payload = new
        {
            contents,
            generationConfig = new
            {
                temperature = 0.7,
                topP = 0.9,
                topK = 40,
                maxOutputTokens = 1024
            },
            safetySettings = new[]
            {
                new { category = "HARM_CATEGORY_DANGEROUS_CONTENT", threshold = "BLOCK_ONLY_HIGH" },
                new { category = "HARM_CATEGORY_HARASSMENT", threshold = "BLOCK_ONLY_HIGH" },
                new { category = "HARM_CATEGORY_HATE_SPEECH", threshold = "BLOCK_ONLY_HIGH" },
                new { category = "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold = "BLOCK_ONLY_HIGH" }
            }
        };

        // Try each model until one succeeds
        foreach (var model in Models)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={_apiKey}";
            var response = await _httpClient.PostAsJsonAsync(url, payload);

            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            {
                _logger.LogWarning("Model {Model} rate limited, trying next model...", model);
                continue;
            }

            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Gemini API ({Model}) returned {StatusCode}: {Body}", model, response.StatusCode, json);
                continue;
            }

            var result = JsonSerializer.Deserialize<GeminiResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var text = result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

            return text ?? "I couldn't generate a response. Please try rephrasing your question.";
        }

        throw new HttpRequestException("All Gemini models are rate limited. Please try again later.");
    }

    private static bool IsEmergencyMessage(string message)
    {
        var lower = message.ToLowerInvariant();
        return EmergencyKeywords.Any(keyword => lower.Contains(keyword));
    }

    private static string GetEmergencyResponse(string message)
    {
        return @"⚠️ **EMERGENCY ALERT**

Based on what you've described, this may require **immediate medical attention**.

**Please take the following steps immediately:**
- 🚨 Call your local emergency number (911 / 112 / 108)
- 🏥 Go to the nearest hospital emergency room
- 👥 If possible, have someone stay with you
- 🚫 Do not ignore these symptoms

**While waiting for help:**
- Stay calm and try to remain still
- Do not eat or drink anything unless advised
- Keep your phone nearby

**This chatbot cannot provide emergency medical care.** These symptoms require professional medical evaluation immediately.

---
*⚕️ Disclaimer: MedAI is an informational assistant and not a substitute for professional emergency medical services.*";
    }
}

// Gemini API response models
internal class GeminiResponse
{
    [JsonPropertyName("candidates")]
    public List<GeminiCandidate>? Candidates { get; set; }
}

internal class GeminiCandidate
{
    [JsonPropertyName("content")]
    public GeminiContent? Content { get; set; }
}

internal class GeminiContent
{
    [JsonPropertyName("parts")]
    public List<GeminiPart>? Parts { get; set; }
}

internal class GeminiPart
{
    [JsonPropertyName("text")]
    public string? Text { get; set; }
}
