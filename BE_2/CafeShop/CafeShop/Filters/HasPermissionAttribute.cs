using System;
using System.Linq;
using System.Security.Claims;
using CafeShop.Service.Helpers;
using CafeShop.Uitls;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CafeShop.Filters
{
    /// <summary>
    /// Attribute kiểm tra quyền (RBAC Permission-based) dựa trên Claim 'Permission' trong JWT Token.
    /// Admin mặc định có toàn quyền bỏ qua bước kiểm tra.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class HasPermissionAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string _permission;

        public HasPermissionAttribute(string permission)
        {
            _permission = permission;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            // 1. Kiểm tra đã đăng nhập chưa
            if (user.Identity == null || !user.Identity.IsAuthenticated)
            {
                context.Result = new ObjectResult(ApiResponse<object>.Failed("Vui lòng đăng nhập để thực hiện thao tác!", StatusCodes.Status401Unauthorized))
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
                return;
            }

            // 2. ADMIN có toàn quyền cao nhất trên mọi tài nguyên
            if (user.IsInRole(SystemRole.Admin))
            {
                return;
            }

            // 3. Kiểm tra User có Claim Permission tương ứng không
            var hasPermission = user.Claims.Any(c =>
                string.Equals(c.Type, "Permission", StringComparison.OrdinalIgnoreCase) &&
                string.Equals(c.Value, _permission, StringComparison.OrdinalIgnoreCase));

            if (!hasPermission)
            {
                context.Result = new ObjectResult(ApiResponse<object>.Failed($"Bạn không có quyền thực hiện chức năng này ({_permission})!", StatusCodes.Status403Forbidden))
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }
        }
    }
}
