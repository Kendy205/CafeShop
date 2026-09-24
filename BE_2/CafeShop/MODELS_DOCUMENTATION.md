# TÀI LIỆU ĐẶC TẢ CHI TIẾT TOÀN BỘ MODEL DỰ ÁN CAFESHOP

Tài liệu này mô tả chi tiết toàn bộ **20 file Model** trong thư mục `CafeShop.Model`, bao gồm: ý nghĩa nghiệp vụ, cấu trúc các trường (Fields), kiểu dữ liệu, các ràng buộc (Constraints) và quan hệ liên kết (Navigation Properties).

---

## MỤC LỤC
1. [Nhóm 1: Người Dùng & Địa Chỉ (`User`, `Address`)](#1-nhóm-1-người-dùng--địa-chỉ)
2. [Nhóm 2: Thực Đơn & Sản Phẩm (`Category`, `Product`, `Size`, `Topping`, `ProductSize`, `ProductTopping`)](#2-nhóm-2-thực-đơn--sản-phẩm)
3. [Nhóm 3: Giỏ Hàng (`Cart`, `CartItem`, `CartItemTopping`)](#3-nhóm-3-giỏ-hàng)
4. [Nhóm 4: Đơn Hàng & Vận Hành (`Order`, `OrderDetail`, `OrderDetailTopping`, `OrderStatusHistory`, `ShippingConfig`)](#4-nhóm-4-đơn-hàng--vận-hành)
5. [Nhóm 5: Khuyến Mãi (`Voucher`, `UserVoucher`)](#5-nhóm-5-khuyến-mãi)
6. [Nhóm 6: Tương Tác & Nội Dung (`Feedback`, `News`)](#6-nhóm-6-tương-tác--nội-dung)

---

## 1. NHÓM 1: NGƯỜI DÙNG & ĐỊA CHỈ

### 1.1. `User.cs` - Tài khoản người dùng
- **Mục đích:** Lưu trữ thông tin tài khoản người dùng, bao gồm cả Khách hàng (User) và Quản trị viên (Admin).
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc / Thuộc tính | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `UserId` | `int` | `[Key]` | Khóa chính, định danh duy nhất của người dùng. |
| `Username` | `string` | `[Required]`, Length(3 - 50) | Tên đăng nhập hệ thống. |
| `PasswordHash` | `string` | `[Required]` | Mật khẩu đã được mã hóa (BCrypt). |
| `FullName` | `string?` | Tùy chọn | Họ và tên đầy đủ của người dùng. |
| `PhoneNumber` | `string?` | Tùy chọn | Số điện thoại liên hệ. |
| `Email` | `string?` | Tùy chọn | Địa chỉ Email của người dùng. |
| `Address` | `string?` | Tùy chọn | Địa chỉ thường trú mặc định. |
| `AvatarUrl` | `string?` | Tùy chọn | URL ảnh đại diện (lưu trữ trên Cloudinary). |
| `AvatarPublicId`| `string?` | Tùy chọn | Public ID của ảnh trên Cloudinary để xóa/cập nhật. |
| `Role` | `string?` | `SystemRole` (ADMIN/USER) | Phân quyền tài khoản trong hệ thống. |
| `RefreshToken` | `string?` | Tùy chọn | Token dùng để cấp lại JWT Access Token mới. |
| `RefreshTokenExpiryTime` | `DateTime?` | Tùy chọn | Thời gian hết hạn của Refresh Token. |
| `IsActive` | `bool` | Default: `true` | Trạng thái tài khoản (true: hoạt động, false: bị khóa). |
| `CreatedAt` | `DateTime` | Default: `DateTime.UtcNow` | Thời điểm tạo tài khoản. |

- **Navigation Properties (Quan hệ liên kết):**
  - `Orders` (`ICollection<Order>?`): Danh sách các đơn hàng mà user này đã đặt (1 - N).
  - `Feedbacks` (`ICollection<Feedback>?`): Danh sách đánh giá mà user đã viết (1 - N).
  - `Addresses` (`ICollection<Address>?`): Sổ địa chỉ giao hàng của user (1 - N).
  - `Cart` (`Cart?`): Giỏ hàng cá nhân của user (1 - 1).

---

### 1.2. `Address.cs` - Sổ địa chỉ giao hàng
- **Mục đích:** Lưu trữ danh sách địa chỉ nhận hàng của khách hàng, tích hợp tọa độ GPS (kinh độ, vĩ độ) để tính khoảng cách và phí vận chuyển tự động.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `AddressId` | `int` | `[Key]` | Khóa chính địa chỉ. |
| `UserId` | `int` | `[Required]`, FK | Khóa ngoại trỏ về `User`. |
| `RecipientName` | `string` | `[Required]`, Max(150) | Tên người nhận hàng tại địa chỉ này. |
| `Phone` | `string?` | `[Required]`, `[Phone]`, Max(20) | Số điện thoại người nhận hàng. |
| `FullAddress` | `string` | Length(500) | Địa chỉ chi tiết (Số nhà, tên đường, phường/xã...). |
| `IsDefault` | `bool` | Default: `false` | Đánh dấu địa chỉ mặc định khi đặt hàng. |
| `IsDeleted` | `bool` | Default: `false` | Xóa mềm (Soft Delete) để không làm mất lịch sử đơn hàng cũ. |
| `Latitude` | `double` | | Tọa độ Vĩ độ (GPS) dùng tính khoảng cách Mapbox/Haversine. |
| `Longitude` | `double` | | Tọa độ Kinh độ (GPS) dùng tính khoảng cách Mapbox/Haversine. |
| `CreatedAt` | `DateTime` | Default: `DateTime.UtcNow` | Thời gian thêm địa chỉ. |

- **Navigation Properties:**
  - `User` (`User?`): Thông tin chủ sở hữu địa chỉ (N - 1).
  - `Orders` (`ICollection<Order>?`): Danh sách đơn hàng giao tới địa chỉ này (1 - N).

---

## 2. NHÓM 2: THỰC ĐƠN & SẢN PHẨM

### 2.1. `Category.cs` - Danh mục sản phẩm
- **Mục đích:** Phân loại đồ uống và món ăn (ví dụ: Cà phê, Trà sữa, Trà trái cây, Bánh ngọt).
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `CategoryId` | `int` | `[Key]` | Khóa chính danh mục. |
| `Name` | `string?` | `[Required]`, Max(100) | Tên danh mục món. |
| `Description` | `string?` | Max(500) | Mô tả chi tiết danh mục. |

- **Navigation Properties:**
  - `Products` (`ICollection<Product>?`): Danh sách các món thuộc danh mục này (1 - N).

---

### 2.2. `Product.cs` - Sản phẩm / Đồ uống
- **Mục đích:** Lưu trữ thông tin món ăn, đồ uống trong thực đơn.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `ProductId` | `int` | `[Key]` | Khóa chính sản phẩm. |
| `CategoryId` | `int` | `[Required]`, FK | Thuộc danh mục nào. |
| `Name` | `string` | `[Required]`, Max(200) | Tên món đồ uống/sản phẩm. |
| `BasePrice` | `decimal` | `[Required]` | Giá bán cơ sở (chưa tính phụ thu size/topping). |
| `ImageUrl` | `string?` | Tùy chọn | Đường dẫn ảnh sản phẩm hiển thị trên Web/App. |
| `ImagePublicId`| `string?` | Tùy chọn | Mã quản lý ảnh trên Cloudinary. |
| `Description` | `string?` | Tùy chọn | Mô tả hương vị, thành phần món. |
| `IsAvailable` | `bool` | Default: `true` | Đang kinh doanh hay tạm ngưng phục vụ. |
| `StockQuantity`| `int` | `[ConcurrencyCheck]`, Default: 0 | Số lượng tồn kho. Có chống tranh chấp ghi đồng thời. |

- **Navigation Properties:**
  - `Category` (`Category?`): Danh mục chứa món này (N - 1).
  - `ProductSizes` (`ICollection<ProductSize>?`): Danh sách các kích cỡ áp dụng cho món (1 - N).
  - `ProductToppings` (`ICollection<ProductTopping>?`): Danh sách topping tương thích có thể chọn (1 - N).
  - `Feedbacks` (`ICollection<Feedback>?`): Các đánh giá của khách về món này (1 - N).

---

### 2.3. `Size.cs` - Kích cỡ
- **Mục đích:** Định nghĩa các size chuẩn (S, M, L).
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `SizeId` | `int` | `[Key]` | Khóa chính kích cỡ. |
| `Name` | `string` | `[Required]`, Max(10) | Tên kích cỡ (S, M, L). |
| `PercentIncrease`| `decimal` | `[Required]`, Range(0 - 100) | Tỷ lệ phần trăm tăng giá so với giá cơ sở. |

- **Navigation Properties:**
  - `ProductSizes` (`ICollection<ProductSize>?`): Danh sách liên kết với sản phẩm (1 - N).

---

### 2.4. `ProductSize.cs` - Bảng liên kết Sản phẩm & Size
- **Mục đích:** Lưu trữ giá bán và số lượng tồn kho cụ thể cho từng size của mỗi sản phẩm.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `ProductId` | `int` | Composite Key, FK | Khóa ngoại trỏ về `Product`. |
| `SizeId` | `int` | Composite Key, FK | Khóa ngoại trỏ về `Size`. |
| `Price` | `decimal?` | Tùy chọn | Giá bán cố định cho size này (nếu ghi đè BasePrice). |
| `StockQuantity`| `int` | `[ConcurrencyCheck]`, Default: 0 | Tồn kho riêng cho từng size. |

- **Navigation Properties:**
  - `Product` (`Product?`): Thông tin sản phẩm gốc.
  - `Size` (`Size?`): Thông tin kích cỡ.

---

### 2.5. `Topping.cs` - Topping gọi thêm
- **Mục đích:** Danh sách các món ăn/uống thêm đi kèm (trân châu, thạch đào, kem phô mai...).
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `ToppingId` | `int` | `[Key]` | Khóa chính topping. |
| `Name` | `string` | `[Required]`, Max(50) | Tên topping. |
| `Price` | `decimal?` | | Đơn giá của 1 phần topping. |
| `Unit` | `string` | Max(20) | Đơn vị tính ("ml", "g", "phần", "vá"). |
| `ImageUrl` | `string?` | Tùy chọn | Hình ảnh topping. |
| `StockQuantity`| `int` | `[ConcurrencyCheck]`, Default: 0 | Số lượng tồn kho topping. |
| `IsAvailable` | `bool` | Default: `true` | Còn bán hay hết hàng. |

- **Navigation Properties:**
  - `ProductToppings` (`ICollection<ProductTopping>?`): Liên kết với các món đồ uống tương thích (1 - N).

---

### 2.6. `ProductTopping.cs` - Bảng liên kết Sản phẩm & Topping
- **Mục đích:** Quy định sản phẩm nào thì được phép thêm những loại topping nào.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `ProductId` | `int` | Composite Key, FK | Khóa ngoại trỏ về `Product`. |
| `ToppingId` | `int` | Composite Key, FK | Khóa ngoại trỏ về `Topping`. |

---

## 3. NHÓM 3: GIỎ HÀNG (SHOPPING CART)

### 3.1. `Cart.cs` - Giỏ hàng
- **Mục đích:** Quản lý giỏ hàng mua sắm tạm thời của khách hàng.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `CartId` | `int` | `[Key]`, Column("cart_id") | Khóa chính giỏ hàng. |
| `UserId` | `int` | Column("user_id"), FK | Khóa ngoại trỏ về `User`. Mỗi user có 1 giỏ hàng. |
| `Status` | `string` | Max(20), Default: `"active"` | Trạng thái: `active` (đang dùng), `converted` (đã checkout), `abandoned` (bỏ quên). |
| `CreatedAt` | `DateTime` | Default: `DateTime.UtcNow` | Thời gian tạo giỏ hàng. |
| `UpdatedAt` | `DateTime` | Default: `DateTime.UtcNow` | Lần cập nhật giỏ hàng gần nhất. |

- **Navigation Properties:**
  - `User` (`User`): Chủ nhân giỏ hàng (1 - 1).
  - `CartItems` (`ICollection<CartItem>`): Danh sách các món trong giỏ (1 - N).

---

### 3.2. `CartItem.cs` - Mục hàng trong giỏ
- **Mục đích:** Lưu thông tin từng món được chọn trong giỏ, kèm kích cỡ và số lượng.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `CartItemId` | `int` | `[Key]`, Column("cart_item_id") | Khóa chính dòng giỏ hàng. |
| `CartId` | `int` | Column("cart_id"), FK | Thuộc giỏ hàng nào. |
| `ProductId` | `int` | Column("product_id"), FK | Món đồ uống được chọn. |
| `SizeId` | `int?` | Column("size_id"), FK | Kích cỡ được chọn (S/M/L). |
| `Quantity` | `int` | Column("quantity") | Số lượng ly/phần đặt mua. |
| `UnitPrice` | `decimal` | Column("unit_price") | Giá lưu tại thời điểm thêm vào giỏ. |

- **Navigation Properties:**
  - `Cart` (`Cart`): Thuộc giỏ hàng nào.
  - `Product` (`Product`): Thông tin sản phẩm.
  - `Size` (`Size?`): Thông tin kích cỡ đã chọn.
  - `CartItemToppings` (`ICollection<CartItemTopping>`): Danh sách topping đi kèm món này trong giỏ (1 - N).

---

### 3.3. `CartItemTopping.cs` - Topping cho món trong giỏ
- **Mục đích:** Lưu các loại topping mà khách chọn cho từng ly nước trong giỏ hàng.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `CartItemToppingId` | `int` | `[Key]` | Khóa chính. |
| `CartItemId` | `int` | FK | Thuộc ly nước (`CartItem`) nào. |
| `ToppingId` | `int` | FK | Loại topping được chọn. |
| `Quantity` | `int` | Default: `1` | Số lượng phần topping. |
| `UnitPrice` | `decimal` | | Giá tiền topping (= Topping.Price * Quantity). |

---

## 4. NHÓM 4: ĐƠN HÀNG & VẬN HÀNH

### 4.1. `Order.cs` - Hóa đơn đặt hàng
- **Mục đích:** Thực thể trung tâm lưu trữ toàn bộ thông tin đơn hàng sau khi checkout.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `OrderId` | `int` | `[Key]` | Khóa chính đơn hàng. |
| `UserId` | `int` | FK | Người đặt đơn hàng. |
| `AddressId` | `int` | FK | Địa chỉ giao hàng được chọn. |
| `OrderDate` | `DateTime` | Default: `DateTime.UtcNow` | Thời gian đặt hàng. |
| `TotalAmount` | `decimal` | | Tổng số tiền thanh toán cuối cùng (đã gồm ship và trừ voucher). |
| `PaymentMethod` | `string?` | | Phương thức thanh toán (COD, VNPAY, MOMO...). |
| `CurrentStatus` | `string?` | | Trạng thái hiện tại: `Pending`, `Confirmed`, `Preparing`, `Shipping`, `Completed`, `Cancelled`. |
| `Note` | `string?` | Max(500) | Ghi chú của khách (ít đường, nhiều đá, giao trước 12h...). |
| `VoucherId` | `int?` | FK, Tùy chọn | Mã voucher được áp dụng (nếu có). |
| `DiscountAmount`| `decimal` | | Số tiền được giảm từ voucher. |
| `ShippingFee` | `decimal` | | Phí vận chuyển tính toán theo khoảng cách km. |
| `DistanceKm` | `double` | | Khoảng cách từ quán tới địa chỉ giao hàng (km). |

- **Navigation Properties:**
  - `User` (`User?`): Thông tin khách hàng.
  - `Address` (`Address?`): Địa chỉ nhận hàng chi tiết.
  - `Voucher` (`Voucher?`): Thông tin voucher áp dụng.
  - `OrderDetails` (`ICollection<OrderDetail>?`): Danh sách chi tiết các món trong đơn (1 - N).
  - `StatusHistories` (`ICollection<OrderStatusHistory>?`): Toàn bộ lịch sử các lần chuyển trạng thái đơn (1 - N).

---

### 4.2. `OrderDetail.cs` - Chi tiết món trong đơn hàng
- **Mục đích:** Lưu lại từng món ăn/uống, giá tiền chốt và size đã mua tại thời điểm đặt hàng.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `OrderDetailId` | `int` | `[Key]` | Khóa chính dòng đơn hàng. |
| `OrderId` | `int` | FK | Thuộc đơn hàng nào. |
| `ProductId` | `int` | FK | Món đồ uống đã đặt. |
| `SizeId` | `int?` | FK | Size ly đã chọn. |
| `Quantity` | `int` | | Số lượng ly đặt mua. |
| `UnitPrice` | `decimal` | | Đơn giá tại thời điểm chốt đơn. |
| `Note` | `string?` | | Ghi chú riêng cho từng ly (độ ngọt, đá). |

- **Navigation Properties:**
  - `Order` (`Order?`): Thuộc đơn hàng nào.
  - `Product` (`Product?`): Thông tin sản phẩm.
  - `Size` (`Size?`): Thông tin kích cỡ.
  - `Feedbacks` (`ICollection<Feedback>?`): Đánh giá của khách dành riêng cho món này trong đơn.
  - `OrderDetailToppings` (`ICollection<OrderDetailTopping>?`): Các topping đi kèm ly này (1 - N).

---

### 4.3. `OrderDetailTopping.cs` - Topping chi tiết trong đơn hàng
- **Mục đích:** Lưu trữ snapshot topping khách đã mua kèm ly nước tại thời điểm chốt đơn.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `Id` | `int` | `[Key]` | Khóa chính. |
| `OrderDetailId` | `int` | FK | Thuộc dòng chi tiết đơn hàng nào. |
| `ToppingId` | `int` | FK | Loại topping đã mua. |
| `Quantity` | `int` | Default: `1` | Số lượng phần topping. |
| `UnitPrice` | `decimal` | | Giá bán topping tại thời điểm đặt đơn. |

---

### 4.4. `OrderStatusHistory.cs` - Lịch sử trạng thái đơn hàng
- **Mục đích:** Lưu vết kiểm toán (Audit Trail) mỗi khi trạng thái đơn hàng thay đổi (ai đổi, lúc nào, ghi chú gì).
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `HistoryId` | `int` | `[Key]` | Khóa chính lịch sử. |
| `OrderId` | `int` | FK | Đơn hàng được cập nhật. |
| `Status` | `string?` | Max(500) | Trạng thái mới được chuyển sang. |
| `ChangedBy` | `int` | FK | UserId của người thực hiện hành động (Admin/Staff/Khách hủy). |
| `ChangedAt` | `DateTime` | Default: `DateTime.UtcNow` | Thời điểm thực hiện chuyển trạng thái. |
| `Note` | `string?` | | Lý do chuyển trạng thái (ví dụ: "Hết trân châu", "Giao thất bại"). |

---

### 4.5. `ShippingConfig.cs` - Cấu hình thuật toán tính cước vận chuyển
- **Mục đích:** Cho phép Quản trị viên cấu hình linh hoạt công thức tính cước vận chuyển theo khoảng cách km và phụ phí thời gian.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Giá trị mặc định | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `Id` | `int` | `[Key]` | Khóa chính bản ghi cấu hình. |
| `BaseFee` | `decimal` | `5000` VNĐ | Cước phí cho số km đầu tiên. |
| `BaseDistanceKm`| `double` | `5.0` km | Quãng đường tối đa áp dụng mức cước cơ sở. |
| `ExtraFeePerKm` | `decimal` | `2000` VNĐ | Cước phụ thu cho mỗi km tiếp theo vượt quá cước cơ sở. |
| `MaxDistanceKm` | `double` | `10.0` km | Bán kính giao hàng tối đa mà quán nhận đơn. |
| `IsFreeShippingEnabled` | `bool` | `true` | Bật hoặc tắt tính năng Freeship theo giá trị đơn. |
| `FreeShippingThreshold` | `decimal` | `200000` VNĐ | Giá trị đơn tối thiểu để được miễn phí vận chuyển. |
| `NightSurcharge`| `decimal` | `2000` VNĐ | Phụ phí giao hàng ban đêm. |
| `NightHourStart`| `int` | `22` (22h đêm) | Giờ bắt đầu tính phụ phí đêm. |
| `NightHourEnd` | `int` | `6` (6h sáng) | Giờ kết thúc tính phụ phí đêm. |
| `PeakHourSurcharge` | `decimal` | `0` VNĐ | Phụ phí giờ cao điểm trưa/chiều. |
| `PeakHourStart` | `int` | `11` (11h trưa) | Bắt đầu giờ cao điểm. |
| `PeakHourEnd` | `int` | `13` (13h chiều) | Kết thúc giờ cao điểm. |
| `WeekendSurcharge` | `decimal` | `3000` VNĐ | Phụ phí giao hàng vào Thứ 7 và Chủ Nhật. |

---

## 5. NHÓM 5: KHUYẾN MÃI (VOUCHER)

### 5.1. `Voucher.cs` - Mã giảm giá
- **Mục đích:** Quản lý các chương trình ưu đãi, mã giảm giá công khai hoặc riêng tư.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Giá trị / Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `VoucherId` | `int` | `[Key]` | Khóa chính voucher. |
| `Code` | `string?` | | Mã code giảm giá nhập vào khi checkout (ví dụ: `FREESHIP50`, `CAFE20`). |
| `Description` | `string` | | Mô tả chi tiết chương trình ưu đãi. |
| `TargetType` | `string` | `"PUBLIC"` hoặc `"USER"` | Áp dụng công khai cho mọi người hay cấp riêng cho từng User. |
| `ApplyType` | `string` | `"ORDER"` hoặc `"SHIPPING"` | Giảm vào tiền nước hay giảm vào tiền phí ship. |
| `DiscountType` | `string?` | `"PERCENT"` hoặc `"FIXED"` | Giảm theo phần trăm (%) hay giảm số tiền cố định (VNĐ). |
| `DiscountValue`| `decimal` | | Mức giảm (ví dụ: 20 nghĩa là 20% hoặc 20,000 VNĐ). |
| `MinOrderValue` | `decimal` | | Giá trị đơn hàng tối thiểu để được áp voucher. |
| `MaxDiscountAmount` | `decimal` | | Mức giảm tối đa (khi dùng kiểu giảm theo phần trăm). |
| `StartDate` | `DateTime` | `[Required]` | Ngày bắt đầu có hiệu lực. |
| `EndDate` | `DateTime` | `[Required]` | Ngày hết hạn voucher. |
| `UsageLimit` | `int` | | Tổng số lượt dùng tối đa trên toàn hệ thống. |
| `UsedCount` | `int` | Default: `0` | Số lượt voucher đã được sử dụng thực tế. |
| `IsActive` | `bool` | Default: `true` | Bật/tắt voucher thủ công bởi Admin. |

- **Navigation Properties:**
  - `UserVouchers` (`ICollection<UserVoucher>`): Danh sách gán voucher riêng cho người dùng (1 - N).

---

### 5.2. `UserVoucher.cs` - Ví Voucher người dùng
- **Mục đích:** Quản lý số lần một người dùng cụ thể đã sử dụng voucher.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Giá trị / Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `Id` | `int` | `[Key]` | Khóa chính. |
| `UserId` | `int` | FK | Khách hàng sở hữu voucher. |
| `VoucherId` | `int` | FK | Mã voucher được cấp. |
| `UsageLimitPerUser` | `int` | Default: `1` | Số lần tối đa User này được phép dùng mã này. |
| `UsedCount` | `int` | Default: `0` | Số lần User này đã sử dụng mã này thực tế. |
| `IsUsed` | `bool` | Computed property | Tự động trả về `true` khi `UsedCount >= UsageLimitPerUser`. |
| `AssignedDate` | `DateTime` | Default: `DateTime.UtcNow` | Thời điểm voucher được trao tặng vào ví của user. |

---

## 6. NHÓM 6: TƯƠNG TÁC & NỘI DUNG

### 6.1. `Feedback.cs` - Đánh giá món ăn
- **Mục đích:** Cho phép khách hàng gửi số sao và nhận xét cho từng món sau khi đã nhận hàng thành công.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `FeedbackId` | `int` | `[Key]` | Khóa chính đánh giá. |
| `ProductId` | `int` | `[Required]`, FK | Món được đánh giá. |
| `UserId` | `int` | `[Required]`, FK | Khách hàng đánh giá. |
| `OrderDetailId` | `int` | `[Required]`, FK | Dòng chi tiết đơn hàng (khóa lại để mỗi lần mua 1 món chỉ được đánh giá 1 lần). |
| `Rating` | `int` | `[Required]`, Range(1 - 5) | Đánh giá từ 1 đến 5 sao. |
| `Comment` | `string?` | Max(500) | Lời bình luận, nhận xét của khách. |
| `CreatedAt` | `DateTime` | Default: `DateTime.UtcNow` | Thời gian gửi đánh giá. |

---

### 6.2. `News.cs` - Bài viết tin tức
- **Mục đích:** Hiển thị các bài viết tin tức, thông báo, sự kiện khuyến mãi trên trang chủ.
- **Chi tiết các trường:**

| Tên thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `NewsId` | `int` | `[Key]` | Khóa chính tin tức. |
| `AuthorId` | `int` | FK | Quản trị viên/nhân viên đăng bài viết. |
| `Title` | `string?` | | Tiêu đề bài viết. |
| `Content` | `string?` | | Nội dung chi tiết bài viết. |
| `ImageUrl` | `string?` | | Ảnh đại diện bài viết. |
| `CreatedAt` | `DateTime` | Default: `DateTime.UtcNow` | Ngày đăng bài. |

- **Navigation Properties:**
  - `Author` (`User?`): Tác giả bài viết (N - 1).
