using System.Text.Json.Serialization;

namespace CafeShop.DTO.Payment.Responses
{
    public class VnPayIpnResponseDto
    {
        [JsonPropertyName("RspCode")]
        public string RspCode { get; set; } = "99";

        [JsonPropertyName("Message")]
        public string Message { get; set; } = "Unknow error";

        public static VnPayIpnResponseDto Success() => new() { RspCode = "00", Message = "Confirm Success" };
        public static VnPayIpnResponseDto OrderNotFound() => new() { RspCode = "01", Message = "Order not found" };
        public static VnPayIpnResponseDto OrderAlreadyConfirmed() => new() { RspCode = "02", Message = "Order already confirmed" };
        public static VnPayIpnResponseDto InvalidAmount() => new() { RspCode = "04", Message = "Invalid amount" };
        public static VnPayIpnResponseDto InvalidSignature() => new() { RspCode = "97", Message = "Invalid Checksum" };
        public static VnPayIpnResponseDto Fail(string message = "Unknown error") => new() { RspCode = "99", Message = message };
    }
}
