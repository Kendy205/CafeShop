using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Payment.Responses;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using CafeShop.Service.IService.Notifications;
using CafeShop.Service.IService.Users;
using CafeShop.Uitls;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;

namespace CafeShop.Service.Service
{
    /// <summary>
    /// Service xử lý toàn bộ logic tích hợp cổng thanh toán VNPay:
    /// - Sinh URL thanh toán có chữ ký HMAC-SHA512
    /// - Tạo URL thanh toán lại cho đơn hàng chưa thanh toán
    /// - Tiếp nhận và xử lý Return Callback (chuyển hướng trình duyệt)
    /// - Tiếp nhận và xử lý Webhook IPN (Server-to-Server an toàn với Database Transaction)
    /// </summary>
    public class VnPayService : IVnPayService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly VnPaySettings _settings;
        private readonly IOrderStatusHistoryService _historyService;
        private readonly ISignalRService _signalRService;
        private readonly ILogger<VnPayService> _logger;

        public VnPayService(
            IUnitOfWork unitOfWork,
            IOptions<VnPaySettings> settings,
            IOrderStatusHistoryService historyService,
            ISignalRService signalRService,
            ILogger<VnPayService> logger)
        {
            _unitOfWork = unitOfWork;
            _settings = settings.Value;
            _historyService = historyService;
            _signalRService = signalRService;
            _logger = logger;
        }

        /// <summary>
        /// Tạo URL thanh toán VNPay trực tiếp từ đối tượng Order:
        /// - Đóng gói các tham số theo chuẩn VNPay (vnp_Version, vnp_Command, vnp_TmnCode, vnp_Amount,...)
        /// - Số tiền thanh toán: Lấy từ order.TotalAmount (đã trừ voucher) nhân 100
        /// - Mã giao dịch vnp_TxnRef: Gắn kèm timestamp {OrderId}_{yyyyMMddHHmmss} để đảm bảo tính duy nhất trong ngày
        /// </summary>
        public string CreatePaymentUrl(Order order, string ipAddress)
        {
            var vnpay = new VnPayLibrary();
            var payDate = DateTimeHelper.VietnamNow; // Giờ chuẩn Việt Nam (GMT+7)

            // Gắn timestamp vào TxnRef để mỗi lần thử thanh toán đều là duy nhất đối với cổng VNPay
            string txnRef = $"{order.OrderId}_{payDate:yyyyMMddHHmmss}";
            long amount = (long)(order.TotalAmount * 100);

            vnpay.AddRequestData("vnp_Version", _settings.Version);
            vnpay.AddRequestData("vnp_Command", _settings.Command);
            vnpay.AddRequestData("vnp_TmnCode", _settings.TmnCode);
            vnpay.AddRequestData("vnp_Amount", amount.ToString());
            vnpay.AddRequestData("vnp_CreateDate", payDate.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", _settings.CurrCode);
            vnpay.AddRequestData("vnp_IpAddr", string.IsNullOrWhiteSpace(ipAddress) ? "127.0.0.1" : ipAddress);
            vnpay.AddRequestData("vnp_Locale", _settings.Locale);
            vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan don hang {order.OrderId}");
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", _settings.ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef", txnRef);

            return vnpay.CreateRequestUrl(_settings.BaseUrl, _settings.HashSecret);
        }

        /// <summary>
        /// Tạo URL thanh toán VNPay cho đơn hàng cũ chưa thanh toán:
        /// - Kiểm tra đơn hàng có tồn tại không
        /// - Kiểm tra quyền sở hữu đơn hàng của user (bảo mật)
        /// - Chặn thanh toán nếu đơn hàng đã thanh toán rồi hoặc đã bị hủy
        /// </summary>
        public async Task<VnPayPaymentUrlResponseDto> CreatePaymentUrlAsync(int orderId, int userId, string ipAddress)
        {
            var order = await _unitOfWork.Order.GetFirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null)
            {
                throw new ArgumentException("Không tìm thấy đơn hàng cần thanh toán!");
            }

            if (order.UserId != userId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền thanh toán cho đơn hàng này!");
            }

            if (string.Equals(order.PaymentStatus, PaymentStatusConstants.Paid, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Đơn hàng này đã được thanh toán trước đó!");
            }

            if (order.CurrentStatus == OrderStatus.Cancelled)
            {
                throw new InvalidOperationException("Đơn hàng đã bị hủy, không thể tiếp tục thanh toán!");
            }

            string paymentUrl = CreatePaymentUrl(order, ipAddress);

            return new VnPayPaymentUrlResponseDto
            {
                OrderId = order.OrderId,
                Amount = order.TotalAmount,
                PaymentUrl = paymentUrl
            };
        }

        /// <summary>
        /// Xử lý Return Callback khi VNPay redirect trình duyệt khách hàng về:
        /// 1. Kiểm tra chữ ký bảo mật vnp_SecureHash
        /// 2. Tách OrderId từ vnp_TxnRef
        /// 3. Dịch mã kết quả giao dịch vnp_ResponseCode thành thông báo tiếng Việt
        /// </summary>
        public async Task<VnPayCallbackResultDto> ProcessReturnCallbackAsync(IQueryCollection query)
        {
            var vnpay = new VnPayLibrary();
            foreach (var (key, value) in query)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    vnpay.AddResponseData(key, value);
                }
            }

            string vnp_SecureHash = query["vnp_SecureHash"]!;
            bool isValidSignature = vnpay.ValidateSignature(vnp_SecureHash, _settings.HashSecret);

            if (!isValidSignature)
            {
                return new VnPayCallbackResultDto
                {
                    Success = false,
                    Message = "Chữ ký giao dịch không hợp lệ!"
                };
            }

            string vnp_TxnRef = vnpay.GetResponseData("vnp_TxnRef");
            int orderId = ParseOrderIdFromTxnRef(vnp_TxnRef);
            string vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
            string vnp_TransactionNo = vnpay.GetResponseData("vnp_TransactionNo");
            string vnp_BankCode = vnpay.GetResponseData("vnp_BankCode");
            long vnp_Amount = long.TryParse(vnpay.GetResponseData("vnp_Amount"), out var amt) ? amt : 0;
            decimal amount = vnp_Amount / 100m;

            bool isSuccess = vnp_ResponseCode == "00";

            return await Task.FromResult(new VnPayCallbackResultDto
            {
                Success = isSuccess,
                OrderId = orderId,
                TransactionNo = vnp_TransactionNo,
                BankCode = vnp_BankCode,
                Amount = amount,
                ResponseCode = vnp_ResponseCode,
                Message = isSuccess ? "Giao dịch thành công!" : GetVnPayErrorMessage(vnp_ResponseCode)
            });
        }

        /// <summary>
        /// Xử lý Webhook IPN (Instant Payment Notification - Server to Server):
        /// - Kênh chuẩn xác và an toàn nhất để cập nhật database khi có giao dịch
        /// - 1. Kiểm tra chữ ký số (Checksum) bằng HMAC-SHA512
        /// - 2. Kiểm tra sự tồn tại của đơn hàng
        /// - 3. Kiểm tra số tiền thực nhận có khớp với TotalAmount trong Database không
        /// - 4. Kiểm tra trạng thái đơn (chống lặp Idempotency)
        /// - 5. Dùng Database Transaction cập nhật Order.PaymentStatus và lưu bản ghi Payments
        /// - 6. Bắn thông báo Realtime SignalR cho người dùng
        /// - 7. Trả mã phản hồi đúng chuẩn VNPay: { RspCode: "00", Message: "Confirm Success" }
        /// </summary>
        public async Task<VnPayIpnResponseDto> ProcessIpnCallbackAsync(IQueryCollection query)
        {
            try
            {
                var vnpay = new VnPayLibrary();
                foreach (var (key, value) in query)
                {
                    if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                    {
                        vnpay.AddResponseData(key, value);
                    }
                }

                // 1. Kiểm tra chữ ký điện tử HMAC-SHA512
                string vnp_SecureHash = query["vnp_SecureHash"]!;
                bool isValidSignature = vnpay.ValidateSignature(vnp_SecureHash, _settings.HashSecret);

                if (!isValidSignature)
                {
                    _logger.LogWarning("VNPay IPN: Invalid signature detected.");
                    return VnPayIpnResponseDto.InvalidSignature(); // Trả mã 97: Invalid Checksum
                }

                string vnp_TxnRef = vnpay.GetResponseData("vnp_TxnRef");
                int orderId = ParseOrderIdFromTxnRef(vnp_TxnRef);
                string vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
                string vnp_TransactionStatus = vnpay.GetResponseData("vnp_TransactionStatus");
                string vnp_TransactionNo = vnpay.GetResponseData("vnp_TransactionNo");
                long vnp_Amount = long.TryParse(vnpay.GetResponseData("vnp_Amount"), out var amt) ? amt : 0;
                decimal amount = vnp_Amount / 100m;

                // 2. Kiểm tra đơn hàng có tồn tại không
                var order = await _unitOfWork.Order.GetFirstOrDefaultAsync(o => o.OrderId == orderId);
                if (order == null)
                {
                    _logger.LogWarning("VNPay IPN: Order {OrderId} not found.", orderId);
                    return VnPayIpnResponseDto.OrderNotFound(); // Trả mã 01: Order not found
                }

                // 3. Kiểm tra tính toàn vẹn số tiền
                if (order.TotalAmount != amount)
                {
                    _logger.LogWarning("VNPay IPN: Order {OrderId} invalid amount. Expected: {Expected}, Actual: {Actual}", orderId, order.TotalAmount, amount);
                    return VnPayIpnResponseDto.InvalidAmount(); // Trả mã 04: Invalid amount
                }

                // 4. Chống lặp (Idempotency): Nếu đơn hàng đã được xác nhận thanh toán rồi
                if (string.Equals(order.PaymentStatus, PaymentStatusConstants.Paid, StringComparison.OrdinalIgnoreCase))
                {
                    return VnPayIpnResponseDto.OrderAlreadyConfirmed(); // Trả mã 02: Order already confirmed
                }

                // 5. Thực hiện cập nhật Database bằng Transaction
                using var transaction = await _unitOfWork.BeginTransactionAsync();
                try
                {
                    bool isSuccess = vnp_ResponseCode == "00" && vnp_TransactionStatus == "00";

                    if (isSuccess)
                    {
                        order.PaymentStatus = PaymentStatusConstants.Paid;
                        order.PaymentMethod = PaymentMethodConstants.VNPAY;

                        var payment = new Payment
                        {
                            OrderId = order.OrderId,
                            PaymentMethod = PaymentMethodConstants.VNPAY,
                            PaymentProvider = PaymentStatusConstants.ProviderVNPay,
                            TransactionCode = vnp_TransactionNo,
                            Amount = amount,
                            PaymentStatus = PaymentStatusConstants.PaymentSuccess,
                            PaidAt = DateTimeHelper.VietnamNow,
                            CreatedAt = DateTimeHelper.VietnamNow
                        };

                        await _unitOfWork.Payment.AddAsync(payment);
                        await _historyService.AddHistoryAsync(order.OrderId, order.CurrentStatus ?? OrderStatus.Pending, order.UserId, $"Thanh toán VNPay thành công (Mã GD: {vnp_TransactionNo})");
                    }
                    else
                    {
                        order.PaymentStatus = PaymentStatusConstants.Failed;

                        var payment = new Payment
                        {
                            OrderId = order.OrderId,
                            PaymentMethod = PaymentMethodConstants.VNPAY,
                            PaymentProvider = PaymentStatusConstants.ProviderVNPay,
                            TransactionCode = vnp_TransactionNo,
                            Amount = amount,
                            PaymentStatus = PaymentStatusConstants.PaymentFailed,
                            ErrorMessage = GetVnPayErrorMessage(vnp_ResponseCode),
                            CreatedAt = DateTimeHelper.VietnamNow
                        };

                        await _unitOfWork.Payment.AddAsync(payment);
                        await _historyService.AddHistoryAsync(order.OrderId, order.CurrentStatus ?? OrderStatus.Pending, order.UserId, $"Thanh toán VNPay thất bại ({GetVnPayErrorMessage(vnp_ResponseCode)})");
                    }

                    await _unitOfWork.SaveAsync();
                    await transaction.CommitAsync();

                    // Bắn thông báo Realtime nếu thành công
                    if (isSuccess)
                    {
                        try
                        {
                            await _signalRService.NotifyOrderStatusToUserAsync(order.UserId, order.OrderId, "Thanh toán thành công");
                        }
                        catch { /* Ignore notification error */ }
                    }

                    return VnPayIpnResponseDto.Success(); // Trả mã 00: Confirm Success
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "VNPay IPN error processing order {OrderId}", orderId);
                    return VnPayIpnResponseDto.Fail(ex.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "VNPay IPN unhandled exception");
                return VnPayIpnResponseDto.Fail(ex.Message);
            }
        }

        /// <summary>
        /// Tách lấy OrderId từ mã vnp_TxnRef dạng {OrderId}_{Timestamp}.
        /// </summary>
        private static int ParseOrderIdFromTxnRef(string txnRef)
        {
            if (string.IsNullOrEmpty(txnRef)) return 0;
            var parts = txnRef.Split('_');
            return int.TryParse(parts[0], out int id) ? id : 0;
        }

        /// <summary>
        /// Tra cứu thông điệp lỗi tương ứng với mã vnp_ResponseCode từ cổng VNPay.
        /// </summary>
        private static string GetVnPayErrorMessage(string responseCode)
        {
            return responseCode switch
            {
                "00" => "Giao dịch thành công",
                "07" => "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
                "09" => "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
                "10" => "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
                "11" => "Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
                "12" => "Thẻ/Tài khoản bị khóa.",
                "13" => "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin vui lòng thực hiện lại.",
                "24" => "Khách hàng hủy giao dịch.",
                "51" => "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
                "65" => "Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.",
                "75" => "Ngân hàng thanh toán đang bảo trì.",
                "79" => "Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.",
                _ => $"Lỗi không xác định từ cổng VNPay (Mã lỗi: {responseCode})"
            };
        }
    }
}
