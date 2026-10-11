MODULE: NEWS

API: Get Public News
METHOD: GET
ENDPOINT: /api/news
AUTH: Public

QUERY:
keyword: string?
pageNumber: int (default = 1)
pageSize: int (default = 10)

RESPONSE 200:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Lấy danh sách tin tức thành công",
  "data": {
    "items": [
      {
        "newsId": 1,
        "title": "string",
        "slug": "string",
        "summary": "string",
        "imageUrl": "string",
        "status": "PUBLISHED",
        "authorName": "string",
        "publishedAt": "2026-09-25T10:00:00Z",
        "createdAt": "2026-09-24T08:00:00Z",
        "viewCount": 0
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

ERROR:
500 Lỗi hệ thống

---

API: Get Public News By ID
METHOD: GET
ENDPOINT: /api/news/{id}
AUTH: Public

RESPONSE 200:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Lấy tin tức thành công",
  "data": {
    "newsId": 1,
    "userId": 1,
    "authorName": "string",
    "title": "string",
    "slug": "string",
    "summary": "string",
    "content": "string",
    "imageUrl": "string",
    "status": "PUBLISHED",
    "publishedAt": "2026-09-25T10:00:00Z",
    "createdAt": "2026-09-24T08:00:00Z",
    "updatedAt": null,
    "viewCount": 1
  }
}
```

ERROR:
400 Không tìm thấy bài viết hoặc bài viết chưa được xuất bản
500 Lỗi hệ thống

---

API: Get Public News By Slug
METHOD: GET
ENDPOINT: /api/news/slug/{slug}
AUTH: Public

RESPONSE 200:
(Tương tự Get Public News By ID)

ERROR:
400 Không tìm thấy bài viết hoặc bài viết chưa được xuất bản
500 Lỗi hệ thống

---

API: Get Management News
METHOD: GET
ENDPOINT: /api/admin/news
AUTH: Admin

QUERY:
keyword: string?
status: string?
pageNumber: int (default = 1)
pageSize: int (default = 10)

RESPONSE 200:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Lấy danh sách tin tức thành công",
  "data": {
    "items": [
      {
        "newsId": 1,
        "title": "string",
        "slug": "string",
        "summary": "string",
        "imageUrl": "string",
        "status": "PUBLISHED",
        "authorName": "string",
        "publishedAt": "2026-09-25T10:00:00Z",
        "createdAt": "2026-09-24T08:00:00Z",
        "viewCount": 0
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

ERROR:
401 Unauthorized
403 Forbidden
500 Lỗi hệ thống

---

API: Get Management News By ID
METHOD: GET
ENDPOINT: /api/admin/news/{id}
AUTH: Admin

RESPONSE 200:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Lấy tin tức thành công",
  "data": {
    "newsId": 1,
    "userId": 1,
    "authorName": "string",
    "title": "string",
    "slug": "string",
    "summary": "string",
    "content": "string",
    "imageUrl": "string",
    "status": "PUBLISHED",
    "publishedAt": "2026-09-25T10:00:00Z",
    "createdAt": "2026-09-24T08:00:00Z",
    "updatedAt": null,
    "viewCount": 0
  }
}
```

ERROR:
400 Không tìm thấy bài viết
401 Unauthorized
403 Forbidden
500 Lỗi hệ thống

---

MODULE: AUTH

> **LƯU Ý DÀNH CHO FRONTEND (Cập nhật RBAC mới)**:
> Hệ thống Auth hiện tại đã nâng cấp lên cơ chế **RBAC** (Nhiều Role và nhiều Permission).
> Endpoint Login và Refresh Token **chỉ trả về** `accessToken` và `refreshToken` chứ KHÔNG trả về object User chứa thuộc tính `role` cứng như ngày xưa.
> 
> **Cách lấy thông tin phân quyền**:
> Frontend cần sử dụng thư viện như `jwt-decode` để giải mã `accessToken`. Bên trong Payload của Token sẽ chứa:
> - `role`: Mảng hoặc string chứa danh sách Tên các Role (VD: `["Admin", "Staff"]`).
> - `Permission`: Mảng các mã Quyền của User đó (VD: `["NEWS_CREATE", "PRODUCT_VIEW"]`).
> - `nameid`: UserId.
> - `unique_name`: Username.

API: Register
METHOD: POST
ENDPOINT: /api/auth/register
AUTH: Public

REQUEST:
```json
{
  "username": "string",
  "password": "string",
  "fullName": "string",
  "email": "string"
}
```

RESPONSE 200:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Đăng ký tài khoản thành công!",
  "data": null
}
```

ERROR:
400 Tên đăng nhập đã tồn tại / Dữ liệu không hợp lệ
500 Lỗi hệ thống

---

API: Login
METHOD: POST
ENDPOINT: /api/auth/login
AUTH: Public

REQUEST:
```json
{
  "username": "string",
  "password": "string"
}
```

RESPONSE 200:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Đăng nhập thành công!",
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

ERROR:
401 Sai tài khoản hoặc mật khẩu / Tài khoản bị khóa
500 Lỗi hệ thống

---

API: Refresh Token
METHOD: POST
ENDPOINT: /api/auth/refresh-token
AUTH: Public

REQUEST:
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

RESPONSE 200:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Đã cấp lại Token thành công!",
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

ERROR:
401 Token không hợp lệ / Refresh token hết hạn
500 Lỗi hệ thống---

API: Create News
METHOD: POST
ENDPOINT: /api/admin/news
AUTH: Admin
CONTENT-TYPE: multipart/form-data

REQUEST:
Form Data:
- `title` (string, required): Tiêu đề
- `summary` (string, optional): Tóm tắt
- `content` (string, required): Nội dung chi tiết
- `imageFile` (file, optional): File ảnh upload (sẽ được đẩy lên Cloudinary)
- `status` (string, optional): DRAFT, PUBLISHED, ARCHIVED, SCHEDULED (mặc định PUBLISHED)
- `scheduledPublishAt` (datetime, optional): Thời gian hẹn giờ xuất bản

RESPONSE 201:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Tạo bản nháp thành công",
  "data": {
    "newsId": 1,
    "userId": 1,
    "title": "string",
    "slug": "string",
    "summary": "string",
    "content": "string",
    "imageUrl": "string",
    "status": "PUBLISHED",
    "publishedAt": "2026-09-25T10:00:00Z",
    "createdAt": "2026-09-25T10:00:00Z",
    "updatedAt": null,
    "viewCount": 0
  }
}
```

ERROR:
400 Dữ liệu không hợp lệ
401 Unauthorized
403 Forbidden
500 Lỗi hệ thống

---

API: Update News
METHOD: PUT
ENDPOINT: /api/admin/news/{id}
AUTH: Admin
CONTENT-TYPE: multipart/form-data

REQUEST:
Form Data:
- `title` (string, required): Tiêu đề
- `summary` (string, optional): Tóm tắt
- `content` (string, required): Nội dung chi tiết
- `imageFile` (file, optional): File ảnh mới (sẽ được đẩy lên Cloudinary và ghi đè ảnh cũ)
- `status` (string, optional): DRAFT, PUBLISHED, ARCHIVED, SCHEDULED
- `scheduledPublishAt` (datetime, optional): Thời gian hẹn giờ xuất bản

RESPONSE 200:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cập nhật bài viết thành công",
  "data": {
    "newsId": 1,
    "userId": 1,
    "title": "string",
    "slug": "string",
    "summary": "string",
    "content": "string",
    "imageUrl": "string",
    "status": "PUBLISHED",
    "publishedAt": "2026-09-25T10:00:00Z",
    "createdAt": "2026-09-24T08:00:00Z",
    "updatedAt": "2026-09-25T11:00:00Z",
    "viewCount": 0
  }
}
```

ERROR:
400 Dữ liệu không hợp lệ / Không tìm thấy bài viết
401 Unauthorized
403 Forbidden
500 Lỗi hệ thống

---

API: Delete News
METHOD: DELETE
ENDPOINT: /api/admin/news/{id}
AUTH: Admin

RESPONSE 200:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Xóa bài viết thành công",
  "data": null
}
```

ERROR:
ERROR:
400 Không tìm thấy bài viết
401 Unauthorized
403 Forbidden
500 Lỗi hệ thống

---

MODULE: PRODUCT

API: Get Product List / Detail
METHOD: GET
ENDPOINT: /api/Product
AUTH: Public

RESPONSE 200:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    "productId": 1,
    "name": "Trà Sữa Trân Châu",
    "basePrice": 30000,
    "imageUrl": "string",
    "imagePublicId": "string",
    "categoryId": 2,
    "categoryName": "Trà Sữa",
    "isAvailable": true,
    "stockQuantity": null, // LƯU Ý: Nếu món này CÓ SIZE, trường này sẽ là null
    "description": "string",
    "productSizes": [
      {
        "sizeId": 1,
        "sizeName": "Size M",
        "stockQuantity": 50, // Frontend dựa vào trường này để check tồn kho
        "isOutOfStock": false,
        "price": 30000
      }
    ],
    "productToppings": [],
    "totalStock": 50,
    "isOutOfStock": false
  }
}
```

---

MODULE: ORDER (ADMIN)

API: Update Order Status
METHOD: PUT
ENDPOINT: /api/admin/Order/{id}/status
AUTH: Admin

REQUEST:
```json
{
  "status": "DELIVERING", // Phải dùng chính xác: PENDING, CONFIRMED, PREPARING, DELIVERING, COMPLETED, CANCELLED
  "cancelReason": "string" // Bắt buộc nếu status = Cancelled
}
```

RESPONSE 200:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": null
}
```

ERROR:
400 Sai quy trình! Không thể chuyển trực tiếp từ 'PENDING' sang 'COMPLETED' hoặc truyền sai trạng thái (VD: SHIPPING thay vì DELIVERING).
400 Cần nhập lý do hủy đơn hàng
401 Unauthorized
403 Forbidden
500 Lỗi hệ thống

---

MODULE: ENUMS & CONSTANTS (DICTIONARY)

Đây là bảng từ điển các Enum (Chuỗi cố định) bắt buộc Frontend phải truyền chính xác Từng Chữ, Từng Ký Tự (Phân biệt hoa thường tuỳ thuộc vào quy định dưới đây). 
Nếu truyền sai, Backend sẽ ném lỗi 400 Bad Request hoặc lưu sai logic.

### 1. OrderStatus (Trạng thái đơn hàng)
> Dùng trong API Update Order Status
- `PENDING` : Chờ xác nhận (Vừa mới đặt xong)
- `CONFIRMED` : Đã xác nhận
- `PREPARING` : Đang chuẩn bị / Đang pha chế
- `DELIVERING` : Đang giao hàng
- `COMPLETED` : Hoàn thành
- `CANCELLED` : Đã hủy

### 2. CartStatus (Trạng thái Giỏ hàng)
- `ACTIVE` : Giỏ hàng đang hoạt động (Đang chọn món)
- `CONVERTED` : Đã chuyển đổi thành Đơn hàng (Đã thanh toán / Checkout thành công)
- `ABANDONED` : Bị bỏ rơi (Để quá lâu không thanh toán)

### 3. NewsStatus (Trạng thái Tin tức / Khuyến mãi)
- `DRAFT` : Bản nháp (Đang soạn dở)
- `PUBLISHED` : Đã xuất bản (Hiện trên trang chủ)
- `ARCHIVED` : Đã lưu trữ (Ẩn đi)
- `SCHEDULED` : Đã lên lịch (Đến giờ mới hiện)
- `DELETED` : Đã xóa (Đưa vào thùng rác)

### 4. DiscountApplyType (Loại giảm giá)
- `FIXED` : Giảm trực tiếp theo số tiền (VD: Giảm 50.000đ)
- `PERCENTAGE` : Giảm theo phần trăm (VD: Giảm 20%)

### 5. VoucherApplyType (Phạm vi áp dụng Voucher)
- `ORDER` : Mã giảm giá áp dụng trừ vào Tiền Món Ăn (SubTotal)
- `SHIPPING` : Mã giảm giá áp dụng trừ vào Tiền Cước Vận Chuyển (ShippingFee)

### 6. VoucherTypeTarget (Đối tượng áp dụng Voucher)
- `USER` : Mã giảm giá cá nhân (Chỉ dành cho 1 User cụ thể, được tặng riêng)
- `PUBLIC` : Mã giảm giá công khai (Ai cũng nhập được)

### 7. SystemRole (Phân quyền cơ bản)
- `ADMIN` : Quản trị viên
- `USER` : Khách hàng bình thường
- `STAFF` : Nhân viên cửa hàng
