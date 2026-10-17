using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Notifications;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Service.IService.Notifications;
using CafeShop.Service.IService.Users;
using CafeShop.Service.Service.Admin;
using CafeShop.Uitls;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using Xunit;

namespace CafeShop.Test.Services
{
    public class OrderRealtimeNotificationTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IOrderRepository> _mockOrderRepo;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ISignalRService> _mockSignalRService;
        private readonly Mock<IOrderStatusHistoryService> _mockHistoryService;
        private readonly Mock<IDbContextTransaction> _mockTransaction;

        public OrderRealtimeNotificationTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockOrderRepo = new Mock<IOrderRepository>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockSignalRService = new Mock<ISignalRService>();
            _mockHistoryService = new Mock<IOrderStatusHistoryService>();
            _mockTransaction = new Mock<IDbContextTransaction>();

            _mockUnitOfWork.Setup(u => u.Order).Returns(_mockOrderRepo.Object);
            _mockUnitOfWork.Setup(u => u.User).Returns(_mockUserRepo.Object);
            _mockUnitOfWork.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(_mockTransaction.Object);
        }

        [Fact]
        public async Task UpdateOrderStatusAsync_TriggersRealtimeNotificationToOrderManagementGroup()
        {
            // Arrange
            int adminId = 2;
            int orderId = 101;
            string newStatus = OrderStatus.Confirmed;

            var existingOrder = new Order
            {
                OrderId = orderId,
                UserId = 5,
                CurrentStatus = OrderStatus.Pending,
                PaymentMethod = PaymentMethodConstants.COD,
                PaymentStatus = PaymentStatusConstants.Unpaid,
                TotalAmount = 50000,
                User = new User { UserId = 5, FullName = "Nguyễn Văn Khách" }
            };

            var staffUser = new User
            {
                UserId = adminId,
                FullName = "Nhân viên Pha chế A"
            };

            _mockOrderRepo.Setup(r => r.GetFirstOrDefaultAsync(
                It.IsAny<Expression<Func<Order, bool>>>(),
                It.IsAny<string>()
            )).ReturnsAsync(existingOrder);

            _mockUserRepo.Setup(r => r.GetFirstOrDefaultAsync(
                It.IsAny<Expression<Func<User, bool>>>(),
                It.IsAny<string>()
            )).ReturnsAsync(staffUser);

            var adminOrderService = new AdminOrderService(
                _mockUnitOfWork.Object,
                _mockMapper.Object,
                _mockSignalRService.Object,
                _mockHistoryService.Object
            );

            // Act
            await adminOrderService.UpdateOrderStatusAsync(adminId, orderId, newStatus);

            // Assert: Gửi thông báo cho khách hàng
            _mockSignalRService.Verify(s => s.NotifyOrderStatusToUserAsync(
                existingOrder.UserId,
                orderId,
                newStatus
            ), Times.Once);

            // Assert: Gửi thông báo cho nhóm OrderManagement (Admin & Staff)
            _mockSignalRService.Verify(s => s.NotifyOrderEventAsync(
                It.Is<OrderNotificationDto>(dto =>
                    dto.OrderId == orderId &&
                    dto.OrderStatus == newStatus &&
                    dto.ActionUserId == adminId &&
                    dto.ActionUserName == staffUser.FullName &&
                    dto.NotificationType == NotificationTypes.OrderStatusChanged
                )
            ), Times.Once);
        }

        [Fact]
        public void NotificationConstants_HaveCorrectExpectedValues()
        {
            Assert.Equal("ReceiveOrderNotification", NotificationEvents.OrderNotification);
            Assert.Equal("OrderManagement", NotificationEvents.OrderManagementGroup);
            Assert.Equal("NewOrder", NotificationTypes.NewOrder);
            Assert.Equal("OrderCancelled", NotificationTypes.OrderCancelled);
            Assert.Equal("PaymentSuccess", NotificationTypes.PaymentSuccess);
            Assert.Equal("OrderStatusChanged", NotificationTypes.OrderStatusChanged);
        }
    }
}
