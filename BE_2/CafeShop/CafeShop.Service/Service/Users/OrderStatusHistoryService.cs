using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Order.Requests;
using CafeShop.DTO.Order.Responses;
using CafeShop.Model;
using CafeShop.Service.IService.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CafeShop.Service.Service.Users
{
    public class OrderStatusHistoryService : IOrderStatusHistoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public OrderStatusHistoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task AddHistoryAsync(int orderId, string status, int changedByUserId, string? note = null)
        {
            var history = new OrderStatusHistory
            {
                OrderId = orderId,
                Status = status,
                ChangedBy = changedByUserId,
                ChangedAt = DateTime.UtcNow,
                Note = note
            };
            
            await _unitOfWork.OrderStatusHistory.AddAsync(history);
            // LƯU Ý: Không gọi SaveAsync ở đây vì ta muốn nó cùng chung transaction với quá trình đặt đơn/đổi trạng thái
        }

        public async Task<List<OrderStatusHistoryDto>> GetOrderHistoryAsync(int orderId)
        {
            var histories = await _unitOfWork.OrderStatusHistory.GetAllAsync(
                filter: h => h.OrderId == orderId,
                includeProperties: "UserAction",
                orderBy: q => q.OrderBy(h => h.ChangedAt)
            );

            return histories.Select(h => new OrderStatusHistoryDto
            {
                HistoryId = h.HistoryId,
                OrderId = h.OrderId,
                Status = h.Status ?? string.Empty,
                ChangedBy = h.ChangedBy,
                ChangedByName = h.UserAction?.FullName,
                ChangedAt = h.ChangedAt,
                Note = h.Note
            }).ToList();
        }
    }
}
