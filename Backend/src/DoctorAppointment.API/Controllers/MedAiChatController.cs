using DoctorAppointment.Application.DTOs;
using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Core.Entities;
using DoctorAppointment.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoctorAppointment.API.Controllers;

[ApiController]
[Route("api/medai")]
public class MedAiChatController : ControllerBase
{
    private readonly IGeminiService _geminiService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MedAiChatController> _logger;

    public MedAiChatController(IGeminiService geminiService, ApplicationDbContext context, ILogger<MedAiChatController> logger)
    {
        _geminiService = geminiService;
        _context = context;
        _logger = logger;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // ==================== PUBLIC (Guest + Auth) ====================

    /// <summary>Send a message (guest mode - no persistence)</summary>
    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] MedAiChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { success = false, message = "Message cannot be empty." });

        if (request.Message.Length > 2000)
            return BadRequest(new { success = false, message = "Message too long. Maximum 2000 characters." });

        var response = await _geminiService.GetMedicalResponseAsync(request);

        return Ok(new { success = true, data = response });
    }

    // ==================== AUTHENTICATED ONLY ====================

    /// <summary>Send message in a conversation (auto-persists)</summary>
    [Authorize]
    [HttpPost("conversations/{conversationId:guid}/messages")]
    public async Task<IActionResult> SendMessageInConversation(Guid conversationId, [FromBody] SendMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { success = false, message = "Message cannot be empty." });

        if (request.Message.Length > 2000)
            return BadRequest(new { success = false, message = "Message too long. Maximum 2000 characters." });

        var userId = GetUserId();

        // Verify conversation belongs to user
        var conversation = await _context.ChatConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId);

        if (conversation == null)
            return NotFound(new { success = false, message = "Conversation not found." });

        // Save user message
        var userMessage = new AiChatMessage
        {
            ConversationId = conversationId,
            Sender = "user",
            Message = request.Message,
            IsEmergency = false
        };
        _context.AiChatMessages.Add(userMessage);

        // Build history for Gemini context
        var recentMessages = await _context.AiChatMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(10)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new MedAiMessageDto { Role = m.Sender, Content = m.Message, Timestamp = m.CreatedAt })
            .ToListAsync();

        var geminiRequest = new MedAiChatRequest
        {
            Message = request.Message,
            ConversationId = conversationId.ToString(),
            History = recentMessages
        };

        var geminiResponse = await _geminiService.GetMedicalResponseAsync(geminiRequest);

        // Save AI response
        var aiMessage = new AiChatMessage
        {
            ConversationId = conversationId,
            Sender = "assistant",
            Message = geminiResponse.Reply,
            IsEmergency = geminiResponse.IsEmergency
        };
        _context.AiChatMessages.Add(aiMessage);

        // Update conversation title from first user message if still default
        if (conversation.Title == "New Chat")
        {
            conversation.Title = GenerateTitle(request.Message);
        }
        conversation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                userMessage = new { id = userMessage.Id, sender = "user", message = request.Message, createdAt = userMessage.CreatedAt, isEmergency = false },
                aiMessage = new { id = aiMessage.Id, sender = "assistant", message = geminiResponse.Reply, createdAt = aiMessage.CreatedAt, isEmergency = geminiResponse.IsEmergency },
                conversationTitle = conversation.Title
            }
        });
    }

    /// <summary>Get all conversations for the authenticated user</summary>
    [Authorize]
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userId = GetUserId();

        var conversations = await _context.ChatConversations
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
            .Select(c => new
            {
                id = c.Id,
                title = c.Title,
                createdAt = c.CreatedAt,
                updatedAt = c.UpdatedAt ?? c.CreatedAt,
                lastMessage = c.Messages.OrderByDescending(m => m.CreatedAt).Select(m => m.Message).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(new { success = true, data = conversations });
    }

    /// <summary>Get messages for a specific conversation</summary>
    [Authorize]
    [HttpGet("conversations/{conversationId:guid}")]
    public async Task<IActionResult> GetConversation(Guid conversationId)
    {
        var userId = GetUserId();

        var conversation = await _context.ChatConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId);

        if (conversation == null)
            return NotFound(new { success = false, message = "Conversation not found." });

        var messages = await _context.AiChatMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new
            {
                id = m.Id,
                sender = m.Sender,
                message = m.Message,
                createdAt = m.CreatedAt,
                isEmergency = m.IsEmergency
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                id = conversation.Id,
                title = conversation.Title,
                createdAt = conversation.CreatedAt,
                messages
            }
        });
    }

    /// <summary>Create a new conversation</summary>
    [Authorize]
    [HttpPost("conversations")]
    public async Task<IActionResult> CreateConversation()
    {
        var userId = GetUserId();

        var conversation = new ChatConversation
        {
            UserId = userId,
            Title = "New Chat"
        };

        _context.ChatConversations.Add(conversation);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                id = conversation.Id,
                title = conversation.Title,
                createdAt = conversation.CreatedAt
            }
        });
    }

    /// <summary>Rename a conversation</summary>
    [Authorize]
    [HttpPut("conversations/{conversationId:guid}/rename")]
    public async Task<IActionResult> RenameConversation(Guid conversationId, [FromBody] RenameRequest request)
    {
        var userId = GetUserId();

        var conversation = await _context.ChatConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId);

        if (conversation == null)
            return NotFound(new { success = false, message = "Conversation not found." });

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { success = false, message = "Title cannot be empty." });

        conversation.Title = request.Title.Trim()[..Math.Min(request.Title.Trim().Length, 200)];
        conversation.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    /// <summary>Delete a conversation</summary>
    [Authorize]
    [HttpDelete("conversations/{conversationId:guid}")]
    public async Task<IActionResult> DeleteConversation(Guid conversationId)
    {
        var userId = GetUserId();

        var conversation = await _context.ChatConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId);

        if (conversation == null)
            return NotFound(new { success = false, message = "Conversation not found." });

        _context.ChatConversations.Remove(conversation); // Cascade deletes messages
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    /// <summary>Health check</summary>
    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "MedAI service is running", timestamp = DateTime.UtcNow });

    // ==================== HELPERS ====================

    private static string GenerateTitle(string firstMessage)
    {
        // Take first meaningful part of the message as title
        var title = firstMessage.Trim();
        if (title.Length > 50)
            title = title[..50].TrimEnd() + "...";
        return title;
    }
}

// ==================== REQUEST DTOs ====================

public class SendMessageRequest
{
    public string Message { get; set; } = string.Empty;
}

public class RenameRequest
{
    public string Title { get; set; } = string.Empty;
}
