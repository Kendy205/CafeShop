---
description: core
---

---

## description: Quy trình chuẩn bắt buộc dành cho AI Agent khi phát triển, sửa lỗi, refactor, test và đặc tả API trong dự án CafeShop Backend (.NET 8)

# CAFE SHOP BACKEND — AGENT WORKFLOW

Quy trình này áp dụng cho **MỌI nhiệm vụ** trong dự án CafeShop Backend:

* Thêm API / tính năng mới
* Sửa bug
* Refactor
* Thay đổi Database
* Thêm Entity / DTO / Repository / Service
* Viết Unit Test / Integration Test
* Sửa authorization / authentication
* Tối ưu truy vấn
* Viết API Documentation
* Sửa API cũ để tương thích Frontend
* Tích hợp SignalR / Cloudinary / bên thứ ba

---

# 0. NGUYÊN TẮC QUAN TRỌNG NHẤT — READ BEFORE CODE

## 0.1. KHÔNG ĐƯỢC TỰ SUY ĐOÁN CẤU TRÚC PROJECT

Trước khi viết hoặc sửa code, Agent **BẮT BUỘC** kiểm tra code thực tế trong repository.

Phải xác định:

1. Cấu trúc thư mục hiện tại.
2. Các Project trong Solution.
3. `.csproj` và target framework.
4. Entity hiện có.
5. DTO hiện có.
6. Repository hiện có.
7. `IUnitOfWork` / `UnitOfWork`.
8. Service và Service Interface.
9. Controller.
10. `ApplicationDbContext`.
11. `Program.cs`.
12. Dependency Injection.
13. AutoMapper `MappingProfile`.
14. Các Constants / Enum hiện có.
15. `ApiResponse<T>` / `PageResult<T>`.
16. Authentication / Authorization.
17. Transaction helper.
18. SignalR / Notification.
19. Photo / Cloudinary service.
20. Test project và test convention.

**Tuyệt đối không tự tạo một class/interface/helper nếu chưa kiểm tra xem project đã có tương đương hay chưa.**

---

## 0.2. THỨ TỰ ƯU TIÊN KHI ĐƯA RA QUYẾT ĐỊNH

Agent phải ưu tiên thông tin theo thứ tự:

```text
1. Source code hiện tại
2. Interface / contract hiện tại
3. Database / Entity hiện tại
4. Business rule được người dùng yêu cầu
5. Pattern hiện tại của project
6. Convention của project
7. .NET best practice
```

Không được tự ý thay đổi kiến trúc hiện tại chỉ vì có một cách "đẹp hơn".

---

## 0.3. KHÔNG ĐƯỢC BỊA CODE

Nếu không tìm thấy:

* class
* interface
* method
* property
* constant
* repository
* DTO
* endpoint
* database field

thì **KHÔNG được giả định rằng nó tồn tại**.

Agent phải:

1. Tìm kiếm toàn project.
2. Xác nhận không tồn tại.
3. Nếu có thể tạo mới một cách an toàn → tạo theo convention hiện tại.
4. Nếu việc tạo mới ảnh hưởng kiến trúc hoặc business rule → hỏi người dùng trước.

---

# 1. KIẾN TRÚC BACKEND

CafeShop Backend sử dụng kiến trúc Layered / N-Tier kết hợp Repository Pattern và UnitOfWork.

Nguyên tắc phụ thuộc:

```text
Controller
    ↓
Service
    ↓
Repository / UnitOfWork
    ↓
DbContext
    ↓
Database
```

DTO dùng để giao tiếp giữa API và Client.

---

# 2. QUY TẮC CỐT LÕI — BẮT BUỘC

## 2.1. Repository Pattern + UnitOfWork

Mọi truy cập Database từ Service phải thông qua:

```csharp
_unitOfWork
```

Không được:

```csharp
new ApplicationDbContext(...)
```

hoặc:

```csharp
private readonly ApplicationDbContext _context;
```

trong:

* Controller
* Service

Không được gọi trực tiếp:

```csharp
_context.Products...
_context.Orders...
_context.Users...
```

trong Service/Controller.

---

# 3. ENTITY KHÔNG ĐƯỢC TRẢ TRỰC TIẾP RA API

Controller **KHÔNG được trả trực tiếp Entity** thuộc:

```text
CafeShop.Model
```

Ví dụ KHÔNG được:

```csharp
return Ok(product);
```

nếu `product` là Entity.

Phải trả DTO:

```csharp
return Ok(new ApiResponse<ProductResponseDto>
{
    Success = true,
    Data = result
});
```

Entity → DTO thông qua:

* AutoMapper
* hoặc mapping thủ công nếu project đang sử dụng cách đó.

---

# 4. API RESPONSE STANDARD

Mọi API response phải tuân thủ response wrapper hiện có của project.

Ưu tiên:

```text
ApiResponse<T>
PageResult<T>
```

Không tự tạo một response format mới nếu project đã có format chuẩn.

Ví dụ:

```csharp
return Ok(new ApiResponse<ProductResponseDto>
{
    Success = true,
    Data = result,
    Message = "Thành công"
});
```

Đối với danh sách có phân trang:

```csharp
return Ok(new PageResult<ProductResponseDto>
{
    Items = result,
    PageNumber = page,
    PageSize = pageSize,
    TotalCount = totalCount
});
```

Agent phải đọc class thực tế trước khi sử dụng vì property có thể khác ví dụ trên.

---

# 5. DTO RULE

Mọi API phải phân biệt rõ:

```text
Request DTO
Response DTO
```

## Request DTO

Chỉ chứa dữ liệu Client được phép gửi.

KHÔNG nhận các field mà Server phải tự quyết định.

Ví dụ đặt hàng:

KHÔNG tin:

```text
UnitPrice
TotalPrice
DiscountAmount
ShippingFee
FinalAmount
```

nếu các giá trị này có thể tính từ Database.

---

## Response DTO

Chỉ trả dữ liệu Client cần.

Không trả:

```text
Password
PasswordHash
SecurityStamp
RefreshToken
OTP
Internal database information
```

hoặc thông tin bảo mật tương tự.

---

# 6. SINGLE SOURCE OF TRUTH — GIÁ TIỀN

Agent **TUYỆT ĐỐI KHÔNG TIN GIÁ TIỀN TỪ FRONTEND**.

Frontend có thể gửi:

```json
{
    "productId": 10,
    "sizeId": 2,
    "quantity": 3
}
```

Nhưng không được tin:

```json
{
    "unitPrice": 5000,
    "totalAmount": 15000
}
```

Server phải lấy giá từ Database:

```text
Product.BasePrice
ProductSize.Price
Topping.Price
Voucher
Shipping configuration
```

và tự tính:

```text
Subtotal
Discount
ShippingFee
TotalAmount
```

---

# 7. SECURITY — TRUST NOTHING FROM CLIENT

Không tin các field sau nếu Server có thể tự xác định:

```text
UserId
Role
Price
TotalAmount
Discount
OrderStatus
IsAdmin
CreatedBy
CreatedAt
UpdatedAt
PaymentStatus
```

Ví dụ:

KHÔNG lấy UserId từ request:

```csharp
request.UserId
```

nếu UserId có thể lấy từ:

```text
HttpContext.User
JWT claims
CurrentUserService
```

Agent phải sử dụng cơ chế authentication hiện tại của project.

---

# 8. TRANSACTION RULE

Các nghiệp vụ ghi nhiều dữ liệu hoặc yêu cầu tính nhất quán phải sử dụng Database Transaction.

Ví dụ:

```text
Checkout
Create Order + OrderDetail + Payment
Cancel Order + Restore Inventory
Add Product + ProductSize + Topping
Voucher usage
Inventory update
```

Phải sử dụng pattern tương đương:

```csharp
await _unitOfWork.BeginTransactionAsync();

try
{
    // database operations

    await _unitOfWork.SaveChangesAsync();
    await _unitOfWork.CommitTransactionAsync();
}
catch
{
    await _unitOfWork.RollbackTransactionAsync();
    throw;
}
```

Agent phải kiểm tra implementation thực tế của `UnitOfWork` trước khi sử dụng tên method.

---

# 9. TRANSACTION KHÔNG ĐƯỢC ĐỂ HỞ

Không được có tình trạng:

```text
Create Order
    ↓
Create OrderDetail
    ↓
Update Inventory
    ↓
Exception
```

mà Order vẫn tồn tại trong Database nhưng Inventory chưa cập nhật.

Mọi operation liên quan phải nằm trong cùng transaction nếu business rule yêu cầu atomicity.

---

# 10. CONCURRENCY & INVENTORY

Đối với các nghiệp vụ có tồn kho:

```text
Add to cart
Checkout
Cancel order
Restore stock
```

Agent phải kiểm tra race condition.

Ví dụ:

```text
User A mua sản phẩm cuối cùng
User B cũng mua cùng thời điểm
```

Không được chỉ kiểm tra:

```csharp
if (product.Stock >= quantity)
```

mà không xem xét concurrency.

Phải kiểm tra mechanism hiện tại của project:

* transaction
* row locking
* concurrency token
* atomic database update
* hoặc cơ chế tương đương.

Không tự ý đưa vào một cơ chế concurrency mới nếu project chưa có convention.

---

# 11. ORDER STATE MACHINE

Trạng thái Order phải tuân thủ:

```text
Pending
   ↓
Confirmed
   ↓
Preparing
   ↓
Shipping
   ↓
Completed
```

Hoặc:

```text
Pending / Confirmed / Preparing / Shipping
                    ↓
                Cancelled
```

Không được:

```text
Completed → Pending
Completed → Cancelled
Cancelled → Confirmed
Cancelled → Shipping
```

Agent phải kiểm tra trạng thái hiện tại trước khi cập nhật.

Không hard-code:

```csharp
"Pending"
"Completed"
"Cancelled"
```

nếu project đã có:

```csharp
OrderStatus.Pending
OrderStatus.Completed
OrderStatus.Cancelled
```

---

# 12. CONSTANTS / ENUM / MAGIC STRING

Trước khi tạo mới một constant hoặc enum, **BẮT BUỘC tìm kiếm toàn project**.

Ưu tiên sử dụng các constant đã tồn tại, ví dụ:

```csharp
SystemRole.Admin
SystemRole.User

OrderStatus.Pending
OrderStatus.Confirmed

VoucherTypeTarget.Personal
```

Không hard-code:

```csharp
"Admin"
"User"
"Pending"
"Confirmed"
"Personal"
```
nếu project đã có constant tương ứng.

### Nếu constant chưa tồn tại

Agent phải kiểm tra:

1. Có nên dùng enum không?
2. Có DTO/database nào đang phụ thuộc string không?
3. Có API contract nào đang sử dụng giá trị này không?

Nếu việc tạo constant ảnh hưởng contract hiện tại, phải thông báo trước khi thay đổi.

---

# 13. WORKFLOW 0 — PRE-FLIGHT ANALYSIS

Trước khi code, Agent phải thực hiện:

```text
[1] Hiểu requirement
[2] Scan project
[3] Tìm implementation tương tự
[4] Xác định files bị ảnh hưởng
[5] Kiểm tra dependency
[6] Kiểm tra database impact
[7] Kiểm tra API impact
[8] Kiểm tra security impact
[9] Kiểm tra transaction requirement
[10] Xác định test cần sửa/thêm
```
Agent nên xuất một bản tóm tắt ngắn trước khi thay đổi code:

```text
Affected layers:
- Model:
- DTO:
- Repository:
- Service:
- Controller:
- Mapping:
- Program/DI:
- Database:
- Tests:

Risk:
- ...
```
Không cần đưa ra kế hoạch dài dòng.

---

# 14. WORKFLOW 1 — THÊM FEATURE / API MỚI

## STEP 1 — MODEL

Kiểm tra:

```text
CafeShop.Model
ApplicationDbContext
Relationships
ForeignKey
Navigation Property
Existing migration
```

Nếu cần Entity mới:

* thêm Entity
* DataAnnotations phù hợp
* navigation properties
* DbSet

Không thêm field dư thừa nếu requirement không cần.

---

# 15. STEP 2 — DTO

Tạo DTO theo module:

```text
DTO/
├── Product/
├── Order/
├── Voucher/
├── User/
└── Admin/
```

Tuân thủ convention hiện tại.

Ví dụ:

```text
CreateProductRequest
UpdateProductRequest
ProductResponse
ProductDetailResponse
```

Không tự ý đặt tên khác convention của project.

---

# 16. STEP 3 — REPOSITORY

Kiểm tra trước:

```text
IUnitOfWork
UnitOfWork
IProductRepository
ProductRepository
```

Nếu repository hiện tại đã hỗ trợ query → sử dụng lại.

Chỉ thêm method repository khi thực sự cần.

Các query phức tạp như:

```text
Include
ThenInclude
Filter
Search
Paging
Projection
```

nên nằm ở Repository/Data layer thay vì viết trực tiếp trong Service.

---

# 17. STEP 4 — SERVICE

Service chịu trách nhiệm:

```text
Business logic
Validation nghiệp vụ
Authorization logic cần thiết
Price calculation
Inventory validation
Voucher validation
Transaction orchestration
DTO transformation
```

Không đưa business logic quan trọng vào Controller.

Controller chỉ nên:

```text
Receive request
Validate model
Call service
Return response
```

---

# 18. STEP 5 — VALIDATION

Phải phân biệt:

```text
Validation hình thức
Validation nghiệp vụ
```

Ví dụ:

```text
Quantity > 0
Email đúng format
Required field
String length
```

là validation đầu vào.

Trong khi:

```text
Product tồn tại
Size thuộc Product
Voucher còn hạn
Order thuộc User hiện tại
Stock đủ
OrderStatus có thể chuyển
```

là business validation.

Business validation phải nằm ở Service / Domain logic phù hợp.

---

# 19. STEP 6 — CONTROLLER

Controller phải:

* đúng folder
* đúng route convention
* đúng `[Authorize]`
* đúng Role
* sử dụng DTO
* gọi Service
* trả `ApiResponse<T>` / `PageResult<T>`

Ví dụ:

```text
Controllers/User/
Controllers/Admin/
```

Không tự tạo route khác convention nếu chưa kiểm tra project.

---

# 20. AUTHORIZATION

Phân biệt:

```text
Authentication
```

và:

```text
Authorization
```

API yêu cầu đăng nhập phải có cơ chế `[Authorize]` hoặc cơ chế tương đương hiện tại.

API Admin phải kiểm tra Role:

```csharp
[Authorize(Roles = SystemRole.Admin)]
```

Không tin Role/UserId từ Request Body.

---

# 21. FILE UPLOAD

Nếu API upload ảnh:

```csharp
[FromForm] IFormFile file
```

Phải kiểm tra:

```text
File null
Extension
Content type
Size
File name
Upload result
```

Sử dụng `IPhotoService` / Cloudinary service hiện tại.

Không tự lưu file vào local disk nếu project đang sử dụng Cloudinary.

---

# 22. AUTOMAPPER

Sau khi thêm Entity / DTO mới:

Kiểm tra:

```text
MappingProfile.cs
```

Đảm bảo mapping:

```text
Entity → Response DTO
Request DTO → Entity
```

Được cấu hình.

Không mặc định rằng AutoMapp