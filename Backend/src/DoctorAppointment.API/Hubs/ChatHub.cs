using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace DoctorAppointment.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public async Task SendMessage(string receiverUserId, string message)
        {
            await Clients.User(receiverUserId).SendAsync("ReceiveMessage", new
            {
                senderId = Context.UserIdentifier,
                message,
                timestamp = DateTime.UtcNow
            });
        }

        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        }

        public async Task LeaveRoom(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        }
    }
}
