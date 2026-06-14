using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace DoctorAppointment.API.Hubs
{
    [Authorize]
    public class VideoHub : Hub
    {
        public async Task JoinVideoRoom(string appointmentId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"video-{appointmentId}");
            await Clients.OthersInGroup($"video-{appointmentId}").SendAsync("UserJoined", Context.UserIdentifier);
        }

        public async Task LeaveVideoRoom(string appointmentId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"video-{appointmentId}");
            await Clients.OthersInGroup($"video-{appointmentId}").SendAsync("UserLeft", Context.UserIdentifier);
        }

        public async Task SendSignal(string appointmentId, string signal)
        {
            await Clients.OthersInGroup($"video-{appointmentId}").SendAsync("ReceiveSignal", Context.UserIdentifier, signal);
        }

        public async Task SendIceCandidate(string appointmentId, string candidate)
        {
            await Clients.OthersInGroup($"video-{appointmentId}").SendAsync("ReceiveIceCandidate", Context.UserIdentifier, candidate);
        }

        // Send call invitation directly to a specific user (not group-based)
        public async Task InitiateCall(string roomId, string callerName, string targetUserId)
        {
            await Clients.User(targetUserId).SendAsync("IncomingCall", Context.UserIdentifier, callerName, roomId);
        }

        // Send response back to the caller directly
        public async Task RespondToCall(string roomId, bool accepted, string callerUserId)
        {
            if (accepted)
            {
                await Clients.User(callerUserId).SendAsync("CallAccepted", roomId);
            }
            else
            {
                await Clients.User(callerUserId).SendAsync("CallRejected", roomId);
            }
        }
    }
}
