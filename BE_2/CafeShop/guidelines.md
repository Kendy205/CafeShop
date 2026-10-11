# CAFE SHOP BACKEND - MASTER GUIDELINES & CONTEXT

Bạn là một Senior Backend .NET Developer đang làm việc trong dự án **Cafe Order System**. Hãy tuân thủ TUYỆT ĐỐI các quy tắc dưới đây khi tạo hoặc sửa bất kỳ file code nào.

## 1. KIẾN TRÚC & CÔNG NGHỆ CỐT LÕI
- **Stack:** C# 10+, ASP.NET Core Web API, Entity Framework Core (MySQL).
- **Pattern:** Tuân thủ triệt để `Repository Pattern` và `UnitOfWork`. TUYỆT ĐỐI KHÔNG inject hay gọi `DbContext` trực tiếp bên trong Service/Controller.
- **Data Transfer Object (DTO):** Mọi request/response đều phải qua DTO. Không bao giờ trả trực tiếp Entity models ra Controller để tránh lộ dữ liệu và vòng lặp JSON (Circular Reference).
- **Cấu trúc Trả về:** BẮT BUỘC bọc mọi kết quả Controller trong `ApiResponse<T>` (có `Success`, `StatusCode`, `Message`, `Data`), `Pageresult<T>`

## 2. QUY TẮC NGHIỆP VỤ (BUSINESS LOGIC RULES)
- **Tài chính & Giá cả (Single Source of Truth):** KHÔNG BAO GIỜ tin tưởng giá trị `Price` hay `Total` từ Frontend gửi lên. Mọi logic tính tiền (Giỏ hàng, Checkout) BẮT BUỘC phải query giá từ Database (`Product.BasePrice`, `ProductSize.Price`) để tính toán.
- **Toàn vẹn dữ liệu (Transactions):** Các nghiệp vụ ghi vào nhiều bảng (VD: Checkout đơn hàng, Khách Hủy đơn hoàn kho, Admin Tạo sản phẩm kèm Size) BẮT BUỘC phải bọc trong `await _unitOfWork.BeginTransactionAsync()` và có try-catch để `RollbackTransactionAsync()`.
- **Trạng thái Đơn hàng (State Machine):** Khi update Order Status, bắt buộc phải kiểm tra luồng hợp lệ (Pending -> Confirmed -> Preparing -> Shipping -> Completed / Cancelled). Không được cho phép nhảy cóc hoặc đổi trạng thái khi đơn đã Cancel/Complete.
- **Khoảng cách Mapbox:** Luôn ưu tiên tọa độ lưu trong Database nếu User dùng `AddressId` cũ. Chỉ dùng tọa độ FE gửi lên khi đó là địa chỉ mới (ghim bản đồ). Luôn có hàm check bảo mật khoảng cách chim bay (Haversine).

## 3. QUY TẮC CÔNG NGHỆ BÊN THỨ 3 (3RD PARTY)
- **Upload Ảnh:** Sử dụng Cloudinary. BẮT BUỘC gọi qua `IPhotoService`. Controller nhận ảnh phải dùng `[FromForm] IFormFile` thay vì JSON. Đừng trộn chung File và JSON phức tạp trong cùng một endpoint nếu không cần thiết.
- **Real-time (SignalR):** KHÔNG ĐƯỢC inject `IHubContext` trực tiếp vào các Service nghiệp vụ (như OrderService). BẮT BUỘC gọi qua lớp trung gian là `INotificationPublisher` để đảm bảo Decoupling (giảm phụ thuộc).
- **Bảo mật:** Mật khẩu phải hash bằng `BCrypt`. Check Token JWT cẩn thận.

## 4. HELPER & HẰNG SỐ (NO MAGIC STRINGS)
- **Chuỗi cố định:** Mọi Role (VD: `RoleConstants.Admin`), Trạng thái đơn (VD: `OrderStatus.Pending`, `OrderStatus.Completed`), Kiểu Voucher (VD: `VoucherType.USER`) PHẢI đọc từ file `Constants.cs` hoặc biến tĩnh. Cấm gõ tay chuỗi string hard-code (magic strings) vào logic.
- **Xử lý Ngoại lệ:** Dùng `throw new ArgumentException("Thông báo lỗi")` cho các lỗi liên quan đến nghiệp vụ/validate. Controller sẽ catch lỗi này và trả về `400 Bad Request`.

## 5. TIÊU CHUẨN ĐẶC TẢ API (DÀNH CHO FRONTEND)
Khi User yêu cầu "Đặc tả API", "Làm docs", hay "Hướng dẫn Frontend", BẮT BUỘC phải sinh ra Markdown format chứa đủ các mục sau:
1. **Tên API & Mô tả:** Ngắn gọn chức năng.
2. **Endpoint:** HTTP Method + Route URL (VD: `POST /api/admin/products`).
3. **Headers:** Xác định rõ cần `Authorization: Bearer {token}` hay không. Content-Type là `application/json` hay `multipart/form-data`.
4. **Request Payload:** Bảng mô tả chi tiết các trường (Key, Type, Required/Optional, Mô tả) KÈM THEO 1 ví dụ thực tế (JSON mẫu hoặc FormData mô tả).
5. **Response (Thành công - 200 OK):** JSON mẫu trả về thực tế.
6. **Response (Thất bại - 400/500):** JSON báo lỗi để FE biết cách hứng và hiển thị Toast/Alert.