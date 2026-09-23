using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using CafeShop.Uitls;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CafeShop.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var user = Context.User;

            // Kiểm tra toàn diện tất cả các claim có thể chứa User ID
            var userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? user?.FindFirst("nameid")?.Value
                      ?? user?.FindFirst("sub")?.Value
                      ?? user?.FindFirst("id")?.Value
                      ?? user?.FindFirst("UserId")?.Value
                      ?? Context.UserIdentifier;

            if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out int parsedUserId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, NotificationEvents.UserGroup(parsedUserId));
            }

            var role = user?.FindFirst(ClaimTypes.Role)?.Value
                    ?? user?.FindFirst("role")?.Value;

            if (user?.IsInRole("Admin") == true 
                || user?.IsInRole(SystemRole.Admin) == true 
                || string.Equals(role, SystemRole.Admin, StringComparison.OrdinalIgnoreCase))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, NotificationEvents.AdminsGroup);
            }

            await base.OnConnectedAsync();
        }
    }
}