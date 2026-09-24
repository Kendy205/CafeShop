---
description: Quy trình chuẩn để phát triển, sửa lỗi và đặc tả API trong dự án CafeShop Backend (.NET 8 Clean Architecture)
---

# CAFE SHOP BACKEND - AGENT WORKFLOW

Quy trình chuẩn dành cho Agent khi thực hiện bất kỳ nhiệm vụ nào trong dự án **CafeShop Backend** (thêm tính năng mới, sửa lỗi, refactor, viết test, sinh tài liệu API).

---

## 1. QUY TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ)

1. **Kiến trúc N-Tier & Pattern:**
   - Sử dụng **Repository Pattern** & **UnitOfWork** thông qua `_unitOfWork`.
   - **CẤM** inject hoặc gọi trực tiếp `ApplicationDbContext` trong Service hoặc Controller.
   - **CẤM** trả trực tiếp Entity từ `CafeShop.Model` ra Controller. Mọi dữ liệu vào/ra đều phải qua DTO trong `CafeShop.DTO`.
   - Mọi response API phải được bọc trong `ApiResponse<T>` hoặc `Pageresult<T>`.

2. **Quy tắc Tài chính & Bảo mật:**
   - **Single Source of Truth:** Tuyệt đối KHÔNG tin giá (`UnitPrice`, `Price`, `TotalAmount`) gửi từ Frontend lên. Luôn query từ Database (`Product.BasePrice`, `ProductSize.Price`, `Topping.Price`) để tính toán.
   - **Database Transactions:** Mọi tác vụ ghi dữ liệu vào từ 2 bảng trở lên (Đặt hàng, Hủy đơn hoàn kho, Thêm món kèm Size/Topping) BẮT BUỘC phải dùng `await _unitOfWork.BeginTransactionAsync()` kèm `try-catch` để `RollbackTransactionAsync()`.
   - **Trạng thái Đơn hàng (State Machine):** Tuân thủ luồng: `Pending` -> `Confirmed` -> `Preparing` -> `Shipping` -> `Completed` (hoặc `Cancelled`). Không cho phép đổi trạng thái khi đơn đã Hoàn tất hoặc Đã hủy.

3. **Helper & No Magic Strings:**
   - Sử dụng hằng số từ `CafeShop.Uitls`: `SystemRole.Admin`, `SystemRole.User`, `OrderStatus.*`, `VoucherTypeTarget.*`. Cấm hard-code chuỗi ký tự.

---

## 2. WORKFLOW 1: THÊM TÍNH NĂNG / ENDPOINT API MỚI

Khi được yêu cầu tạo một chức năng mới, Agent thực hiện tuần tự theo 6 bước:

### Bước 1: Kiểm tra & Cập nhật Model (`CafeShop.Model`)
- Nếu cần entity mới hoặc thêm cột: Thêm vào `CafeShop.Model`.
- Sử dụng DataAnnotations chuẩn: `[Key]`, `[Required]`, `[StringLength]`, `[ForeignKey]`.
- Thêm `DbSet<Entity>` vào `ApplicationDbContext` trong `CafeShop.Data` nếu là Entity mới.

### Bước 2: Tạo DTO (`CafeShop.DTO`)
- Phân định rõ DTO thuộc phân hệ Khách hàng (`DTO/Product`, `DTO/Order`...) hay Quản trị (`DTO/Admin`).
- Tạo Request DTO: Chỉ chứa các trường cần thiết người dùng gửi lên.
- Tạo Response DTO: Chứa dữ liệu trả về an toàn, không chứa thông tin nhạy cảm.

### Bước 3: Cập nhật Repository & UnitOfWork (`CafeShop.Data`)
- Kiểm tra xem `IUnitOfWork` và `UnitOfWork` đã có Repository cho Entity tương ứng chưa.
- Nếu cần truy vấn phức tạp (Include nhiều bảng, filter đặc thù): Viết thêm hàm trong Repository tương ứng thay vì viết query tùy tiện ở Service.

### Bước 4: Viết Service Nghiệp vụ (`CafeShop.Service`)
- Định nghĩa interface trong `IService/Users/` hoặc `IService/Admin/`.
- Triển khai class trong `Service/Users/` hoặc `Service/Admin/`.
- Logic tính toán tiền, kiểm tra tồn kho, kiểm tra điều kiện Voucher, bọc Transaction nếu có nhiều thao tác ghi.
- Đăng ký Dependency Injection trong `CafeShop/Program.cs`: `builder.Services.AddScoped<IMyService, MyService>();`.

### Bước 5: Viết Controller (`CafeShop/Controllers`)
- Đặt đúng thư mục: `Controllers/User/` hoặc `Controllers/Admin/`.
- Khai báo Route chuẩn: `[Route("api/[controller]")]` hoặc `[Route("api/admin/[controller]")]`.
- Thêm bảo mật: `[Authorize]`, `[Authorize(Roles = SystemRole.Admin)]` nếu là API yêu cầu đăng nhập/quyền admin.
- Upload file ảnh: Dùng `[FromForm] IFormFile` và gọi `IPhotoService` (Cloudinary).
- Trả về chuẩn: `return Ok(new ApiResponse<T> { Success = true, Data = result, Message = "Thành công" });`.

### Bước 6: Kiểm tra AutoMapper & SignalR
- Nếu mapping giữa Entity và DTO: Cập nhật `MappingProfile.cs`.
- Nếu có sự kiện cần thông báo Real-time (Đơn hàng mới, đổi trạng thái đơn): Sử dụng `ISignalRService` để phát socket tới `NotificationHub`.

---

## 3. WORKFLOW 2: DEBUG & SỬA LỖI (BUG FIXING)

Khi sửa lỗi trong dự án, Agent phải:
1. **Đọc log / Stack Trace:** Xác định chính xác file và dòng code gây lỗi.
2. **Kiểm tra Null Reference:** Kiểm tra các navigation property trong Entity (`User`, `Product`, `OrderDetails`) có được `.Include()` khi query không.
3. **Kiểm tra Transaction:** Nếu lỗi xảy ra giữa chừng trong transaction, đảm bảo transaction được rollback và kết nối database được giải phóng.
4. **Kiểm tra DTO Mapping:** Đảm bảo AutoMapper đã cấu hình mapping giữa hai kiểu đối tượng, tránh lỗi mapping null.
5. **Không phá vỡ cấu trúc hiện tại:** Giữ nguyên các hàm/interface đang hoạt động tốt của các module khác.

---

## 4. WORKFLOW 3: ĐẶC TẢ API CHO FRONTEND (API DOCUMENTATION)

Khi người dùng yêu cầu đặc tả API hoặc viết docs cho Frontend, Agent BẮT BUỘC xuất ra định dạng Markdown chuẩn gồm 6 mục:
1. **Tên API & Mục đích:** Chức năng của endpoint.
2. **Endpoint:** `HTTP METHOD` + `/api/...` (Ví dụ: `POST /api/user/orders/checkout`).
3. **Headers:** `Authorization: Bearer {token}`, `Content-Type: application/json` hoặc `multipart/form-data`.
4. **Request Body:** Bảng mô tả chi tiết từng tham số (`Key`, `Type`, `Bắt buộc/Tùy chọn`, `Mô tả`) kèm JSON mẫu thực tế.
5. **Response Thành Công (200 OK):** JSON mẫu trả về bọc trong `ApiResponse<T>`.
6. **Response Thất Bại (400 / 401 / 403 / 500):** Mã lỗi và Message JSON tương ứng để Frontend bắt lỗi hiển thị Toast.
