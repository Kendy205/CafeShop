# TÀI LIỆU ĐẶC TẢ CHI TIẾT TOÀN BỘ MODEL DỰ ÁN CAFESHOP (CẬP NHẬT MỚI NHẤT)

Tài liệu này mô tả chi tiết toàn bộ **25 file Model** hiện có trong thư mục `CafeShop.Model`, bao gồm cấu trúc các trường (Fields), kiểu dữ liệu, các ràng buộc (Constraints) và quan hệ liên kết (Navigation Properties). Dữ liệu này được quét và tạo tự động dựa trên source code mới nhất của dự án.

---

## MỤC LỤC
1. [Nhóm 1: Người Dùng, Phân Quyền & Địa Chỉ (`User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `Address`)](#1-nhóm-1-người-dùng-phân-quyền--địa-chỉ)
2. [Nhóm 2: Thực Đơn & Sản Phẩm (`Category`, `Product`, `Size`, `Topping`, `ProductSize`, `ProductTopping`)](#2-nhóm-2-thực-đơn--sản-phẩm)
3. [Nhóm 3: Giỏ Hàng (`Cart`, `CartItem`, `CartItemTopping`)](#3-nhóm-3-giỏ-hàng)
4. [Nhóm 4: Đơn Hàng & Vận Hành (`Order`, `OrderDetail`, `OrderDetailTopping`, `OrderStatusHistory`, `ShippingConfig`, `Payment`)](#4-nhóm-4-đơn-hàng--vận-hành)
5. [Nhóm 5: Khuyến Mãi (`Voucher`, `UserVoucher`)](#5-nhóm-5-khuyến-mãi)
6. [Nhóm 6: Tương Tác & Nội Dung (`Feedback`, `News`)](#6-nhóm-6-tương-tác--nội-dung)

---

## 1. NHÓM 1: NGƯỜI DÙNG, PHÂN QUYỀN & ĐỊA CHỈ

### 1.1. `User.cs` - Tài khoản người dùng
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `UserId` | `int` | `[Key]` | 
| `Username` | `string` | `[Required]`, Length(3 - 50) | 
| `PasswordHash` | `string` | `[Required]` | 
| `FullName` | `string?` |  | 
| `PhoneNumber` | `string?` |  | 
| `Email` | `string?` |  | 
| `AvatarUrl` | `string?` |  | 
| `AvatarPublicId`| `string?` |  | 
| `RefreshToken` | `string?` |  | 
| `RefreshTokenExpiryTime` | `DateTime?` |  | 
| `IsActive` | `bool` | Default: `true` | 
| `CreatedAt` | `DateTime` | Default: `DateTime.UtcNow` | 

- **Navigation Properties:** `Orders`, `Feedbacks`, `Addresses`, `Cart`, `UserRoles`.

---

### 1.2. `Role.cs` - Nhóm quyền
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `RoleId` | `int` | `[Key]` | 
| `Name` | `string` | `[Required]`, Max(50) | 
| `Description` | `string?` | Max(255) | 

- **Navigation Properties:** `UserRoles`, `RolePermissions`.

---

### 1.3. `Permission.cs` - Quyền hạn chi tiết
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `PermissionId` | `int` | `[Key]` | 
| `Code` | `string` | `[Required]`, Max(100) (Ví dụ: VIEW_ORDER) | 
| `Module` | `string` | `[Required]`, Max(50) (Ví dụ: ORDER) | 
| `Description` | `string?` | Max(255) | 

- **Navigation Properties:** `RolePermissions`.

---

### 1.4. `UserRole.cs` - Bảng trung gian User - Role
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `UserId` | `int` | FK -> User | 
| `RoleId` | `int` | FK -> Role | 

- **Navigation Properties:** `User`, `Role`.

---

### 1.5. `RolePermission.cs` - Bảng trung gian Role - Permission
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `RoleId` | `int` | FK -> Role | 
| `PermissionId` | `int` | FK -> Permission | 

- **Navigation Properties:** `Role`, `Permission`.

---

### 1.6. `Address.cs` - Sổ địa chỉ giao hàng
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `AddressId` | `int` | `[Key]` | 
| `UserId` | `int` | `[Required]`, FK -> User | 
| `RecipientName` | `string` | `[Required]`, Max(150) | 
| `Phone` | `string?` | `[Required]`, `[Phone]`, Max(20) | 
| `FullAddress` | `string` | Max(500) | 
| `IsDefault` | `bool` | Default: `false` | 
| `IsDeleted` | `bool` | Default: `false` | 
| `Latitude` | `double` |  | 
| `Longitude` | `double` |  | 
| `CreatedAt` | `DateTime` | Default: `DateTime.UtcNow` | 

- **Navigation Properties:** `User`, `Orders`.

---

## 2. NHÓM 2: THỰC ĐƠN & SẢN PHẨM

### 2.1. `Category.cs` - Danh mục sản phẩm
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `CategoryId` | `int` | `[Key]` | 
| `Name` | `string?` | `[Required]`, Max(100) | 
| `Description` | `string?` | Max(500) | 

- **Navigation Properties:** `Products`.

---

### 2.2. `Product.cs` - Sản phẩm
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `ProductId` | `int` | `[Key]` | 
| `CategoryId` | `int` | `[Required]`, FK -> Category | 
| `Name` | `string` | `[Required]`, Max(200) | 
| `BasePrice` | `decimal` | `[Required]` | 
| `ImageUrl` | `string?` |  | 
| `ImagePublicId`| `string?` |  | 
| `Description` | `string?` |  | 
| `IsAvailable` | `bool` | Default: `true` | 
| `StockQuantity`| `int` | `[ConcurrencyCheck]`, Default: 0 | 

- **Navigation Properties:** `Category`, `ProductSizes`, `ProductToppings`, `Feedbacks`.

---

### 2.3. `Size.cs` - Kích cỡ
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `SizeId` | `int` | `[Key]` | 
| `Name` | `string` | `[Required]`, Max(10) | 

- **Navigation Properties:** `ProductSizes`.

---

### 2.4. `ProductSize.cs` - Sản phẩm - Size
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `ProductId` | `int` | FK -> Product | 
| `SizeId` | `int` | FK -> Size | 
| `Price` | `decimal?` |  | 
| `StockQuantity`| `int` | `[ConcurrencyCheck]`, Default: 0 | 

- **Navigation Properties:** `Product`, `Size`.

---

### 2.5. `Topping.cs` - Topping
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `ToppingId` | `int` | `[Key]` | 
| `Name` | `string` | `[Required]`, Max(50) | 
| `Price` | `decimal?` |  | 
| `Unit` | `string` | Max(20) | 
| `ImageUrl` | `string?` |  | 
| `StockQuantity`| `int` | `[ConcurrencyCheck]`, Default: 0 | 
| `IsAvailable` | `bool` | Default: `true` | 

- **Navigation Properties:** `ProductToppings`.

---

### 2.6. `ProductTopping.cs` - Sản phẩm - Topping
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `ProductId` | `int` | FK -> Product | 
| `ToppingId` | `int` | FK -> Topping | 

- **Navigation Properties:** `Product`, `Topping`.

---

## 3. NHÓM 3: GIỎ HÀNG

### 3.1. `Cart.cs` - Giỏ hàng
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `CartId` | `int` | `[Key]`, Column("cart_id") | 
| `UserId` | `int` | Column("user_id"), FK -> User | 
| `Status` | `string` | Max(20), Default: `"active"` | 
| `CreatedAt` | `DateTime` | Default: `DateTime.UtcNow` | 
| `UpdatedAt` | `DateTime` | Default: `DateTime.UtcNow` | 

- **Navigation Properties:** `User`, `CartItems`.

---

### 3.2. `CartItem.cs` - Món trong giỏ
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `CartItemId` | `int` | `[Key]` | 
| `CartId` | `int` | FK -> Cart | 
| `ProductId` | `int` | FK -> Product | 
| `SizeId` | `int?` | FK -> Size | 
| `Quantity` | `int` |  | 
| `UnitPrice` | `decimal` |  | 

- **Navigation Properties:** `Cart`, `Product`, `Size`, `CartItemToppings`.

---

### 3.3. `CartItemTopping.cs` - Topping trong giỏ
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `CartItemToppingId` | `int` | `[Key]` | 
| `CartItemId` | `int` | FK -> CartItem | 
| `ToppingId` | `int` | FK -> Topping | 
| `Quantity` | `int` | Default: 1 | 
| `UnitPrice` | `decimal` |  | 

- **Navigation Properties:** `CartItem`, `Topping`.

---

## 4. NHÓM 4: ĐƠN HÀNG & VẬN HÀNH

### 4.1. `Order.cs` - Đơn hàng
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `OrderId` | `int` | `[Key]` | 
| `UserId` | `int` | FK -> User | 
| `AddressId` | `int` | FK -> Address | 
| `RecipientName` | `string?` | Max(150) | 
| `Phone` | `string?` | Max(20) | 
| `FullAddress` | `string?` | Max(500) | 
| `OrderDate` | `DateTime` | Default: `DateTime.UtcNow` | 
| `SubTotal` | `decimal` |  | 
| `TotalAmount` | `decimal` |  | 
| `PaymentMethod` | `string?` |  | 
| `PaymentStatus` | `string` | Default: `"Unpaid"` | 
| `CurrentStatus` | `string?` |  | 
| `Note` | `string?` | Max(500) | 
| `VoucherId` | `int?` | FK -> Voucher | 
| `OrderDiscount` | `decimal` |  | 
| `ShippingDiscount`| `decimal` |  | 
| `ShippingFee` | `decimal` |  | 
| `DistanceKm` | `double` |  | 

- **Navigation Properties:** `User`, `Voucher`, `Address`, `OrderDetails`, `StatusHistories`, `Payments`.

---

### 4.2. `OrderDetail.cs` - Chi tiết đơn hàng
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `OrderDetailId` | `int` | `[Key]` | 
| `OrderId` | `int` | FK -> Order | 
| `ProductId` | `int` | FK -> Product | 
| `SizeId` | `int?` | FK -> Size | 
| `Quantity` | `int` |  | 
| `UnitPrice` | `decimal` |  | 
| `Note` | `string?` |  | 

- **Navigation Properties:** `Order`, `Product`, `Size`, `Feedbacks`, `OrderDetailToppings`.

---

### 4.3. `OrderDetailTopping.cs` - Topping trong chi tiết đơn
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `Id` | `int` | `[Key]` | 
| `OrderDetailId` | `int` | FK -> OrderDetail | 
| `ToppingId` | `int` | FK -> Topping | 
| `Quantity` | `int` | Default: 1 | 
| `UnitPrice` | `decimal` |  | 

- **Navigation Properties:** `OrderDetail`, `Topping`.

---

### 4.4. `OrderStatusHistory.cs` - Lịch sử trạng thái
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `HistoryId` | `int` | `[Key]` | 
| `OrderId` | `int` | FK -> Order | 
| `Status` | `string?` | Max(500) | 
| `ChangedBy` | `int` | FK -> User | 
| `ChangedAt` | `DateTime` | Default: `DateTime.UtcNow` | 
| `Note` | `string?` |  | 

- **Navigation Properties:** `Order`, `UserAction`.

---

### 4.5. `Payment.cs` - Thanh toán đơn hàng
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `PaymentId` | `int` | `[Key]` | 
| `OrderId` | `int` | FK -> Order | 
| `PaymentMethod` | `string` | `[MaxLength(30)]` (Ví dụ: COD, VNPay, Momo) | 
| `PaymentProvider`| `string?` | `[MaxLength(50)]` | 
| `TransactionCode`| `string?` | `[MaxLength(100)]` | 
| `Amount` | `decimal` |  | 
| `PaymentStatus` | `string` | `[MaxLength(20)]`, Default: `"pending"` | 
| `PaidAt` | `DateTime?`|  | 
| `ErrorMessage` | `string?` | `[MaxLength(500)]` | 
| `CreatedAt` | `DateTime` | Default: `DateTime.UtcNow` | 

- **Navigation Properties:** `Order`.

---

### 4.6. `ShippingConfig.cs` - Cấu hình Ship
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `Id` | `int` | `[Key]` | 
| `BaseFee` | `decimal` | Default: 5000 | 
| `BaseDistanceKm`| `double` | Default: 5.0 | 
| `ExtraFeePerKm` | `decimal` | Default: 2000 | 
| `MaxDistanceKm` | `double` | Default: 10.0 | 
| `IsFreeShippingEnabled` | `bool` | Default: true | 
| `FreeShippingThreshold` | `decimal` | Default: 200000 | 
| `NightSurcharge`| `decimal` | Default: 2000 | 
| `NightHourStart`| `int` | Default: 22 | 
| `NightHourEnd` | `int` | Default: 6 | 
| `PeakHourSurcharge` | `decimal` | Default: 0 | 
| `PeakHourStart` | `int` | Default: 11 | 
| `PeakHourEnd` | `int` | Default: 13 | 
| `WeekendSurcharge` | `decimal` | Default: 3000 | 

---

## 5. NHÓM 5: KHUYẾN MÃI (VOUCHER)

### 5.1. `Voucher.cs` - Voucher
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `VoucherId` | `int` | `[Key]` | 
| `Code` | `string?` |  | 
| `Description` | `string` |  | 
| `TargetType` | `string` | Default: `VoucherTypeTarget.PUBLIC` | 
| `ApplyType` | `string` | Default: `VoucherApplyType.ORDER` | 
| `DiscountType` | `string?` |  | 
| `DiscountValue`| `decimal` |  | 
| `MinOrderValue` | `decimal` |  | 
| `MaxDiscountAmount` | `decimal` |  | 
| `StartDate` | `DateTime` | `[Required]` | 
| `EndDate` | `DateTime` | `[Required]` | 
| `UsageLimit` | `int` |  | 
| `UsedCount` | `int` |  | 
| `IsActive` | `bool` | Default: true | 

- **Navigation Properties:** `UserVouchers`.

---

### 5.2. `UserVoucher.cs` - Ví Voucher User
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `Id` | `int` |  | 
| `UserId` | `int` |  | 
| `VoucherId` | `int` |  | 
| `UsageLimitPerUser` | `int` | Default: 1 | 
| `UsedCount` | `int` | Default: 0 | 
| `IsUsed` | `bool` | Computed (UsedCount >= UsageLimitPerUser) | 
| `AssignedDate` | `DateTime` | Default: `DateTime.UtcNow` | 

- **Navigation Properties:** `Voucher`.

---

## 6. NHÓM 6: TƯƠNG TÁC & NỘI DUNG

### 6.1. `Feedback.cs` - Đánh giá
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `FeedbackId` | `int` | `[Key]` | 
| `ProductId` | `int` | `[Required]`, FK -> Product | 
| `UserId` | `int` | `[Required]`, FK -> User | 
| `OrderDetailId` | `int` | `[Required]`, FK -> OrderDetail | 
| `Rating` | `int` | `[Required]`, Range(1 - 5) | 
| `Comment` | `string?` | Max(500) | 
| `CreatedAt` | `DateTime` | Default: `DateTime.UtcNow` | 
| `IsVisible` | `bool` |  | 

- **Navigation Properties:** `Product`, `User`, `OrderDetail`.

---

### 6.2. `News.cs` - Tin tức (MỚI)
- **Chi tiết các trường:** (Bảng này đã có thay đổi rất lớn về cấu trúc để hỗ trợ tin bài chi tiết)

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Default | 
| :--- | :--- | :--- | 
| `NewsId` | `int` | `[Key]` | 
| `UserId` | `int` | FK -> User (Người đăng) | 
| `Title` | `string?` | Max(255) | 
| `Slug` | `string?` | Max(255) - Đường dẫn SEO | 
| `Summary` | `string?` | Tóm tắt | 
| `Content` | `string?` | Nội dung | 
| `ImageUrl` | `string?` | Ảnh đại diện | 
| `Status` | `string?` | Max(50), Default: "DRAFT" | 
| `ScheduledPublishAt`| `DateTime?` | Hẹn giờ đăng | 
| `PublishedAt` | `DateTime?` | Ngày xuất bản | 
| `CreatedAt` | `DateTime` | Default: `DateTime.UtcNow` | 
| `UpdatedAt` | `DateTime?` |  | 
| `IsDeleted` | `bool` | Default: false | 
| `ViewCount` | `int` | Default: 0 | 

- **Navigation Properties:** `User`.
