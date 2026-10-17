# ĐẶC TẢ TOÀN BỘ DATA MODEL & RÀNG BUỘC KIẾN TRÚC HỆ THỐNG CAFESHOP

Tài liệu này tổng hợp toàn bộ các thực thể (Entity Model) trong tầng dữ liệu (`CafeShop.Model`), làm rõ vai trò nghiệp vụ, ý nghĩa từng thuộc tính và toàn bộ ràng buộc (Data Annotations / Database Constraints) tương ứng.


## 2. CHI TIẾT CÁC THỰC THỂ (MODELS)

---

### 2.1. Phân hệ Danh mục & Sản phẩm (Catalog & Inventory)

#### 1. `Category` (Bảng `Categories`)
* **Nghiệp vụ:** Phân loại các món trong quán (Cà phê, Trà sữa, Nước ép, Bánh ngọt...) để hiển thị theo Menu và lọc tìm kiếm.
* **Bảng thuộc tính & Ràng buộc:**

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `CategoryId` | `int` | `[Key]` (PK, Auto-increment) | Định danh danh mục |
| `Name` | `string` | `[Required]`, `[StringLength(100)]` | Tên danh mục hiển thị trên Menu |
| `Description` | `string?` | `[StringLength(500)]`, Nullable | Mô tả chi tiết danh mục |
| `Products` | `ICollection<Product>` | Virtual Navigation | Danh sách món thuộc danh mục |

---

#### 2. `Product` (Bảng `Products`)
* **Nghiệp vụ:** Sản phẩm/đồ uống chính của quán. Chứa thông tin giá cơ bản, hình ảnh đại diện, tồn kho và trạng thái phục vụ.
* **Bảng thuộc tính & Ràng buộc:**

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `ProductId` | `int` | `[Key]` (PK, Auto-increment) | Định danh sản phẩm |
| `CategoryId` | `int` | `[Required]`, `[ForeignKey]` | ID danh mục cha |
| `Name` | `string` | `[Required]`, `[StringLength(200)]` | Tên món |
| `BasePrice` | `decimal` | `[Required]`, `[Column(TypeName="decimal(18,2)")]`, `[Range(0, ...)]` | Giá gốc (cho size chuẩn hoặc chưa tính size) |
| `ImageUrl` | `string?` | `[StringLength(500)]`, Nullable | Đường dẫn ảnh trên Cloudinary |
| `ImagePublicId`| `string?` | `[StringLength(100)]`, Nullable | Public ID trên Cloudinary để xóa ảnh cũ khi update |
| `Description` | `string?` | `[StringLength(1000)]`, Nullable | Mô tả thành phần, hương vị món |
| `IsAvailable` | `bool` | Mặc định: `true` | Đang mở bán (`true`) hay tạm ngưng bán (`false`) |
| `IsDeleted` | `bool` | Mặc định: `false` (Soft Delete) | Trạng thái xóa mềm (không xóa cứng khỏi DB) |
| `StockQuantity`| `int` | `[ConcurrencyCheck]`, `[Range(0, ...)]` | Số lượng ly/phần còn lại trong ngày (chống Over-selling) |

---

#### 3. `Size` (Bảng `Sizes`)
* **Nghiệp vụ:** Kích cỡ của ly nước (Size S, Size M, Size L).
* **Bảng thuộc tính & Ràng buộc:**

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `SizeId` | `int` | `[Key]` (PK, Auto-increment) | Định danh size |
| `Name` | `string` | `[Required]`, `[StringLength(10)]` | Tên viết tắt hoặc tên size: S, M, L |

---

#### 4. `ProductSize` (Bảng `ProductSizes`)
* **Nghiệp vụ:** Bảng nối nhiều - nhiều giữa `Product` và `Size`. Định nghĩa món nào có những size nào và phụ thu bao nhiêu tiền.
* **Bảng thuộc tính & Ràng buộc:**

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `ProductId` | `int` | Composite PK, `[ForeignKey]` | ID món |
| `SizeId` | `int` | Composite PK, `[ForeignKey]` | ID size |
| `ExtraPrice` | `decimal` | `[Column(TypeName="decimal(18,2)")]` | Tiền cộng thêm cho size này so với `BasePrice` |

---

#### 5. `Topping` (Bảng `Toppings`)
* **Nghiệp vụ:** Các món gọi kèm thêm (Trân châu trắng, Thạch nha đam, Kem cheese, Shot Espresso...).
* **Bảng thuộc tính & Ràng buộc:**

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `ToppingId` | `int` | `[Key]` (PK, Auto-increment) | Định danh topping |
| `Name` | `string` | `[Required]`, `[StringLength(50)]` | Tên topping |
| `Price` | `decimal?` | `[Column(TypeName="decimal(18,2)")]`, `[Range(0, ...)]` | Giá tiền của 1 đơn vị topping |
| `Unit` | `string` | `[StringLength(20)]` | Đơn vị định lượng: "phần", "shot", "vá"... |
| `ImageUrl` | `string?` | `[StringLength(500)]`, Nullable | Ảnh minh họa topping |
| `StockQuantity`| `int` | `[ConcurrencyCheck]`, `[Range(0, ...)]` | Tồn kho topping trong ca |
| `IsAvailable` | `bool` | Mặc định: `true` | Còn phục vụ hay hết hàng |

---

#### 6. `ProductTopping` (Bảng `ProductToppings`)
* **Nghiệp vụ:** Bảng nối liên kết món nào được phép thêm topping nào (ví dụ Cà phê đen không đi với Trân châu hoàng kim).
* **Bảng thuộc tính & Ràng buộc:** Composite PK `(ProductId, ToppingId)`.

---

### 2.2. Phân hệ Tài khoản, Phân quyền & Địa chỉ (Auth, RBAC & Addresses)

#### 7. `User` (Bảng `Users`)
* **Nghiệp vụ:** Tài khoản người dùng (Khách hàng, Nhân viên, Quản trị viên).
* **Bảng thuộc tính & Ràng buộc:**

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `UserId` | `int` | `[Key]` (PK, Auto-increment) | Định danh người dùng |
| `Username` | `string` | `[Required]`, `[StringLength(50, Min=3)]`, Unique Index | Tên đăng nhập |
| `PasswordHash` | `string` | `[Required]` | Chuỗi hash mật khẩu (BCrypt) |
| `FullName` | `string?` | `[StringLength(100)]`, Nullable | Họ và tên hiển thị |
| `PhoneNumber` | `string?` | `[StringLength(20)]`, `[Phone]`, Nullable | Số điện thoại liên hệ |
| `Email` | `string?` | `[StringLength(100)]`, `[EmailAddress]`, Unique Index | Email nhận thông báo / hóa đơn |
| `AvatarUrl` | `string?` | `[StringLength(500)]`, Nullable | Ảnh đại diện trên Cloud |
| `AvatarPublicId` | `string?`| `[StringLength(100)]`, Nullable | Cloudinary Public ID của avatar |
| `RefreshToken` | `string?` | `[StringLength(255)]`, Nullable | Token làm mới phiên đăng nhập JWT |
| `RefreshTokenExpiryTime`| `DateTime?` | Nullable | Thời gian hết hạn của RefreshToken |
| `IsActive` | `bool` | Mặc định: `true` | Khóa tài khoản (`false`) hay hoạt động (`true`) |
| `CreatedAt` | `DateTime` | Mặc định: Giờ Việt Nam | Ngày tạo tài khoản |
| `UpdatedAt` | `DateTime?`| Nullable | Ngày cập nhật thông tin gần nhất |

---

#### 8. `Role` (Bảng `Roles`) & `Permission` (Bảng `Permissions`)
* **Nghiệp vụ:** Hệ thống phân quyền RBAC (Role-Based Access Control).
  - `Role`: Các vai trò như `ADMIN`, `STAFF`, `USER`. Bảng `UserRole` ánh xạ nhiều - nhiều với User.
  - `Permission`: Các mã quyền hạn chi tiết (VD: `product.create`, `order.manage`, `voucher.assign`). Bảng `RolePermission` ánh xạ nhiều - nhiều giữa Role và Permission.

---

#### 9. `Address` (Bảng `Addresses`)
* **Nghiệp vụ:** Sổ địa chỉ giao hàng của người dùng. Tích hợp tọa độ GPS (Latitude, Longitude) phục vụ tính khoảng cách và định tuyến bằng Mapbox API.
* **Bảng thuộc tính & Ràng buộc:**

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `AddressId` | `int` | `[Key]` (PK, Auto-increment) | Định danh địa chỉ |
| `UserId` | `int` | `[Required]`, `[ForeignKey]` | Thuộc về khách hàng nào |
| `RecipientName`| `string` | `[Required]`, `[MaxLength(150)]` | Tên người nhận hàng tại điểm giao |
| `Phone` | `string?` | `[Required]`, `[Phone]`, `[MaxLength(20)]` | SĐT shipper gọi khi tới |
| `FullAddress` | `string` | `[Required]`, `[StringLength(500)]` | Địa chỉ cụ thể (chuỗi geocoded từ Mapbox) |
| `Latitude` | `double` | `double` | Vĩ độ GPS |
| `Longitude` | `double` | `double` | Kinh độ GPS |
| `IsDefault` | `bool` | Mặc định: `false` | Địa chỉ mặc định ưu tiên chọn khi checkout |
| `IsDeleted` | `bool` | Mặc định: `false` | Xóa mềm địa chỉ |

---

### 2.3. Phân hệ Giỏ hàng & Đặt hàng (Cart & Order Processing)

#### 10. `Cart` (Bảng `Carts`) & `CartItem` (Bảng `CartItems`)
* **Nghiệp vụ:** Quản lý giỏ hàng của khách hàng trước khi bấm thanh toán.
  - Mỗi `User` chỉ có 1 `Cart` hoạt động (`Status = "active"`).
  - `CartItem`: Món trong giỏ kèm theo `SizeId`, `Quantity`, và `UnitPrice` (snapshot giá tại thời điểm thêm vào giỏ).
  - `CartItemTopping`: Bảng con lưu danh sách topping chọn cho từng item trong giỏ.

---

#### 11. `Order` (Bảng `Orders`)
* **Nghiệp vụ:** Đơn hàng hoàn chỉnh sau khi khách hàng nhấn Đặt hàng (Checkout/Buy Now). Chứa snapshot địa chỉ, tính toán giảm giá, phí ship và trạng thái xử lý đơn.
* **Bảng thuộc tính & Ràng buộc:**

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `OrderId` | `int` | `[Key]` (PK, Auto-increment) | Mã số đơn hàng |
| `UserId` | `int` | `[ForeignKey]` | Khách hàng đặt mua |
| `AddressId` | `int` | `[ForeignKey]` | ID địa chỉ gốc |
| `RecipientName`| `string?` | `[StringLength(150)]` | **Snapshot** Tên người nhận (bảo lưu dù sau này User đổi sổ địa chỉ) |
| `Phone` | `string?` | `[StringLength(20)]` | **Snapshot** SĐT người nhận |
| `FullAddress` | `string?` | `[StringLength(500)]` | **Snapshot** Địa chỉ giao nhận chi tiết |
| `OrderDate` | `DateTime` | Mặc định: Giờ Việt Nam | Thời điểm đặt hàng |
| `SubTotal` | `decimal` | `[Column(TypeName="decimal(18,2)")]` | Tổng tiền hàng gốc (chưa tính ship & giảm giá) |
| `DistanceKm` | `double` | `double` | Khoảng cách đường chạy từ quán đến địa chỉ khách (km) |
| `ShippingFee` | `decimal` | `[Column(TypeName="decimal(18,2)")]` | Phí giao hàng tính từ DistanceKm & ShippingConfig |
| `VoucherId` | `int?` | `[ForeignKey]`, Nullable | Mã voucher áp dụng (nếu có) |
| `OrderDiscount`| `decimal` | `[Column(TypeName="decimal(18,2)")]` | Số tiền được giảm trên tiền nước |
| `ShippingDiscount`| `decimal` | `[Column(TypeName="decimal(18,2)")]` | Số tiền được giảm trên tiền ship (Freeship voucher) |
| `TotalAmount` | `decimal` | `[Column(TypeName="decimal(18,2)")]` | Tổng thanh toán cuối: `(SubTotal - OrderDiscount) + (ShippingFee - ShippingDiscount)` |
| `PaymentMethod`| `string?` | `[StringLength(50)]` | Phương thức: `COD`, `VNPAY`, `MOMO` |
| `PaymentStatus`| `string` | `[StringLength(50)]` | Trạng thái tiền: `UNPAID`, `PAID`, `REFUNDED` |
| `CurrentStatus`| `string?` | `[StringLength(50)]` | Trạng thái tiến trình: `PENDING`, `CONFIRMED`, `PREPARING`, `SHIPPING`, `COMPLETED`, `CANCELLED` |
| `Note` | `string?` | `[StringLength(500)]` | Lời nhắn của khách (ít đá, nhiều đường...) |

---

#### 12. `OrderDetail` & `OrderDetailTopping`
* **Nghiệp vụ:**
  - `OrderDetail`: Lưu lại từng món trong đơn, `SizeId`, `Quantity`, và giá tiền `UnitPrice` tại thời điểm chốt đơn.
  - `OrderDetailTopping`: Lưu danh sách topping đi kèm món đó và giá topping tại thời điểm mua.

---

#### 13. `OrderStatusHistory` (Bảng `OrderStatusHistories`)
* **Nghiệp vụ:** Ghi log lịch sử thay đổi trạng thái đơn hàng (Ai đổi, đổi sang trạng thái gì, lúc mấy giờ, lý do gì) phục vụ truy vết và hiển thị timeline cho khách.

---

#### 14. `Payment` (Bảng `Payments`)
* **Nghiệp vụ:** Ghi nhận các giao dịch thanh toán điện tử (VNPay, Momo) hoặc tiền mặt (COD). Chứa mã giao dịch ngân hàng `TransactionCode`, mã nhà cung cấp `PaymentProvider` và log lỗi `ErrorMessage`.

---

### 2.4. Phân hệ Khuyến mãi & Voucher (Promotion & Discount)

#### 15. `Voucher` (Bảng `Vouchers`)
* **Nghiệp vụ:** Quản lý các chương trình ưu đãi, mã giảm giá do Admin tạo ra.
* **Bảng thuộc tính & Ràng buộc:**

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `VoucherId` | `int` | `[Key]` (PK, Auto-increment) | Định danh voucher |
| `Code` | `string?` | `[Required]`, `[StringLength(50)]`, Unique Index | Mã khách hàng nhập (VD: `CAFE10K`, `FREESHIP`) |
| `Description` | `string` | `[StringLength(500)]` | Mô tả điều kiện sử dụng |
| `TargetType` | `string` | `[StringLength(20)]` | `PUBLIC` (ai cũng dùng được) hoặc `USER` (tặng riêng ví user) |
| `ApplyType` | `string` | `[StringLength(20)]` | `ORDER` (giảm tiền nước) hoặc `SHIPPING` (giảm tiền ship) |
| `DiscountType` | `string?` | `[StringLength(20)]` | `FIXED` (giảm số tiền cố định) hoặc `PERCENT` (giảm theo %) |
| `DiscountValue`| `decimal` | `[Column(TypeName="decimal(18,2)")]`, `[Range(0, ...)]` | Giá trị giảm (VND hoặc %) |
| `MinOrderValue`| `decimal` | `[Column(TypeName="decimal(18,2)")]`, `[Range(0, ...)]` | Giá trị đơn tối thiểu để mã có hiệu lực |
| `MaxDiscountAmount`| `decimal` | `[Column(TypeName="decimal(18,2)")]`, `[Range(0, ...)]` | Mức giảm kịch kim nếu là mã giảm theo % |
| `StartDate` | `DateTime` | `[Required]` | Ngày bắt đầu có hiệu lực |
| `EndDate` | `DateTime` | `[Required]` | Ngày hết hạn |
| `UsageLimit` | `int` | `[Range(0, ...)]` | Tổng lượt dùng tối đa toàn hệ thống |
| `UsedCount` | `int` | `[ConcurrencyCheck]`, `[Range(0, ...)]` | Số lượt đã sử dụng (chống race condition khi tranh mã) |
| `IsActive` | `bool` | Mặc định: `true` | Đang kích hoạt hay tạm dừng |

---

#### 16. `UserVoucher` (Bảng `UserVouchers`)
* **Nghiệp vụ:** Ví voucher cá nhân của từng User (áp dụng khi voucher có `TargetType = "USER"`). Quản lý số lần tối đa mỗi khách được áp dụng mã này (`UsageLimitPerUser`) và số lần đã dùng (`UsedCount`).

---

### 2.5. Phân hệ Đánh giá, Tin tức & Cấu hình Cửa hàng (Feedback, News & Configs)

#### 17. `Feedback`, `FeedbackImage` & `FeedbackReply`
* **Nghiệp vụ:**
  - `Feedback`: Đánh giá sao (1 - 5 sao) và bình luận của khách hàng. Ràng buộc `OrderDetailId` là Unique Index để mỗi món trong mỗi đơn chỉ được đánh giá duy nhất 1 lần.
  - `FeedbackImage`: Các hình ảnh đính kèm minh họa món ăn thực tế do khách chụp.
  - `FeedbackReply`: Câu trả lời chính thức của Admin/Nhân viên cho bài đánh giá của khách.

---

#### 18. `News` (Bảng `News`)
* **Nghiệp vụ:** Bài viết truyền thông, giới thiệu món mới, cẩm nang cà phê. Hỗ trợ SEO qua trường `Slug` duy nhất, hẹn giờ đăng (`ScheduledPublishAt`), và đếm lượt xem (`ViewCount`).

---

#### 19. `ShippingConfig` (Bảng `ShippingConfigs`)
* **Nghiệp vụ:** Cấu hình thuật toán tính tiền ship động của quán:
  - `BaseFee` & `BaseDistanceKm`: Giá mở cửa cho số km đầu tiên.
  - `ExtraFeePerKm`: Giá mỗi km phát sinh tiếp theo.
  - `MaxDistanceKm`: Bán kính giao hàng tối đa (vượt quá sẽ từ chối nhận đơn).
  - `IsFreeShippingEnabled` & `FreeShippingThreshold`: Tự động miễn phí ship nếu đơn hàng đạt giá trị tối thiểu.
  - `NightSurcharge`, `PeakHourSurcharge`, `WeekendSurcharge`: Phụ phí đêm, giờ cao điểm và cuối tuần.

---

#### 20. `StoreProfile` (Bảng `StoreProfiles`)
* **Nghiệp vụ:** Cấu hình thông tin hoạt động trực tiếp của quán:
  - Tên quán, Hotline, Địa chỉ chính, Tọa độ GPS gốc để làm mốc tính khoảng cách xe chạy.
  - `OpenTime` & `CloseTime`: Giờ mở cửa và đóng cửa (hỗ trợ kiểm tra quán có đang mở hay không).
  - `IsAcceptingOrders`: Bật/tắt chế độ nhận đơn (khi quán quá tải có thể tạm gạt tắt).
  - `IsMaintenanceMode`: Bật chế độ bảo trì toàn bộ hệ thống.

---

## 3. TỔNG KẾT BẢNG MÃ SẮP XẾP SCHEMA TOÀN HỆ THỐNG

```
[Users] ──1:N──> [Orders] ──1:N──> [OrderDetails] ──1:N──> [OrderDetailToppings]
   │                │                      │
   ├──1:1──> [Carts]│                      └──1:1──> [Feedbacks] ──1:1──> [FeedbackReplies]
   ├──1:N──> [Addresses]                   │
   └──1:N──> [UserVouchers]                └──N:1──> [Products] ──1:N──> [ProductSizes]
                 │                                      │
                 └──N:1──> [Vouchers]                   └──1:N──> [ProductToppings]
```

Tất cả các Model trên hiện tại đã được cấu hình chặt chẽ về mặt kiểu dữ liệu (`decimal(18,2)`), độ dài tối đa (`StringLength`/`MaxLength`), tính toàn vẹn (`Required`, `ForeignKey`, `ConcurrencyCheck`), và đã được đồng bộ chuẩn xác với các Request DTO tương ứng.
