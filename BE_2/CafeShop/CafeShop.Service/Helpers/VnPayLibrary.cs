using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace CafeShop.Service.Helpers
{
    /// <summary>
    /// Thư viện hỗ trợ đóng gói dữ liệu, tạo URL thanh toán và xác thực chữ ký bảo mật với cổng VNPay (chuẩn VNPay 2.1.0).
    /// </summary>
    public class VnPayLibrary
    {
        // Sử dụng SortedList với bộ so sánh VnPayCompare để các tham số luôn được tự động sắp xếp theo thứ tự bảng chữ cái A-Z
        private readonly SortedList<string, string> _requestData = new(new VnPayCompare());
        private readonly SortedList<string, string> _responseData = new(new VnPayCompare());

        /// <summary>
        /// Thêm tham số gửi sang VNPay (chỉ thêm nếu giá trị không rỗng).
        /// </summary>
        public void AddRequestData(string key, string? value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _requestData[key] = value;
            }
        }

        /// <summary>
        /// Thêm tham số nhận về từ VNPay (từ Query string của Callback hoặc IPN).
        /// </summary>
        public void AddResponseData(string key, string? value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _responseData[key] = value;
            }
        }

        /// <summary>
        /// Lấy giá trị của một tham số trả về từ VNPay theo tên key (ví dụ: vnp_ResponseCode, vnp_TransactionNo).
        /// </summary>
        public string GetResponseData(string key)
        {
            return _responseData.TryGetValue(key, out var retValue) ? retValue : string.Empty;
        }

        /// <summary>
        /// Tạo URL chuyển hướng sang cổng thanh toán VNPay:
        /// 1. Duyệt qua toàn bộ tham số đã sắp xếp A-Z, mã hóa UrlEncode và ghép thành chuỗi truy vấn query string.
        /// 2. Băm chuỗi dữ liệu bằng thuật toán HMAC-SHA512 với HashSecret để tạo mã checksum an toàn (vnp_SecureHash).
        /// 3. Ghép vnp_SecureHash vào cuối URL và trả về cho Client chuyển hướng.
        /// </summary>
        public string CreateRequestUrl(string baseUrl, string vnpHashSecret)
        {
            var data = new StringBuilder();
            foreach (var (key, value) in _requestData)
            {
                if (!string.IsNullOrEmpty(value))
                {
                    data.Append(WebUtility.UrlEncode(key))
                        .Append('=')
                        .Append(WebUtility.UrlEncode(value))
                        .Append('&');
                }
            }

            var queryString = data.ToString();
            if (queryString.Length > 0)
            {
                // Xóa ký tự '&' thừa ở cuối cùng
                queryString = queryString.Remove(queryString.Length - 1, 1);
            }

            // Chuỗi dùng để ký là chính chuỗi query sau khi nối tham số
            var signData = queryString;
            var vnpSecureHash = HmacSha512(vnpHashSecret, signData);

            return $"{baseUrl}?{queryString}&vnp_SecureHash={vnpSecureHash}";
        }

        /// <summary>
        /// Kiểm tra tính hợp lệ của chữ ký (Checksum) do VNPay gửi về:
        /// Tự băm lại toàn bộ dữ liệu phản hồi với HashSecret và so sánh với mã hash VNPay gửi sang (inputHash).
        /// </summary>
        public bool ValidateSignature(string inputHash, string secretKey)
        {
            var rspRaw = GetResponseData();
            var myChecksum = HmacSha512(secretKey, rspRaw);

            // So sánh không phân biệt hoa thường để đảm bảo an toàn
            return myChecksum.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);
        }

        /// <summary>
        /// Lấy chuỗi dữ liệu phản hồi thô để tiến hành băm kiểm tra:
        /// Loại bỏ các trường hash (vnp_SecureHashType, vnp_SecureHash), sắp xếp và ghép lại thành chuỗi.
        /// </summary>
        private string GetResponseData()
        {
            var data = new StringBuilder();

            // Loại bỏ 2 trường chữ ký trước khi băm dữ liệu kiểm tra
            if (_responseData.ContainsKey("vnp_SecureHashType"))
            {
                _responseData.Remove("vnp_SecureHashType");
            }
            if (_responseData.ContainsKey("vnp_SecureHash"))
            {
                _responseData.Remove("vnp_SecureHash");
            }

            foreach (var (key, value) in _responseData)
            {
                if (!string.IsNullOrEmpty(value))
                {
                    data.Append(WebUtility.UrlEncode(key))
                        .Append('=')
                        .Append(WebUtility.UrlEncode(value))
                        .Append('&');
                }
            }

            if (data.Length > 0)
            {
                data.Remove(data.Length - 1, 1);
            }

            return data.ToString();
        }

        /// <summary>
        /// Thuật toán băm HMAC-SHA512: Tạo chuỗi băm 128 ký tự hex an toàn theo chuẩn VNPay.
        /// </summary>
        private static string HmacSha512(string key, string inputData)
        {
            var hash = new StringBuilder();
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);

            using var hmac = new HMACSHA512(keyBytes);
            var hashValue = hmac.ComputeHash(inputBytes);

            foreach (var theByte in hashValue)
            {
                hash.Append(theByte.ToString("x2"));
            }
            return hash.ToString();
        }
    }

    /// <summary>
    /// Bộ so sánh chuỗi theo bảng mã chuẩn (Ordinal) để sắp xếp các key theo đúng chuẩn yêu cầu của VNPay.
    /// </summary>
    public class VnPayCompare : IComparer<string>
    {
        public int Compare(string? x, string? y)
        {
            if (x == y) return 0;
            if (x == null) return -1;
            if (y == null) return 1;

            var compareInfo = CompareInfo.GetCompareInfo("en-US");
            return compareInfo.Compare(x, y, CompareOptions.Ordinal);
        }
    }
}
