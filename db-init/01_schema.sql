SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;

ALTER DATABASE CHARACTER SET utf8mb4;

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

CREATE TABLE `StoreProfiles` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `StoreName` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `Hotline` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `FullAddress` varchar(500) CHARACTER SET utf8mb4 NOT NULL,
    `Latitude` double NOT NULL,
    `Longitude` double NOT NULL,
    `IsAcceptingOrders` tinyint(1) NOT NULL,
    `IsRealtimeNotificationEnabled` tinyint(1) NOT NULL,
    `IsMaintenanceMode` tinyint(1) NOT NULL,
    `OpenTime` time(6) NOT NULL,
    `CloseTime` time(6) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_StoreProfiles` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Toppings` (
    `ToppingId` int NOT NULL AUTO_INCREMENT,
    `Name` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `Price` decimal(18,2) NULL,
    `Unit` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `ImageUrl` varchar(500) CHARACTER SET utf8mb4 NULL,
    `StockQuantity` int NOT NULL,
    `IsAvailable` tinyint(1) NOT NULL,
    CONSTRAINT `PK_Toppings` PRIMARY KEY (`ToppingId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Users` (
    `UserId` int NOT NULL AUTO_INCREMENT,
    `Username` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `PasswordHash` longtext CHARACTER SET utf8mb4 NOT NULL,
    `FullName` varchar(100) CHARACTER SET utf8mb4 NULL,
    `PhoneNumber` varchar(20) CHARACTER SET utf8mb4 NULL,
    `Email` varchar(100) CHARACTER SET utf8mb4 NULL,
    `AvatarUrl` varchar(500) CHARACTER SET utf8mb4 NULL,
    `AvatarPublicId` varchar(100) CHARACTER SET utf8mb4 NULL,
    `RefreshToken` varchar(255) CHARACTER SET utf8mb4 NULL,
    `RefreshTokenExpiryTime` datetime(6) NULL,
    `IsActive` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    CONSTRAINT `PK_Users` PRIMARY KEY (`UserId`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Vouchers` (
    `VoucherId` int NOT NULL AUTO_INCREMENT,
    `Code` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `Description` varchar(500) CHARACTER SET utf8mb4 NOT NULL,
    `TargetType` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `ApplyType` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `DiscountType` varchar(20) CHARACTER SET utf8mb4 NULL,
    `DiscountValue` decimal(18,2) NOT NULL,
    `MinOrderValue` decimal(18,2) NOT NULL,
    `MaxDiscountAmount` decimal(18,2) NOT NULL,
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
    `BasePrice` decimal(18,2) NOT NULL,
    `ImageUrl` varchar(500) CHARACTER SET utf8mb4 NULL,
    `ImagePublicId` varchar(100) CHARACTER SET utf8mb4 NULL,
    `Description` varchar(1000) CHARACTER SET utf8mb4 NULL,
    `IsAvailable` tinyint(1) NOT NULL,
    `IsDeleted` tinyint(1) NOT NULL,
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
    `SubTotal` decimal(18,2) NOT NULL,
    `TotalAmount` decimal(18,2) NOT NULL,
    `PaymentMethod` varchar(50) CHARACTER SET utf8mb4 NULL,
    `PaymentStatus` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `CurrentStatus` varchar(50) CHARACTER SET utf8mb4 NULL,
    `Note` varchar(500) CHARACTER SET utf8mb4 NULL,
    `VoucherId` int NULL,
    `OrderDiscount` decimal(18,2) NOT NULL,
    `ShippingDiscount` decimal(18,2) NOT NULL,
    `ShippingFee` decimal(18,2) NOT NULL,
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
    `UpdatedAt` datetime(6) NULL,
    `IsVisible` tinyint(1) NOT NULL DEFAULT TRUE,
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

CREATE TABLE `FeedbackImages` (
    `FeedbackImageId` int NOT NULL AUTO_INCREMENT,
    `FeedbackId` int NOT NULL,
    `ImageUrl` longtext CHARACTER SET utf8mb4 NOT NULL,
    `ImagePublicId` longtext CHARACTER SET utf8mb4 NULL,
    `CreatedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_FeedbackImages` PRIMARY KEY (`FeedbackImageId`),
    CONSTRAINT `FK_FeedbackImages_Feedbacks_FeedbackId` FOREIGN KEY (`FeedbackId`) REFERENCES `Feedbacks` (`FeedbackId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `FeedbackReplies` (
    `FeedbackReplyId` int NOT NULL AUTO_INCREMENT,
    `FeedbackId` int NOT NULL,
    `AdminUserId` int NOT NULL,
    `ReplyContent` longtext CHARACTER SET utf8mb4 NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    CONSTRAINT `PK_FeedbackReplies` PRIMARY KEY (`FeedbackReplyId`),
    CONSTRAINT `FK_FeedbackReplies_Feedbacks_FeedbackId` FOREIGN KEY (`FeedbackId`) REFERENCES `Feedbacks` (`FeedbackId`) ON DELETE CASCADE,
    CONSTRAINT `FK_FeedbackReplies_Users_AdminUserId` FOREIGN KEY (`AdminUserId`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_Addresses_UserId` ON `Addresses` (`UserId`);

CREATE INDEX `IX_cart_item_toppings_cart_item_id` ON `cart_item_toppings` (`cart_item_id`);

CREATE INDEX `IX_cart_item_toppings_topping_id` ON `cart_item_toppings` (`topping_id`);

CREATE INDEX `IX_CartItems_cart_id` ON `CartItems` (`cart_id`);

CREATE INDEX `IX_CartItems_product_id` ON `CartItems` (`product_id`);

CREATE INDEX `IX_CartItems_size_id` ON `CartItems` (`size_id`);

CREATE UNIQUE INDEX `IX_Carts_UserId` ON `Carts` (`UserId`);

CREATE INDEX `IX_FeedbackImages_FeedbackId` ON `FeedbackImages` (`FeedbackId`);

CREATE INDEX `IX_FeedbackReplies_AdminUserId` ON `FeedbackReplies` (`AdminUserId`);

CREATE UNIQUE INDEX `IX_FeedbackReplies_FeedbackId` ON `FeedbackReplies` (`FeedbackId`);

CREATE INDEX `IX_Feedbacks_CreatedAt` ON `Feedbacks` (`CreatedAt`);

CREATE UNIQUE INDEX `IX_Feedbacks_OrderDetailId` ON `Feedbacks` (`OrderDetailId`);

CREATE INDEX `IX_Feedbacks_ProductId_IsVisible_CreatedAt` ON `Feedbacks` (`ProductId`, `IsVisible`, `CreatedAt`);

CREATE INDEX `IX_Feedbacks_Rating` ON `Feedbacks` (`Rating`);

CREATE INDEX `IX_Feedbacks_UserId` ON `Feedbacks` (`UserId`);

CREATE UNIQUE INDEX `IX_News_Slug` ON `News` (`Slug`);

CREATE INDEX `IX_News_Status_IsDeleted_PublishedAt` ON `News` (`Status`, `IsDeleted`, `PublishedAt`);

CREATE INDEX `IX_News_Status_ScheduledPublishAt` ON `News` (`Status`, `ScheduledPublishAt`);

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

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20261017075334_InitDB', '8.0.18');

COMMIT;

