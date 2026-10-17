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
    public class NotificationHub() : Hub
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

            var roleClaims = user?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList() 
                          ?? new System.Collections.Generic.List<string>();
            var singleRole = user?.FindFirst("role")?.Value;
            if (!string.IsNullOrEmpty(singleRole) && !roleClaims.Contains(singleRole, StringComparer.OrdinalIgnoreCase))
            {
                roleClaims.Add(singleRole);
            }

            bool isAdmin = user?.IsInRole(SystemRole.Admin) == true 
                        || roleClaims.Any(r => string.Equals(r, SystemRole.Admin, StringComparison.OrdinalIgnoreCase));

            bool isStaff = user?.IsInRole(SystemRole.Staff) == true 
                        || roleClaims.Any(r => string.Equals(r, SystemRole.Staff, StringComparison.OrdinalIgnoreCase));

            // Cả Admin và Staff đều tham gia nhóm vận hành đơn hàng
            if (isAdmin || isStaff)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, NotificationEvents.OrderManagementGroup);
            }

            // Chỉ Admin mới tham gia nhóm quản trị đặc thù
            if (isAdmin)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, NotificationEvents.AdminsGroup);
            }

            await base.OnConnectedAsync();
        }
    }
}