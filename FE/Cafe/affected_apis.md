# Danh sách API bị ảnh hưởng sau quá trình cập nhật (Backend Fixes)

Dưới đây là tài liệu tổng hợp những API có thay đổi về mặt Contract (Dữ liệu gửi lên/trả về) hoặc thay đổi về Behavior (Hành vi phản hồi, mã lỗi) sau khi Backend đã xử lý các lỗi nghiêm trọng (State Machine, Snapshot, Concurrency, v.v...). Frontend cần lưu ý để cập nhật lại xử lý ở phía UI.

## 1. Module Đơn Hàng (Order) - Admin
### Cập nhật trạng thái đơn hàng
- **API**: `PUT /api/admin/Order/{id}/status`
- **Mức độ ảnh hưởng**: MẠNH (Thay đổi Request Body và Hành vi)
- **Thay đổi**: 
  - **Request Body**: Thêm trường `CancelReason` (string, tuỳ chọn). NẾU chuyển trạng thái sang `CANCELLED`, bắt buộc Frontend phải gửi `CancelReason` này lên, nếu không Backend sẽ trả về `400 Bad Request`.
  - **Hành vi (State Machine)**: Backend đã chặn đứng việc nhảy cóc trạng thái. Quy trình bắt buộc là: `PENDING` -> `CONFIRMED` -> `PREPARING` -> `DELIVERING` -> `COMPLETED`. Admin không thể đổi thẳng từ `PENDING` sang `COMPLETED`. Nếu gửi sai thứ tự hoặc truyền sai tên (VD: gửi `SHIPPING` thay vì `DELIVERING`), Backend trả về `400 Bad Request`. Đặc biệt, khi đã vào trạng thái `DELIVERING` thì hệ thống khóa chức năng Hủy (`CANCELLED`).

## 2. Module Đơn Hàng (Order) - User/FE
### Lấy danh sách & Chi tiết đơn hàng
- **API**: `GET /api/Order/my-orders`, `GET /api/admin/Order/{id}`
- **Mức độ ảnh hưởng**: TRUNG BÌNH (Thêm/Sửa thuộc tính)
- **Thay đổi**: 
  - Đã loại bỏ field `DiscountAmount` gộp chung.
  - Bổ sung 3 trường mới để tường minh hóa dòng tiền:
    - `SubTotal`: Tổng tiền món ăn gốc.
    - `OrderDiscount`: Tiền được giảm giá trực tiếp vào món ăn.
    - `ShippingDiscount`: Tiền được giảm giá cước ship (FreeShip).
  - Snapshot thông tin người nhận (`UserName`, `UserPhone`, `ShippingAddress`) hiện tại trả về là bản ghi cố định thay vì join với Sổ địa chỉ.

### Checkout / Đặt hàng
- **API**: `POST /api/Order/checkout`
- **Mức độ ảnh hưởng**: NHẸ (Thay đổi mã lỗi)
- **Thay đổi**: 
  - Đã mở chặn kiểm tra Khoảng cách MaxDistanceKm. Nếu khách vượt quá bán kính cấu hình (VD: 10km), API trả về `400 Bad Request` kèm câu thông báo từ chối ship. (Lỗi 20)
  - Khi áp dụng chung 1 mã giảm giá bị giới hạn số lượng, 10 người cùng bấm Đặt hàng sẽ có 9 người nhận được `400 Bad Request` (Báo mã giảm giá đã quá tải hoặc có người xài trước). (Lỗi 19)

## 3. Module Người Dùng (Auth)
### Đổi mật khẩu
- **API**: `PUT /api/User/change-password`
- **Mức độ ảnh hưởng**: TRUNG BÌNH (Quy trình Auth)
- **Thay đổi**: Đổi mật khẩu thành công thì Backend sẽ tự động vô hiệu hóa toàn bộ `RefreshToken` cũ. Các thiết bị khác đang đăng nhập tài khoản này sẽ tự động bị rớt (Unauthorized `401` khi AccessToken hết hạn) và phải đăng nhập lại. (Lỗi 21)

## 4. Module Cấu trúc Hệ thống (Global Behavior)
- **Xóa món ăn (`DELETE /api/admin/Product/{id}`)**: Sẽ báo lỗi Database nếu cố gắng xóa 1 món ăn đã từng có người đặt (Lỗi 11).
- **Tạo Voucher / Đăng ký (`POST`)**: Sẽ ném lỗi xung đột `400` / `409` nếu cố tình truyền lên `Username`, `Email` hoặc `Voucher Code` đã tồn tại trong DB, tránh lặp dữ liệu (Lỗi 7).

## 5. Module Sản Phẩm (Product)
### Danh sách / Chi tiết Sản phẩm
- **API**: `GET /api/Product`, `GET /api/Product/{id}`
- **Mức độ ảnh hưởng**: MẠNH (Thay đổi kiểu dữ liệu Nullable)
- **Thay đổi**:
  - Trường `StockQuantity` (của Product gốc) đã được chuyển thành kiểu `int?` (Nullable). 
  - Nếu sản phẩm **có chia Size** (`ProductSizes` có phần tử), API sẽ chủ động đè `StockQuantity = null`. Frontend phải tự check: "Nếu StockQuantity là null thì chui vào mảng ProductSizes để render tồn kho theo Size".
  - Nếu sản phẩm **không có Size**, `StockQuantity` vẫn trả về con số tồn kho thật như bình thường.
  - Các hằng số ma thuật (Magic String) ở backend đã được loại bỏ và CHUYỂN HẾT THÀNH IN HOA. Frontend vui lòng sử dụng đúng Enum chữ (VD: `ACTIVE`, `CONVERTED` đối với Cart).
