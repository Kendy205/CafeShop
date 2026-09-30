SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE `Categories` (
    `CategoryId` int NOT NULL AUTO_INCREMENT,
    `Name` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `Description` varchar(500) CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_Categories` PRIMARY KEY (`CategoryId`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Permissions` (
    `PermissionId` int NOT NULL AUTO_INCREMENT,
    `Code` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `Module` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `Description` varchar(255) CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_Permissions` PRIMARY KEY (`PermissionId`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Roles` (
    `RoleId` int NOT NULL AUTO_INCREMENT,
    `Name` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `Description` varchar(255) CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_Roles` PRIMARY KEY (`RoleId`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `ShippingConfigs` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `BaseFee` decimal(18,0) NOT NULL,
    `BaseDistanceKm` double NOT NULL,
    `ExtraFeePerKm` decimal(18,0) NOT NULL,
    `MaxDistanceKm` double NOT NULL,
    `IsFreeShippingEnabled` tinyint(1) NOT NULL,
    `FreeShippingThreshold` decimal(18,0) NOT NULL,
    `NightSurcharge` decimal(18,0) NOT NULL,
    `NightHourStart` int NOT NULL,
    `NightHourEnd` int NOT NULL,
    `PeakHourSurcharge` decimal(18,0) NOT NULL,
    `PeakHourStart` int NOT NULL,
    `PeakHourEnd` int NOT NULL,
    `WeekendSurcharge` decimal(18,0) NOT NULL,
    CONSTRAINT `PK_ShippingConfigs` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Sizes` (
    `SizeId` int NOT NULL AUTO_INCREMENT,
    `Name` varchar(10) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Sizes` PRIMARY KEY (`SizeId`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Toppings` (
    `ToppingId` int NOT NULL AUTO_INCREMENT,
    `Name` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `Price` decimal(18,0) NULL,
    `Unit` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `ImageUrl` longtext CHARACTER SET utf8mb4 NULL,
    `StockQuantity` int NOT NULL,
    `IsAvailable` tinyint(1) NOT NULL,
    CONSTRAINT `PK_Toppings` PRIMARY KEY (`ToppingId`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Users` (
    `UserId` int NOT NULL AUTO_INCREMENT,
    `Username` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `PasswordHash` longtext CHARACTER SET utf8mb4 NOT NULL,
    `FullName` longtext CHARACTER SET utf8mb4 NULL,
    `PhoneNumber` longtext CHARACTER SET utf8mb4 NULL,
    `Email` varchar(255) CHARACTER SET utf8mb4 NULL,
    `AvatarUrl` longtext CHARACTER SET utf8mb4 NULL,
    `AvatarPublicId` longtext CHARACTER SET utf8mb4 NULL,
    `RefreshToken` longtext CHARACTER SET utf8mb4 NULL,
    `RefreshTokenExpiryTime` datetime(6) NULL,
    `IsActive` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_Users` PRIMARY KEY (`UserId`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Vouchers` (
    `VoucherId` int NOT NULL AUTO_INCREMENT,
    `Code` varchar(255) CHARACTER SET utf8mb4 NULL,
    `Description` longtext CHARACTER SET utf8mb4 NOT NULL,
    `TargetType` longtext CHARACTER SET utf8mb4 NOT NULL,
    `ApplyType` longtext CHARACTER SET utf8mb4 NOT NULL,
    `DiscountType` longtext CHARACTER SET utf8mb4 NULL,
    `DiscountValue` decimal(18,0) NOT NULL,
    `MinOrderValue` decimal(18,0) NOT NULL,
    `MaxDiscountAmount` decimal(18,0) NOT NULL,
    `StartDate` datetime(6) NOT NULL,
    `EndDate` datetime(6) NOT NULL,
    `UsageLimit` int NOT NULL,
    `UsedCount` int NOT NULL,
    `IsActive` tinyint(1) NOT NULL,
    CONSTRAINT `PK_Vouchers` PRIMARY KEY (`VoucherId`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `Products` (
    `ProductId` int NOT NULL AUTO_INCREMENT,
    `CategoryId` int NOT NULL,
    `Name` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    `BasePrice` decimal(18,0) NOT NULL,
    `ImageUrl` longtext CHARACTER SET utf8mb4 NULL,
    `ImagePublicId` longtext CHARACTER SET utf8mb4 NULL,
    `Description` longtext CHARACTER SET utf8mb4 NULL,
    `IsAvailable` tinyint(1) NOT NULL,
    `StockQuantity` int NOT NULL,
    CONSTRAINT `PK_Products` PRIMARY KEY (`ProductId`),
    CONSTRAINT `FK_Products_Categories_CategoryId` FOREIGN KEY (`CategoryId`) REFERENCES `Categories` (`CategoryId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `RolePermissions` (
    `RoleId` int NOT NULL,
    `PermissionId` int NOT NULL,
    CONSTRAINT `PK_RolePermissions` PRIMARY KEY (`RoleId`, `PermissionId`),
    CONSTRAINT `FK_RolePermissions_Permissions_PermissionId` FOREIGN KEY (`PermissionId`) REFERENCES `Permissions` (`PermissionId`) ON DELETE CASCADE,
    CONSTRAINT `FK_RolePermissions_Roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`RoleId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `Addresses` (
    `AddressId` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `RecipientName` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `Phone` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `FullAddress` varchar(500) CHARACTER SET utf8mb4 NOT NULL,
    `IsDefault` tinyint(1) NOT NULL,
    `IsDeleted` tinyint(1) NOT NULL,
    `Latitude` double NOT NULL,
    `Longitude` double NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_Addresses` PRIMARY KEY (`AddressId`),
    CONSTRAINT `FK_Addresses_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `Carts` (
    `CartId` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `Status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_Carts` PRIMARY KEY (`CartId`),
    CONSTRAINT `FK_Carts_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `News` (
    `NewsId` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `Title` varchar(255) CHARACTER SET utf8mb4 NULL,
    `Slug` varchar(255) CHARACTER SET utf8mb4 NULL,
    `Summary` longtext CHARACTER SET utf8mb4 NULL,
    `Content` longtext CHARACTER SET utf8mb4 NULL,
    `ImageUrl` longtext CHARACTER SET utf8mb4 NULL,
    `Status` varchar(50) CHARACTER SET utf8mb4 NULL,
    `ScheduledPublishAt` datetime(6) NULL,
    `PublishedAt` datetime(6) NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    `IsDeleted` tinyint(1) NOT NULL,
    `ViewCount` int NOT NULL,
    CONSTRAINT `PK_News` PRIMARY KEY (`NewsId`),
    CONSTRAINT `FK_News_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT
) CHARACTER SET=utf8mb4;


CREATE TABLE `UserRoles` (
    `UserId` int NOT NULL,
    `RoleId` int NOT NULL,
    CONSTRAINT `PK_UserRoles` PRIMARY KEY (`UserId`, `RoleId`),
    CONSTRAINT `FK_UserRoles_Roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`RoleId`) ON DELETE CASCADE,
    CONSTRAINT `FK_UserRoles_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `UserVouchers` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `VoucherId` int NOT NULL,
    `UsageLimitPerUser` int NOT NULL,
    `UsedCount` int NOT NULL,
    `AssignedDate` datetime(6) NOT NULL,
    CONSTRAINT `PK_UserVouchers` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_UserVouchers_Vouchers_VoucherId` FOREIGN KEY (`VoucherId`) REFERENCES `Vouchers` (`VoucherId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `ProductSizes` (
    `ProductId` int NOT NULL,
    `SizeId` int NOT NULL,
    `Price` decimal(18,0) NULL,
    `StockQuantity` int NOT NULL,
    CONSTRAINT `PK_ProductSizes` PRIMARY KEY (`ProductId`, `SizeId`),
    CONSTRAINT `FK_ProductSizes_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`ProductId`) ON DELETE CASCADE,
    CONSTRAINT `FK_ProductSizes_Sizes_SizeId` FOREIGN KEY (`SizeId`) REFERENCES `Sizes` (`SizeId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `ProductToppings` (
    `ProductId` int NOT NULL,
    `ToppingId` int NOT NULL,
    CONSTRAINT `PK_ProductToppings` PRIMARY KEY (`ProductId`, `ToppingId`),
    CONSTRAINT `FK_ProductToppings_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`ProductId`) ON DELETE CASCADE,
    CONSTRAINT `FK_ProductToppings_Toppings_ToppingId` FOREIGN KEY (`ToppingId`) REFERENCES `Toppings` (`ToppingId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `Orders` (
    `OrderId` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `AddressId` int NOT NULL,
    `RecipientName` varchar(150) CHARACTER SET utf8mb4 NULL,
    `Phone` varchar(20) CHARACTER SET utf8mb4 NULL,
    `FullAddress` varchar(500) CHARACTER SET utf8mb4 NULL,
    `OrderDate` datetime(6) NOT NULL,
    `SubTotal` decimal(18,0) NOT NULL,
    `TotalAmount` decimal(18,0) NOT NULL,
    `PaymentMethod` longtext CHARACTER SET utf8mb4 NULL,
    `PaymentStatus` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `CurrentStatus` longtext CHARACTER SET utf8mb4 NULL,
    `Note` varchar(500) CHARACTER SET utf8mb4 NULL,
    `VoucherId` int NULL,
    `OrderDiscount` decimal(18,0) NOT NULL,
    `ShippingDiscount` decimal(18,0) NOT NULL,
    `ShippingFee` decimal(18,0) NOT NULL,
    `DistanceKm` double NOT NULL,
    CONSTRAINT `PK_Orders` PRIMARY KEY (`OrderId`),
    CONSTRAINT `FK_Orders_Addresses_AddressId` FOREIGN KEY (`AddressId`) REFERENCES `Addresses` (`AddressId`) ON DELETE CASCADE,
    CONSTRAINT `FK_Orders_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE,
    CONSTRAINT `FK_Orders_Vouchers_VoucherId` FOREIGN KEY (`VoucherId`) REFERENCES `Vouchers` (`VoucherId`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `CartItems` (
    `cart_item_id` int NOT NULL AUTO_INCREMENT,
    `cart_id` int NOT NULL,
    `product_id` int NOT NULL,
    `size_id` int NULL,
    `quantity` int NOT NULL,
    `unit_price` decimal(18,0) NOT NULL,
    CONSTRAINT `PK_CartItems` PRIMARY KEY (`cart_item_id`),
    CONSTRAINT `FK_CartItems_Carts_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `Carts` (`CartId`) ON DELETE CASCADE,
    CONSTRAINT `FK_CartItems_Products_product_id` FOREIGN KEY (`product_id`) REFERENCES `Products` (`ProductId`) ON DELETE CASCADE,
    CONSTRAINT `FK_CartItems_Sizes_size_id` FOREIGN KEY (`size_id`) REFERENCES `Sizes` (`SizeId`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `OrderDetails` (
    `OrderDetailId` int NOT NULL AUTO_INCREMENT,
    `OrderId` int NOT NULL,
    `ProductId` int NOT NULL,
    `SizeId` int NULL,
    `Quantity` int NOT NULL,
    `UnitPrice` decimal(18,0) NOT NULL,
    `Note` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_OrderDetails` PRIMARY KEY (`OrderDetailId`),
    CONSTRAINT `FK_OrderDetails_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `Orders` (`OrderId`) ON DELETE CASCADE,
    CONSTRAINT `FK_OrderDetails_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`ProductId`) ON DELETE RESTRICT,
    CONSTRAINT `FK_OrderDetails_Sizes_SizeId` FOREIGN KEY (`SizeId`) REFERENCES `Sizes` (`SizeId`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `OrderStatusHistories` (
    `HistoryId` int NOT NULL AUTO_INCREMENT,
    `OrderId` int NOT NULL,
    `Status` varchar(50) CHARACTER SET utf8mb4 NULL,
    `ChangedBy` int NOT NULL,
    `ChangedAt` datetime(6) NOT NULL,
    `Note` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_OrderStatusHistories` PRIMARY KEY (`HistoryId`),
    CONSTRAINT `FK_OrderStatusHistories_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `Orders` (`OrderId`) ON DELETE CASCADE,
    CONSTRAINT `FK_OrderStatusHistories_Users_ChangedBy` FOREIGN KEY (`ChangedBy`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `Payments` (
    `PaymentId` int NOT NULL AUTO_INCREMENT,
    `OrderId` int NOT NULL,
    `PaymentMethod` varchar(30) CHARACTER SET utf8mb4 NOT NULL,
    `PaymentProvider` varchar(50) CHARACTER SET utf8mb4 NULL,
    `TransactionCode` varchar(100) CHARACTER SET utf8mb4 NULL,
    `Amount` decimal(18,0) NOT NULL,
    `PaymentStatus` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `PaidAt` datetime(6) NULL,
    `ErrorMessage` varchar(500) CHARACTER SET utf8mb4 NULL,
    `CreatedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_Payments` PRIMARY KEY (`PaymentId`),
    CONSTRAINT `FK_Payments_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `Orders` (`OrderId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `cart_item_toppings` (
    `cart_item_topping_id` int NOT NULL AUTO_INCREMENT,
    `cart_item_id` int NOT NULL,
    `topping_id` int NOT NULL,
    `Quantity` int NOT NULL,
    `unit_price` decimal(18,0) NOT NULL,
    CONSTRAINT `PK_cart_item_toppings` PRIMARY KEY (`cart_item_topping_id`),
    CONSTRAINT `FK_cart_item_toppings_CartItems_cart_item_id` FOREIGN KEY (`cart_item_id`) REFERENCES `CartItems` (`cart_item_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_cart_item_toppings_Toppings_topping_id` FOREIGN KEY (`topping_id`) REFERENCES `Toppings` (`ToppingId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `Feedbacks` (
    `FeedbackId` int NOT NULL AUTO_INCREMENT,
    `ProductId` int NOT NULL,
    `UserId` int NOT NULL,
    `OrderDetailId` int NOT NULL,
    `Rating` int NOT NULL,
    `Comment` varchar(500) CHARACTER SET utf8mb4 NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `IsVisible` tinyint(1) NOT NULL,
    CONSTRAINT `PK_Feedbacks` PRIMARY KEY (`FeedbackId`),
    CONSTRAINT `FK_Feedbacks_OrderDetails_OrderDetailId` FOREIGN KEY (`OrderDetailId`) REFERENCES `OrderDetails` (`OrderDetailId`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Feedbacks_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`ProductId`) ON DELETE CASCADE,
    CONSTRAINT `FK_Feedbacks_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `OrderDetailToppings` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `OrderDetailId` int NOT NULL,
    `ToppingId` int NOT NULL,
    `Quantity` int NOT NULL,
    `UnitPrice` decimal(18,0) NOT NULL,
    CONSTRAINT `PK_OrderDetailToppings` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_OrderDetailToppings_OrderDetails_OrderDetailId` FOREIGN KEY (`OrderDetailId`) REFERENCES `OrderDetails` (`OrderDetailId`) ON DELETE CASCADE,
    CONSTRAINT `FK_OrderDetailToppings_Toppings_ToppingId` FOREIGN KEY (`ToppingId`) REFERENCES `Toppings` (`ToppingId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE INDEX `IX_Addresses_UserId` ON `Addresses` (`UserId`);


CREATE INDEX `IX_cart_item_toppings_cart_item_id` ON `cart_item_toppings` (`cart_item_id`);


CREATE INDEX `IX_cart_item_toppings_topping_id` ON `cart_item_toppings` (`topping_id`);


CREATE INDEX `IX_CartItems_cart_id` ON `CartItems` (`cart_id`);


CREATE INDEX `IX_CartItems_product_id` ON `CartItems` (`product_id`);


CREATE INDEX `IX_CartItems_size_id` ON `CartItems` (`size_id`);


CREATE UNIQUE INDEX `IX_Carts_UserId` ON `Carts` (`UserId`);


CREATE INDEX `IX_Feedbacks_OrderDetailId` ON `Feedbacks` (`OrderDetailId`);


CREATE INDEX `IX_Feedbacks_ProductId` ON `Feedbacks` (`ProductId`);


CREATE INDEX `IX_Feedbacks_UserId` ON `Feedbacks` (`UserId`);


CREATE INDEX `IX_News_PublishedAt` ON `News` (`PublishedAt`);


CREATE UNIQUE INDEX `IX_News_Slug` ON `News` (`Slug`);


CREATE INDEX `IX_News_Status` ON `News` (`Status`);


CREATE INDEX `IX_News_UserId` ON `News` (`UserId`);


CREATE INDEX `IX_OrderDetails_OrderId` ON `OrderDetails` (`OrderId`);


CREATE INDEX `IX_OrderDetails_ProductId` ON `OrderDetails` (`ProductId`);


CREATE INDEX `IX_OrderDetails_SizeId` ON `OrderDetails` (`SizeId`);


CREATE INDEX `IX_OrderDetailToppings_OrderDetailId` ON `OrderDetailToppings` (`OrderDetailId`);


CREATE INDEX `IX_OrderDetailToppings_ToppingId` ON `OrderDetailToppings` (`ToppingId`);


CREATE INDEX `IX_Orders_AddressId` ON `Orders` (`AddressId`);


CREATE INDEX `IX_Orders_UserId` ON `Orders` (`UserId`);


CREATE INDEX `IX_Orders_VoucherId` ON `Orders` (`VoucherId`);


CREATE INDEX `IX_OrderStatusHistories_ChangedBy` ON `OrderStatusHistories` (`ChangedBy`);


CREATE INDEX `IX_OrderStatusHistories_OrderId` ON `OrderStatusHistories` (`OrderId`);


CREATE INDEX `IX_Payments_OrderId` ON `Payments` (`OrderId`);


CREATE UNIQUE INDEX `IX_Permissions_Code` ON `Permissions` (`Code`);


CREATE INDEX `IX_Products_CategoryId` ON `Products` (`CategoryId`);


CREATE INDEX `IX_ProductSizes_SizeId` ON `ProductSizes` (`SizeId`);


CREATE INDEX `IX_ProductToppings_ToppingId` ON `ProductToppings` (`ToppingId`);


CREATE INDEX `IX_RolePermissions_PermissionId` ON `RolePermissions` (`PermissionId`);


CREATE UNIQUE INDEX `IX_Roles_Name` ON `Roles` (`Name`);


CREATE INDEX `IX_UserRoles_RoleId` ON `UserRoles` (`RoleId`);


CREATE UNIQUE INDEX `IX_Users_Email` ON `Users` (`Email`);


CREATE UNIQUE INDEX `IX_Users_Username` ON `Users` (`Username`);


CREATE INDEX `IX_UserVouchers_VoucherId` ON `UserVouchers` (`VoucherId`);


CREATE UNIQUE INDEX `IX_Vouchers_Code` ON `Vouchers` (`Code`);



/* =====================================================================
   CAFESHOP - SEED DATA (MySQL 8.0+)
   ---------------------------------------------------------------------
   Dựa trên: "CafeShop — Tài liệu Cấu trúc Database (MySQL Seed Guide)"
   Theo các quyết định bạn đã xác nhận:
     1) OrderDetail.UnitPrice = (đơn giá 1 ly theo Size/Base) x Quantity
                                + tổng OrderDetailToppings của dòng đó
        => VD: Trà sữa M 40.000đ x2 ly + trân châu (5.000đ x1 x2 ly=10.000đ)
               => OrderDetail.UnitPrice = 80.000 + 10.000 = 90.000
        => Order.SubTotal (mỗi Order chỉ có 1 dòng trong seed này)
           = OrderDetail.UnitPrice tương ứng (KHÔNG cộng thêm topping
           lần nữa, vì đã nằm trong UnitPrice).
     2) Có seed Carts / CartItems / CartItemToppings (vài giỏ hàng active).
     3) Có seed ShippingConfigs (1 dòng mặc định) dù trước đó yêu cầu bỏ qua,
        vì tài liệu ghi đây là điều kiện bắt buộc để API tính ship chạy được.

   CÁC GIẢ ĐỊNH THÊM (mức rủi ro thấp, bạn có thể chỉnh lại nếu cần):
     - CartItem.UnitPrice: đọc theo nghĩa đen "giá tại thời điểm thêm vào giỏ"
       => chỉ là đơn giá 1 ly theo Size/Base, KHÔNG nhân Quantity, KHÔNG gồm
       topping (khác với OrderDetail). CartItemTopping.unit_price đúng theo
       công thức tài liệu ghi = Topping.Price x Quantity(topping), KHÔNG
       nhân với Quantity của CartItem.
     - Phí ship trong seed chỉ tính BaseFee + phụ phí theo km vượt +
       miễn phí khi đủ ngưỡng; KHÔNG áp phụ phí đêm/giờ cao điểm/cuối tuần
       để công thức đơn giản, dễ kiểm tra bằng tay. ShippingConfig vẫn có
       đủ các cột đó cho bạn dùng khi code thực tế tính toán.
     - Permissions: tài liệu chỉ đưa ra ví dụ, mình seed thêm 3 mã
       (VOUCHER_MANAGE, ROLE_MANAGE, SHIPPING_MANAGE) để Admin có đủ quyền
       thao tác Voucher/Role/ShippingConfig. Xoá nếu bạn không cần.
     - Mỗi Order trong seed chỉ có đúng 1 OrderDetail (để đơn giản hoá việc
       đảm bảo "mỗi sản phẩm đúng 5 feedback"). Thực tế đơn hàng có thể có
       nhiều dòng.
     - Yêu cầu MySQL 8.0.14+ (dùng Recursive CTE để sinh số 1..250).

   AN TOÀN CHẠY LẠI: script bọc trong 1 stored procedure có
   EXIT HANDLER FOR SQLEXCEPTION => lỗi ở bất kỳ đâu sẽ ROLLBACK toàn bộ,
   không để lại dữ liệu nửa vời. Chạy trên DB rỗng (đúng thứ tự bảng).
   ===================================================================== */

SET @PasswordHash = '$2a$11$9/wZ.5Y0a4Qk3tC/L32gL.N3lD6M2rC9hRj2yI1vK1j7N6F7bOQW2';

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_seed_cafeshop $$
CREATE PROCEDURE sp_seed_cafeshop()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    /* =====================  1. ROLES / PERMISSIONS  ===================== */
    INSERT INTO Roles (RoleId, Name, Description) VALUES
    (1, 'ADMIN', 'Quản trị viên toàn hệ thống'),
    (2, 'STAFF', 'Nhân viên cửa hàng'),
    (3, 'USER',  'Khách hàng thông thường');

    INSERT INTO Permissions (PermissionId, Code, Module, Description) VALUES
    (1,  'ORDER_VIEW',          'ORDER',    'Xem danh sách đơn hàng'),
    (2,  'ORDER_UPDATE_STATUS', 'ORDER',    'Cập nhật trạng thái đơn hàng'),
    (3,  'PRODUCT_VIEW',        'PRODUCT',  'Xem sản phẩm'),
    (4,  'PRODUCT_CREATE',      'PRODUCT',  'Tạo sản phẩm mới'),
    (5,  'PRODUCT_EDIT',        'PRODUCT',  'Chỉnh sửa sản phẩm'),
    (6,  'PRODUCT_DELETE',      'PRODUCT',  'Xóa sản phẩm'),
    (7,  'USER_VIEW',           'USER',     'Xem danh sách người dùng'),
    (8,  'USER_TOGGLE',         'USER',     'Khóa/Mở khóa tài khoản'),
    (9,  'NEWS_CREATE',         'NEWS',     'Tạo tin tức'),
    (10, 'NEWS_EDIT',           'NEWS',     'Chỉnh sửa tin tức'),
    (11, 'FEEDBACK_MODERATE',   'FEEDBACK', 'Ẩn/Hiện đánh giá'),
    (12, 'VOUCHER_MANAGE',      'VOUCHER',  'Quản lý voucher'),
    (13, 'ROLE_MANAGE',         'RBAC',     'Quản lý role & permission'),
    (14, 'SHIPPING_MANAGE',     'SHIPPING', 'Cấu hình vận chuyển');

    INSERT INTO RolePermissions (RoleId, PermissionId)
    SELECT 1, PermissionId FROM Permissions;               -- Admin: toàn quyền

    INSERT INTO RolePermissions (RoleId, PermissionId)
    SELECT 2, PermissionId FROM Permissions
    WHERE Code IN ('ORDER_VIEW','ORDER_UPDATE_STATUS','PRODUCT_VIEW','FEEDBACK_MODERATE');

    /* =====================  2. SIZES / CATEGORIES  ===================== */
    INSERT INTO Sizes (SizeId, Name) VALUES (1,'S'), (2,'M'), (3,'L');

    INSERT INTO Categories (CategoryId, Name, Description) VALUES
    (1,  'Cà phê',       'Cà phê pha máy và pha phin truyền thống'),
    (2,  'Trà trái cây', 'Trà kết hợp trái cây tươi, thanh mát'),
    (3,  'Trà sữa',      'Trà sữa các vị, topping đa dạng'),
    (4,  'Sinh tố',      'Sinh tố trái cây xay tươi'),
    (5,  'Đá xay',       'Đồ uống đá xay mát lạnh'),
    (6,  'Nước ép',      'Nước ép trái cây nguyên chất'),
    (7,  'Soda',         'Soda trái cây có gas'),
    (8,  'Bánh ngọt',    'Bánh ngọt ăn kèm đồ uống'),
    (9,  'Bánh mặn',     'Bánh mì, sandwich và bánh mặn'),
    (10, 'Đồ ăn nhẹ',    'Món ăn vặt tiện lợi');

    /* =====================  3. USERS / ROLES  ===================== */
    INSERT INTO Users (UserId, Username, PasswordHash, FullName, PhoneNumber, Email, IsActive, CreatedAt) VALUES
    (1,  'admin1',  @PasswordHash, 'Nguyễn Quốc Bảo',  '0901000001', 'admin1@cafeshop.vn',  1, '2026-01-01 08:00:00'),
    (2,  'admin2',  @PasswordHash, 'Trần Thị Thu Hà',  '0901000002', 'admin2@cafeshop.vn',  1, '2026-01-01 08:05:00'),
    (3,  'staff1',  @PasswordHash, 'Lê Minh Tuấn',     '0901000003', 'staff1@cafeshop.vn',  1, '2026-01-05 09:00:00'),
    (4,  'khach01', @PasswordHash, 'Phạm Ngọc Anh',    '0912000004', 'ngocanh@gmail.com',   1, '2026-02-10 10:00:00'),
    (5,  'khach02', @PasswordHash, 'Vũ Đức Thắng',     '0912000005', 'ducthang@gmail.com',  1, '2026-02-15 11:30:00'),
    (6,  'khach03', @PasswordHash, 'Đỗ Thùy Linh',     '0912000006', 'thuylinh@gmail.com',  1, '2026-03-01 14:00:00'),
    (7,  'khach04', @PasswordHash, 'Hoàng Gia Huy',    '0912000007', 'giahuy@gmail.com',    1, '2026-03-12 09:45:00'),
    (8,  'khach05', @PasswordHash, 'Bùi Khánh Vy',     '0912000008', 'khanhvy@gmail.com',   1, '2026-04-02 16:20:00'),
    (9,  'khach06', @PasswordHash, 'Ngô Thành Long',   '0912000009', 'thanhlong@gmail.com', 1, '2026-04-20 18:10:00'),
    (10, 'khach07', @PasswordHash, 'Đặng Mai Phương',  '0912000010', 'maiphuong@gmail.com', 1, '2026-05-05 08:30:00');

    INSERT INTO UserRoles (UserId, RoleId) VALUES
    (1,1),(2,1),(3,2),(4,3),(5,3),(6,3),(7,3),(8,3),(9,3),(10,3);

    /* =====================  4. TOPPINGS  ===================== */
    INSERT INTO Toppings (ToppingId, Name, Price, Unit, ImageUrl, StockQuantity, IsAvailable) VALUES
    (1,  'Trân châu đen',   8000,  'phần', 'https://picsum.photos/seed/topping1/400/400',  1000, 1),
    (2,  'Trân châu trắng', 8000,  'phần', 'https://picsum.photos/seed/topping2/400/400',  1000, 1),
    (3,  'Thạch dừa',       7000,  'phần', 'https://picsum.photos/seed/topping3/400/400',  1000, 1),
    (4,  'Thạch trái cây',  7000,  'phần', 'https://picsum.photos/seed/topping4/400/400',  1000, 1),
    (5,  'Pudding trứng',   10000, 'phần', 'https://picsum.photos/seed/topping5/400/400',  1000, 1),
    (6,  'Sương sáo',       6000,  'phần', 'https://picsum.photos/seed/topping6/400/400',  1000, 1),
    (7,  'Kem cheese',      12000, 'phần', 'https://picsum.photos/seed/topping7/400/400',  1000, 1),
    (8,  'Whipping cream',  8000,  'phần', 'https://picsum.photos/seed/topping8/400/400',  1000, 1),
    (9,  'Đào miếng',       10000, 'phần', 'https://picsum.photos/seed/topping9/400/400',  1000, 1),
    (10, 'Shot espresso',   10000, 'shot', 'https://picsum.photos/seed/topping10/400/400', 1000, 1);

    /* =====================  5. PRODUCTS (50)  =====================
       Category 1-7 = đồ uống (CÓ Size => StockQuantity Product = 0)
       Category 8-10 = đồ ăn   (KHÔNG Size => StockQuantity Product = tồn kho thật) */
    INSERT INTO Products (ProductId, CategoryId, Name, BasePrice, Description, IsAvailable, StockQuantity) VALUES
    (1,  1, 'Cà phê đen đá',             25000, 'Cà phê phin đậm vị, uống với đá',            1, 0),
    (2,  1, 'Cà phê sữa đá',             29000, 'Cà phê phin pha sữa đặc truyền thống',       1, 0),
    (3,  1, 'Bạc xỉu',                   32000, 'Nhiều sữa, ít cà phê, béo ngọt',              1, 0),
    (4,  1, 'Cappuccino',                45000, 'Espresso với sữa nóng và lớp foam dày',      1, 0),
    (5,  1, 'Latte',                     45000, 'Espresso và sữa tươi, vị dịu nhẹ',           1, 0),
    (6,  2, 'Trà đào cam sả',            42000, 'Trà đen, đào miếng, cam và sả tươi',         1, 0),
    (7,  2, 'Trà vải hoa hồng',          42000, 'Trà thơm hương hoa hồng cùng vải',           1, 0),
    (8,  2, 'Trà chanh mật ong',         35000, 'Chanh tươi và mật ong nguyên chất',          1, 0),
    (9,  2, 'Trà oolong dâu tây',        45000, 'Oolong thơm kết hợp dâu tây tươi',           1, 0),
    (10, 2, 'Trà nhiệt đới',             42000, 'Trà với dứa, xoài, chanh dây',               1, 0),
    (11, 3, 'Trà sữa trân châu đường đen', 40000, 'Trà sữa, trân châu nấu đường đen',         1, 0),
    (12, 3, 'Trà sữa truyền thống',      35000, 'Vị trà sữa cổ điển',                         1, 0),
    (13, 3, 'Trà sữa matcha',            45000, 'Matcha Nhật Bản kết hợp sữa',                1, 0),
    (14, 3, 'Trà sữa khoai môn',         42000, 'Khoai môn tím béo thơm',                     1, 0),
    (15, 3, 'Hồng trà sữa macchiato',    45000, 'Hồng trà sữa phủ lớp kem cheese',            1, 0),
    (16, 4, 'Sinh tố bơ',                45000, 'Bơ sáp xay mịn với sữa',                     1, 0),
    (17, 4, 'Sinh tố xoài',              40000, 'Xoài chín ngọt xay lạnh',                    1, 0),
    (18, 4, 'Sinh tố dâu',               42000, 'Dâu tươi xay cùng sữa chua',                 1, 0),
    (19, 4, 'Sinh tố chuối yến mạch',    38000, 'Chuối, yến mạch, mật ong',                   1, 0),
    (20, 4, 'Sinh tố việt quất',         48000, 'Việt quất và sữa chua',                       1, 0),
    (21, 5, 'Cookie đá xay',             52000, 'Bánh cookie xay cùng kem tươi',              1, 0),
    (22, 5, 'Matcha đá xay',             52000, 'Matcha đá xay phủ kem',                       1, 0),
    (23, 5, 'Cà phê đá xay',             50000, 'Cà phê đá xay béo mát',                       1, 0),
    (24, 5, 'Socola đá xay',             50000, 'Socola đậm vị đá xay',                        1, 0),
    (25, 5, 'Chanh tuyết',               42000, 'Chanh xay tuyết chua ngọt',                   1, 0),
    (26, 6, 'Nước ép cam',               38000, 'Cam vắt nguyên chất',                         1, 0),
    (27, 6, 'Nước ép dưa hấu',           35000, 'Dưa hấu ép mát lạnh',                          1, 0),
    (28, 6, 'Nước ép ổi',                35000, 'Ổi hồng ép giàu vitamin C',                    1, 0),
    (29, 6, 'Nước ép cà rốt táo',        38000, 'Cà rốt và táo ép tươi',                        1, 0),
    (30, 6, 'Nước ép cần tây táo',       40000, 'Cần tây, táo xanh, thanh lọc',                 1, 0),
    (31, 7, 'Soda chanh',                32000, 'Soda chanh tươi sảng khoái',                   1, 0),
    (32, 7, 'Soda việt quất',            38000, 'Soda vị việt quất',                            1, 0),
    (33, 7, 'Soda dâu',                  38000, 'Soda vị dâu tươi',                             1, 0),
    (34, 7, 'Soda bạc hà',               35000, 'Soda bạc hà mát lạnh',                         1, 0),
    (35, 7, 'Soda đào',                  38000, 'Soda vị đào ngọt nhẹ',                         1, 0),
    (36, 8, 'Tiramisu',                  45000, 'Bánh tiramisu cà phê mascarpone',              1, 100),
    (37, 8, 'Cheesecake chanh dây',      48000, 'Cheesecake béo mịn, chua nhẹ',                 1, 100),
    (38, 8, 'Red velvet',                50000, 'Bánh nhung đỏ kem phô mai',                    1, 100),
    (39, 8, 'Bánh su kem',               25000, 'Su kem nhân custard',                          1, 100),
    (40, 8, 'Bánh flan caramel',         20000, 'Flan mềm mịn với caramel',                      1, 100),
    (41, 9, 'Bánh mì que pate',          15000, 'Bánh mì que giòn nhân pate',                    1, 100),
    (42, 9, 'Bánh mì gà xé',             30000, 'Bánh mì nhân gà xé sốt mayo',                   1, 100),
    (43, 9, 'Sandwich jambon phô mai',   35000, 'Sandwich nướng jambon và phô mai',              1, 100),
    (44, 9, 'Bông lan trứng muối',       32000, 'Bông lan mềm, chà bông, trứng muối',            1, 100),
    (45, 9, 'Croissant phô mai',         38000, 'Croissant bơ nhân phô mai',                     1, 100),
    (46, 10,'Khoai tây chiên',           30000, 'Khoai tây chiên giòn',                          1, 100),
    (47, 10,'Gà viên chiên',             35000, 'Gà viên chiên xù',                              1, 100),
    (48, 10,'Bánh tráng trộn',           25000, 'Bánh tráng trộn đầy đủ topping',                1, 100),
    (49, 10,'Cơm cháy chà bông',         30000, 'Cơm cháy giòn, chà bông, mỡ hành',              1, 100),
    (50, 10,'Xúc xích nướng',            28000, 'Xúc xích nướng than',                           1, 100);

    UPDATE Products SET ImageUrl = CONCAT('https://picsum.photos/seed/product', ProductId, '/600/600');

    -- ProductSizes: chỉ đồ uống (CategoryId<=7). Price = làm tròn nghìn.
    INSERT INTO ProductSizes (ProductId, SizeId, Price, StockQuantity)
    SELECT p.ProductId, s.SizeId,
           ROUND(p.BasePrice * (1 + (CASE s.SizeId WHEN 1 THEN 0 WHEN 2 THEN 15 ELSE 30 END) / 100.0) / 1000.0, 0) * 1000,
           300
    FROM Products p CROSS JOIN Sizes s
    WHERE p.CategoryId <= 7;

    -- ProductToppings: Cà phê/Trà/Trà sữa (1-3) dùng cả 10 topping;
    -- Sinh tố/Đá xay/Nước ép/Soda (4-7) dùng topping 1-6.
    INSERT INTO ProductToppings (ProductId, ToppingId)
    SELECT p.ProductId, t.ToppingId
    FROM Products p CROSS JOIN Toppings t
    WHERE (p.CategoryId BETWEEN 1 AND 3)
       OR (p.CategoryId BETWEEN 4 AND 7 AND t.ToppingId <= 6);

    /* =====================  6. VOUCHERS  ===================== */
    -- UsageLimit = 0 nghĩa là KHÔNG giới hạn (theo tài liệu)
    INSERT INTO Vouchers (VoucherId, Code, Description, TargetType, ApplyType, DiscountType,
        DiscountValue, MinOrderValue, MaxDiscountAmount, StartDate, EndDate, UsageLimit, UsedCount, IsActive) VALUES
    (1,  'WELCOME10',  'Giảm 10% đơn hàng, tối đa 30k',   'PUBLIC', 'ORDER',    'PERCENTAGE', 10, 50000,  30000, '2026-01-01', '2026-12-31', 1000, 0,   1),
    (2,  'GIAM20K',    'Giảm 20k cho đơn từ 100k',        'PUBLIC', 'ORDER',    'FIXED',      20000, 100000, 20000, '2026-01-01', '2026-12-31', 500,  0,   1),
    (3,  'FREESHIP',   'Giảm 15k phí ship, đơn từ 50k',   'PUBLIC', 'SHIPPING', 'FIXED',      15000, 50000,  15000, '2026-01-01', '2026-12-31', 800,  0,   1),
    (4,  'SHIP50',     'Giảm 50% phí ship, không giới hạn lượt', 'PUBLIC', 'SHIPPING', 'PERCENTAGE', 50, 0, 10000, '2026-09-01', '2026-12-31', 0,    0,   1),
    (5,  'WEEKEND15',  'Giảm 15% cuối tuần, đơn từ 80k',  'PUBLIC', 'ORDER',    'PERCENTAGE', 15, 80000,  30000, '2026-09-01', '2026-12-31', 200,  0,   1),
    (6,  NULL,         'VIP20 - Ưu đãi riêng giảm 20%, đơn từ 150k', 'USER', 'ORDER', 'PERCENTAGE', 20, 150000, 50000, '2026-09-01', '2026-12-31', 50, 0, 1),
    (7,  NULL,         'BIRTHDAY30 - Quà sinh nhật giảm 30k riêng', 'USER', 'ORDER', 'FIXED',   30000, 0, 30000, '2026-01-01', '2026-12-31', 50,   0,   1),
    (8,  'TET2025',    'Voucher Tết 2025 (đã hết hạn)',   'PUBLIC', 'ORDER',    'PERCENTAGE', 25, 100000, 40000, '2025-01-15', '2025-02-15', 300,  212, 1),
    (9,  'HETLUOT',    'Voucher đã hết lượt sử dụng',     'PUBLIC', 'ORDER',    'FIXED',      10000, 50000,  10000, '2026-01-01', '2026-12-31', 100,  100, 1),
    (10, 'TAMDUNG',    'Voucher đang tạm ngưng',          'PUBLIC', 'ORDER',    'PERCENTAGE', 5, 0,      15000, '2026-01-01', '2026-12-31', 100,  0,   0);

    -- Voucher riêng tư (TargetType=USER, Code NULL) phải phát qua UserVouchers
    INSERT INTO UserVouchers (UserId, VoucherId, UsageLimitPerUser, UsedCount, AssignedDate) VALUES
    (4, 6, 1, 0, '2026-09-01 09:00:00'),
    (5, 6, 1, 0, '2026-09-01 09:00:00'),
    (6, 7, 1, 0, '2026-09-10 09:00:00'),
    (8, 7, 1, 0, '2026-09-15 09:00:00');

    /* =====================  7. ADDRESSES  ===================== */
    -- AddressId = UserId - 3 (mỗi khách 1 địa chỉ mặc định)
    INSERT INTO Addresses (AddressId, UserId, RecipientName, Phone, FullAddress, IsDefault, IsDeleted, Latitude, Longitude, CreatedAt) VALUES
    (1, 4,  'Phạm Ngọc Anh',   '0912000004', '25 Tây Sơn, Đống Đa, Hà Nội',           1, 0, 21.0075, 105.8231, '2026-02-10 10:05:00'),
    (2, 5,  'Vũ Đức Thắng',    '0912000005', '102 Cầu Giấy, Cầu Giấy, Hà Nội',        1, 0, 21.0333, 105.7950, '2026-02-15 11:35:00'),
    (3, 6,  'Đỗ Thùy Linh',    '0912000006', '7 Láng Hạ, Đống Đa, Hà Nội',            1, 0, 21.0158, 105.8121, '2026-03-01 14:05:00'),
    (4, 7,  'Hoàng Gia Huy',   '0912000007', '61 Trần Duy Hưng, Cầu Giấy, Hà Nội',    1, 0, 21.0086, 105.7987, '2026-03-12 09:50:00'),
    (5, 8,  'Bùi Khánh Vy',    '0912000008', '33 Giảng Võ, Ba Đình, Hà Nội',          1, 0, 21.0265, 105.8210, '2026-04-02 16:25:00'),
    (6, 9,  'Ngô Thành Long',  '0912000009', '19 Phố Huế, Hai Bà Trưng, Hà Nội',      1, 0, 21.0150, 105.8490, '2026-04-20 18:15:00'),
    (7, 10, 'Đặng Mai Phương', '0912000010', '54 Nguyễn Chí Thanh, Đống Đa, Hà Nội',  1, 0, 21.0230, 105.8085, '2026-05-05 08:35:00');

    /* =====================  8. CARTS (đang active, chưa checkout)  =====================
       CartItem.UnitPrice = đơn giá 1 ly (Size/Base), KHÔNG nhân Quantity, KHÔNG gồm topping.
       CartItemTopping.unit_price = Topping.Price x Quantity(topping) -- đúng công thức tài liệu,
       KHÔNG nhân với Quantity của CartItem (khác quy ước của OrderDetail). */
    INSERT INTO Carts (CartId, UserId, Status, CreatedAt, UpdatedAt) VALUES
    (1, 4, 'ACTIVE', '2026-09-28 08:00:00', '2026-09-28 08:10:00'),
    (2, 5, 'ACTIVE', '2026-09-28 09:00:00', '2026-09-28 09:05:00'),
    (3, 9, 'ACTIVE', '2026-09-28 10:00:00', '2026-09-28 10:00:00');

    INSERT INTO CartItems (cart_item_id, cart_id, product_id, size_id, quantity, unit_price) VALUES
    (1, 1, 11, 2, 2,
        (SELECT Price FROM ProductSizes WHERE ProductId = 11 AND SizeId = 2)),   -- Trà sữa trân châu đường đen, size M
    (2, 2, 6,  1, 1,
        (SELECT Price FROM ProductSizes WHERE ProductId = 6  AND SizeId = 1)),   -- Trà đào cam sả, size S
    (3, 2, 42, NULL, 2,
        (SELECT BasePrice FROM Products WHERE ProductId = 42)),                 -- Bánh mì gà xé, không size
    (4, 3, 22, 3, 1,
        (SELECT Price FROM ProductSizes WHERE ProductId = 22 AND SizeId = 3));  -- Matcha đá xay, size L

    INSERT INTO cart_item_toppings (cart_item_topping_id, cart_item_id, topping_id, Quantity, unit_price) VALUES
    (1, 1, 1, 1, (SELECT Price FROM Toppings WHERE ToppingId = 1) * 1),   -- Trân châu đen
    (2, 4, 7, 1, (SELECT Price FROM Toppings WHERE ToppingId = 7) * 1);  -- Kem cheese

    /* =====================  9. SHIPPING CONFIG (1 dòng bắt buộc)  ===================== */
    INSERT INTO ShippingConfigs (Id, BaseFee, BaseDistanceKm, ExtraFeePerKm, MaxDistanceKm,
        IsFreeShippingEnabled, FreeShippingThreshold, NightSurcharge, NightHourStart, NightHourEnd,
        PeakHourSurcharge, PeakHourStart, PeakHourEnd, WeekendSurcharge) VALUES
    (1, 5000, 5.0, 2000, 10.0, 1, 200000, 2000, 22, 6, 0, 11, 13, 3000);

    /* =====================  10. NEWS (10)  ===================== */
    INSERT INTO News (UserId, Title, Slug, Summary, Content, ImageUrl, Status, ScheduledPublishAt, PublishedAt, CreatedAt, UpdatedAt, IsDeleted, ViewCount) VALUES
    (1, 'CafeShop khai trương chi nhánh mới tại Cầu Giấy', 'cafeshop-khai-truong-chi-nhanh-cau-giay',
        'Chi nhánh thứ hai chính thức mở cửa với nhiều ưu đãi.',
        'CafeShop hân hạnh thông báo khai trương chi nhánh mới tại Cầu Giấy. Trong tuần đầu tiên, khách hàng được giảm 20% toàn bộ thực đơn.',
        'https://picsum.photos/seed/news1/800/450', 'PUBLISHED', NULL, '2026-08-01 08:00:00', '2026-07-30 10:00:00', NULL, 0, 1520),
    (1, 'Ra mắt dòng trà trái cây mùa hè', 'ra-mat-dong-tra-trai-cay-mua-he',
        'Bộ sưu tập trà trái cây thanh mát cho mùa nóng.',
        'Từ ngày 1/6, CafeShop giới thiệu 5 món trà trái cây mới sử dụng nguyên liệu tươi mỗi ngày.',
        'https://picsum.photos/seed/news2/800/450', 'PUBLISHED', NULL, '2026-06-01 08:00:00', '2026-05-28 09:00:00', NULL, 0, 980),
    (2, 'Cách chọn hạt cà phê ngon tại nhà', 'cach-chon-hat-ca-phe-ngon-tai-nha',
        'Mẹo nhỏ giúp bạn chọn được hạt cà phê phù hợp khẩu vị.',
        'Hạt Arabica thiên về vị chua thanh, Robusta đậm và đắng. Hãy chọn loại rang vừa để cân bằng hương vị.',
        'https://picsum.photos/seed/news3/800/450', 'PUBLISHED', NULL, '2026-06-15 09:00:00', '2026-06-14 15:00:00', NULL, 0, 742),
    (2, 'Ưu đãi WELCOME10 dành cho khách hàng mới', 'uu-dai-welcome10-khach-hang-moi',
        'Nhập mã WELCOME10 để giảm 10% cho đơn hàng đầu tiên.',
        'Áp dụng cho mọi đơn hàng, giảm tối đa 30.000đ. Chương trình kéo dài đến hết năm 2026.',
        'https://picsum.photos/seed/news4/800/450', 'PUBLISHED', NULL, '2026-01-05 08:00:00', '2026-01-04 16:00:00', NULL, 0, 2310),
    (1, 'Thực đơn bánh ngọt mới: Tiramisu và Cheesecake', 'thuc-don-banh-ngot-moi-tiramisu-cheesecake',
        'Hai món bánh ngọt được yêu thích nhất vừa được nâng cấp công thức.',
        'Bánh được làm mới mỗi ngày bởi đội ngũ bếp bánh của CafeShop, kết hợp hoàn hảo với cà phê.',
        'https://picsum.photos/seed/news5/800/450', 'PUBLISHED', NULL, '2026-07-10 08:00:00', '2026-07-09 11:00:00', '2026-07-09 14:00:00', 0, 655),
    (3, 'Thông báo lịch làm việc dịp Quốc khánh 2/9', 'thong-bao-lich-lam-viec-quoc-khanh',
        'Quán hoạt động bình thường trong dịp lễ.',
        'CafeShop mở cửa từ 7h đến 22h trong các ngày nghỉ lễ 1/9 - 4/9. Rất mong được phục vụ quý khách.',
        'https://picsum.photos/seed/news6/800/450', 'PUBLISHED', NULL, '2026-08-28 08:00:00', '2026-08-27 17:00:00', NULL, 0, 430),
    (1, 'Chương trình khách hàng thân thiết VIP', 'chuong-trinh-khach-hang-than-thiet-vip',
        'Tích lũy đơn hàng để nhận voucher VIP20 giảm 20%.',
        'Khách hàng VIP sẽ nhận các voucher riêng, ưu đãi sinh nhật và quyền đặt món sớm.',
        'https://picsum.photos/seed/news7/800/450', 'PUBLISHED', NULL, '2026-09-01 08:00:00', '2026-08-31 10:00:00', NULL, 0, 512),
    (2, 'Bí quyết pha trà sữa trân châu đường đen', 'bi-quyet-pha-tra-sua-tran-chau-duong-den',
        'Bí quyết nấu trân châu dẻo dai, thơm đường đen.',
        'Trân châu được nấu và ủ đường đen mỗi 4 tiếng để giữ độ dẻo và hương vị tốt nhất.',
        'https://picsum.photos/seed/news8/800/450', 'DRAFT', NULL, NULL, '2026-09-20 13:00:00', NULL, 0, 0),
    (1, 'Sự kiện Trung thu: Mua 2 tặng 1', 'su-kien-trung-thu-mua-2-tang-1',
        'Đón Trung thu cùng CafeShop với ưu đãi hấp dẫn.',
        'Mua 2 đồ uống bất kỳ tặng 1 bánh su kem trong các ngày từ 25/9 đến 29/9.',
        'https://picsum.photos/seed/news9/800/450', 'SCHEDULED', '2026-10-01 08:00:00', NULL, '2026-09-25 10:00:00', NULL, 0, 0),
    (2, 'Bài viết cũ đã xóa: khuyến mãi tháng 3', 'bai-viet-cu-khuyen-mai-thang-3',
        'Bài viết đã được gỡ khỏi trang.',
        'Nội dung khuyến mãi tháng 3 đã hết hạn.',
        'https://picsum.photos/seed/news10/800/450', 'PUBLISHED', NULL, '2026-03-01 08:00:00', '2026-02-28 10:00:00', '2026-04-01 09:00:00', 1, 120);

    /* =====================  11. ORDERS + DETAILS + TOPPINGS + HISTORY + PAYMENTS + FEEDBACK  =====================
       250 đơn (5 đơn / mỗi 1 trong 50 sản phẩm), đều CurrentStatus = COMPLETED,
       PaymentStatus = Paid, có 1 Payment 'success' tương ứng, và 1 Feedback / OrderDetail. */

    -- Sinh dãy số 1..250
    CREATE TEMPORARY TABLE tmp_numbers (n INT PRIMARY KEY);
    INSERT INTO tmp_numbers (n)
    WITH RECURSIVE seq AS (
        SELECT 1 AS n
        UNION ALL
        SELECT n + 1 FROM seq WHERE n < 250
    )
    SELECT n FROM seq;

    CREATE TEMPORARY TABLE tmp_orders (
        n INT PRIMARY KEY,
        UserId INT, AddressId INT, ProductId INT, SizeId INT NULL, Qty INT,
        UnitPricePerCup DECIMAL(18,2), ToppingId INT NULL, ToppingQty INT NULL, ToppingUnitPriceRaw DECIMAL(18,2) NULL,
        ToppingLineTotal DECIMAL(18,2) NULL, DetailUnitPrice DECIMAL(18,2),
        DistanceKm DOUBLE, ShippingFee DECIMAL(18,2),
        VoucherId INT NULL, OrderDiscount DECIMAL(18,2), ShippingDiscount DECIMAL(18,2),
        SubTotal DECIMAL(18,2), TotalAmount DECIMAL(18,2),
        OrderDate DATETIME, PaymentMethod VARCHAR(20)
    );

    INSERT INTO tmp_orders (n, UserId, AddressId, ProductId, SizeId, Qty, ToppingId, ToppingQty, DistanceKm, OrderDate, PaymentMethod)
    SELECT
        num.n,
        4 + ((num.n - 1) % 7)                                        AS UserId,
        1 + ((num.n - 1) % 7)                                        AS AddressId,
        p.ProductId,
        CASE WHEN p.CategoryId <= 7 THEN 1 + (num.n % 3) END         AS SizeId,
        1 + ((num.n DIV 3) % 3)                                      AS Qty,
        CASE WHEN p.CategoryId <= 7 AND num.n % 2 = 0 THEN 1 + (num.n % 6) END AS ToppingId,
        CASE WHEN p.CategoryId <= 7 AND num.n % 2 = 0 THEN 1 + (num.n % 2) END AS ToppingQty,
        1.0 + (num.n % 9) + 0.5                                      AS DistanceKm,
        DATE_SUB('2026-09-27 18:00:00', INTERVAL num.n * 300 MINUTE) AS OrderDate,
        CASE num.n % 3 WHEN 0 THEN 'COD' WHEN 1 THEN 'MOMO' ELSE 'VNPAY' END AS PaymentMethod
    FROM tmp_numbers num
    JOIN Products p ON p.ProductId = ((num.n - 1) DIV 5) + 1;

    -- Đơn giá 1 ly + giá topping thô
    UPDATE tmp_orders t
    JOIN Products p ON p.ProductId = t.ProductId
    LEFT JOIN ProductSizes ps ON ps.ProductId = t.ProductId AND ps.SizeId = t.SizeId
    SET t.UnitPricePerCup = CASE WHEN t.SizeId IS NULL THEN p.BasePrice ELSE ps.Price END;

    UPDATE tmp_orders t
    JOIN Toppings tp ON tp.ToppingId = t.ToppingId
    SET t.ToppingUnitPriceRaw = tp.Price
    WHERE t.ToppingId IS NOT NULL;

    -- OrderDetailTopping.UnitPrice = ToppingPrice x Qty(topping) x SốLy  (theo xác nhận của bạn)
    UPDATE tmp_orders
    SET ToppingLineTotal = ToppingUnitPriceRaw * ToppingQty * Qty
    WHERE ToppingId IS NOT NULL;

    -- OrderDetail.UnitPrice = (đơn giá x SL) + tổng topping của dòng
    UPDATE tmp_orders
    SET DetailUnitPrice = (UnitPricePerCup * Qty) + IFNULL(ToppingLineTotal, 0);

    -- SubTotal đơn hàng = DetailUnitPrice (mỗi đơn 1 dòng trong seed này)
    UPDATE tmp_orders SET SubTotal = DetailUnitPrice;

    -- Phí ship: BaseFee 5.000đ cho 5km đầu, +2.000đ/km vượt, freeship từ 200.000đ
    -- (KHÔNG cộng phụ phí đêm/giờ cao điểm/cuối tuần trong seed này)
    UPDATE tmp_orders
    SET ShippingFee = CASE
        WHEN SubTotal >= 200000 THEN 0
        ELSE 5000 + CASE WHEN DistanceKm > 5 THEN CEIL(DistanceKm - 5) * 2000 ELSE 0 END
    END;

    -- Gán voucher: 1=WELCOME10, 2=GIAM20K, 3=FREESHIP (public);
    -- 7=BIRTHDAY30 riêng cho user 6/8 (minOrder=0 nên không cần điều kiện ngưỡng)
    UPDATE tmp_orders
    SET VoucherId = CASE
        WHEN n % 25 = 0 THEN 1
        WHEN n % 20 = 0 AND SubTotal >= 50000 THEN 3
        WHEN n % 17 = 0 AND SubTotal >= 100000 THEN 2
        WHEN UserId IN (6, 8) AND n % 19 = 0 THEN 7
        ELSE NULL
    END;

    UPDATE tmp_orders
    SET OrderDiscount = CASE VoucherId
            WHEN 1 THEN LEAST(SubTotal * 0.10, 30000)
            WHEN 2 THEN 20000
            WHEN 7 THEN 30000
            ELSE 0
        END,
        ShippingDiscount = CASE VoucherId
            WHEN 3 THEN LEAST(ShippingFee, 15000)
            ELSE 0
        END;

    UPDATE tmp_orders
    SET TotalAmount = SubTotal - OrderDiscount + ShippingFee - ShippingDiscount;

    -- Override 1 đơn để demo voucher VIP20 (id=6, minOrder=150.000, riêng cho User 4)
    -- Product 38 = Red velvet (50.000đ, không Size) => 50.000 x 3 = 150.000 (đủ ngưỡng)
    UPDATE tmp_orders
    SET UserId = 4, AddressId = 1, Qty = 3, ToppingId = NULL, ToppingQty = NULL,
        ToppingUnitPriceRaw = NULL, ToppingLineTotal = NULL,
        DetailUnitPrice = 50000 * 3, SubTotal = 50000 * 3,
        DistanceKm = 3.0, ShippingFee = 5000,
        VoucherId = 6, OrderDiscount = LEAST(50000 * 3 * 0.20, 50000), ShippingDiscount = 0
    WHERE ProductId = 38 ORDER BY n ASC LIMIT 1;

    UPDATE tmp_orders
    SET TotalAmount = SubTotal - OrderDiscount + ShippingFee - ShippingDiscount
    WHERE VoucherId = 6;

    -- Orders (snapshot địa chỉ lấy tại thời điểm insert, join Addresses theo UserId/AddressId đã override)
    INSERT INTO Orders (OrderId, UserId, AddressId, RecipientName, Phone, FullAddress, OrderDate,
        SubTotal, OrderDiscount, ShippingFee, ShippingDiscount, TotalAmount, DistanceKm,
        PaymentMethod, PaymentStatus, CurrentStatus, Note, VoucherId)
    SELECT t.n, t.UserId, t.AddressId, a.RecipientName, a.Phone, a.FullAddress, t.OrderDate,
           t.SubTotal, t.OrderDiscount, t.ShippingFee, t.ShippingDiscount, t.TotalAmount, t.DistanceKm,
           t.PaymentMethod, 'Paid', 'COMPLETED',
           CASE WHEN t.n % 6 = 0 THEN 'Ít đá, ít đường' WHEN t.n % 11 = 0 THEN 'Giao giờ hành chính giúp mình' END,
           t.VoucherId
    FROM tmp_orders t
    JOIN Addresses a ON a.AddressId = t.AddressId AND a.UserId = t.UserId;

    INSERT INTO OrderDetails (OrderDetailId, OrderId, ProductId, SizeId, Quantity, UnitPrice, Note)
    SELECT n, n, ProductId, SizeId, Qty, DetailUnitPrice, NULL FROM tmp_orders;

    INSERT INTO OrderDetailToppings (OrderDetailId, ToppingId, Quantity, UnitPrice)
    SELECT n, ToppingId, ToppingQty, ToppingLineTotal FROM tmp_orders WHERE ToppingId IS NOT NULL;

    -- Lịch sử trạng thái: PENDING -> CONFIRMED -> PREPARING -> DELIVERING -> COMPLETED
    INSERT INTO OrderStatusHistories (OrderId, Status, ChangedBy, ChangedAt, Note)
    SELECT t.n, h.Status,
           CASE WHEN h.Step = 1 THEN t.UserId ELSE 3 END,   -- bước 1 do khách tạo, còn lại do staff1
           DATE_ADD(t.OrderDate, INTERVAL h.OffsetMin MINUTE),
           h.Note
    FROM tmp_orders t
    CROSS JOIN (
        SELECT 1 AS Step, 'PENDING'    AS Status, 0  AS OffsetMin, 'Khách đặt hàng'          AS Note
        UNION ALL SELECT 2, 'CONFIRMED', 5,  'Quán đã tiếp nhận đơn'
        UNION ALL SELECT 3, 'PREPARING', 15, 'Đang pha chế'
        UNION ALL SELECT 4, 'DELIVERING',30, 'Đang giao hàng'
        UNION ALL SELECT 5, 'COMPLETED', 55, 'Giao thành công'
    ) h;

    -- Payments: 1 giao dịch 'success' / đơn, khớp TotalAmount, PaidAt = lúc hoàn thành (OrderDate+55p)
    INSERT INTO Payments (OrderId, PaymentMethod, PaymentProvider, TransactionCode, Amount, PaymentStatus, PaidAt, ErrorMessage, CreatedAt)
    SELECT n, PaymentMethod,
           CASE PaymentMethod WHEN 'MOMO' THEN 'MoMo' WHEN 'VNPAY' THEN 'VNPay' ELSE NULL END,
           CONCAT('TXN', LPAD(n, 8, '0')),
           TotalAmount, 'success',
           DATE_ADD(OrderDate, INTERVAL 55 MINUTE), NULL,
           DATE_ADD(OrderDate, INTERVAL 55 MINUTE)
    FROM tmp_orders;

    -- Feedback: 1 / OrderDetail => đúng 5 / sản phẩm
    CREATE TEMPORARY TABLE tmp_comments (Rating INT, Idx INT, Txt VARCHAR(300));
    INSERT INTO tmp_comments VALUES
    (2,0,'Đồ uống hơi nhạt, mong quán cải thiện thêm.'),
    (2,1,'Giao hơi lâu, món đến nơi không còn lạnh.'),
    (2,2,'Vị chưa đúng ý mình lắm.'),
    (3,0,'Tạm ổn, giá hơi cao so với khẩu phần.'),
    (3,1,'Bình thường, có thể thử lại lần sau.'),
    (3,2,'Món ổn nhưng đóng gói chưa được gọn.'),
    (4,0,'Ngon, đúng vị, giao nhanh.'),
    (4,1,'Rất ổn, sẽ ủng hộ quán tiếp.'),
    (4,2,'Món ngon, nhân viên nhiệt tình.'),
    (5,0,'Tuyệt vời! Ngon hơn mong đợi, sẽ đặt lại.'),
    (5,1,'Rất thơm ngon, đóng gói cẩn thận.'),
    (5,2,'Quá đỉnh, cả nhà ai cũng khen.');

    INSERT INTO Feedbacks (ProductId, UserId, OrderDetailId, Rating, Comment, CreatedAt, IsVisible)
    SELECT r.ProductId, r.UserId, r.n, r.Rating, c.Txt,
           DATE_ADD(DATE_ADD(r.OrderDate, INTERVAL 55 MINUTE), INTERVAL (2 + (r.n % 20)) HOUR),
           CASE WHEN r.Rating = 2 THEN 0 ELSE 1 END   -- ví dụ: feedback 2 sao bị ẩn chờ admin xử lý
    FROM (
        SELECT n, UserId, ProductId, OrderDate,
               CASE
                   WHEN ((n * 37 + (n DIV 5) * 11) % 10) = 0 THEN 2
                   WHEN ((n * 37 + (n DIV 5) * 11) % 10) IN (1,2) THEN 3
                   WHEN ((n * 37 + (n DIV 5) * 11) % 10) IN (3,4,5) THEN 4
                   ELSE 5
               END AS Rating
        FROM tmp_orders
    ) r
    JOIN tmp_comments c ON c.Rating = r.Rating AND c.Idx = r.n % 3;

    /* ---- Đồng bộ tồn kho & lượt dùng voucher theo các đơn đã bán ---- */
    -- Đồ ăn KHÔNG size: trừ trực tiếp Products.StockQuantity
    UPDATE Products p
    JOIN (SELECT ProductId, SUM(Qty) AS Sold FROM tmp_orders GROUP BY ProductId) x ON x.ProductId = p.ProductId
    SET p.StockQuantity = p.StockQuantity - x.Sold
    WHERE p.CategoryId > 7;

    -- Đồ uống CÓ size: trừ ProductSizes.StockQuantity (Products.StockQuantity giữ nguyên = 0)
    UPDATE ProductSizes ps
    JOIN (SELECT ProductId, SizeId, SUM(Qty) AS Sold FROM tmp_orders WHERE SizeId IS NOT NULL GROUP BY ProductId, SizeId) x
      ON x.ProductId = ps.ProductId AND x.SizeId = ps.SizeId
    SET ps.StockQuantity = ps.StockQuantity - x.Sold;

    UPDATE Toppings t
    JOIN (SELECT ToppingId, SUM(ToppingQty * Qty) AS Sold FROM tmp_orders WHERE ToppingId IS NOT NULL GROUP BY ToppingId) x
      ON x.ToppingId = t.ToppingId
    SET t.StockQuantity = t.StockQuantity - x.Sold;

    UPDATE Vouchers v
    JOIN (SELECT VoucherId, COUNT(*) AS Cnt FROM tmp_orders WHERE VoucherId IS NOT NULL GROUP BY VoucherId) x
      ON x.VoucherId = v.VoucherId
    SET v.UsedCount = v.UsedCount + x.Cnt;

    UPDATE UserVouchers uv
    JOIN (SELECT UserId, VoucherId, COUNT(*) AS Cnt FROM tmp_orders WHERE VoucherId IN (6,7) GROUP BY UserId, VoucherId) x
      ON x.UserId = uv.UserId AND x.VoucherId = uv.VoucherId
    SET uv.UsedCount = uv.UsedCount + x.Cnt;

    DROP TEMPORARY TABLE tmp_orders;
    DROP TEMPORARY TABLE tmp_numbers;
    DROP TEMPORARY TABLE tmp_comments;

    COMMIT;
END $$

DELIMITER ;

CALL sp_seed_cafeshop();
DROP PROCEDURE sp_seed_cafeshop;

/* ---- Kiểm tra nhanh sau khi chạy ----
SELECT COUNT(*) AS TotalProducts FROM Products;                                 -- 50
SELECT ProductId, COUNT(*) AS FeedbackCount FROM Feedbacks GROUP BY ProductId;  -- mỗi SP = 5
SELECT CurrentStatus, COUNT(*) FROM Orders GROUP BY CurrentStatus;             -- COMPLETED = 250
SELECT PaymentStatus, COUNT(*) FROM Payments GROUP BY PaymentStatus;           -- success = 250
SELECT * FROM Orders WHERE VoucherId = 6;                                      -- đơn demo VIP20
*/
