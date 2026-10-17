/* =====================================================================
   CAFESHOP - SEED DATA (MySQL 8.0+)
   ---------------------------------------------------------------------
   Chuẩn hóa theo MODEL_SPECIFICATION.md:
     - Đảm bảo bảng mã tiếng Việt 100% utf8mb4 không bị lỗi font (SET NAMES utf8mb4).
     - 6 Danh mục đồ uống chính (ID 1-6), loại bỏ hoàn toàn bánh & soda.
     - Đúng 30 sản phẩm đồ uống (ID 1-30).
     - 10 Toppings kèm ảnh chuẩn Cloudinary, tồn kho ở mức 30-50.
     - 30 Sản phẩm có ảnh Cloudinary, ImagePublicId, tồn kho ở mức 30-50.
     - Toàn bộ 30 sản phẩm đều có Size (S, M, L) trong ProductSizes với tồn kho 30-50.
     - Bổ sung cấu hình StoreProfiles (Id=1) phục vụ tính toán đơn & vận hành.
     - 150 đơn hàng COMPLETED (mỗi sản phẩm đúng 5 đơn và 5 feedbacks).
     - Đồng bộ tồn kho ProductSizes, Toppings và lượt dùng Voucher.
   ===================================================================== */

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

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

    /* =====================  2. SIZES / CATEGORIES (6 Danh mục nước)  ===================== */
    INSERT INTO Sizes (SizeId, Name) VALUES (1,'S'), (2,'M'), (3,'L');

    INSERT INTO Categories (CategoryId, Name, Description) VALUES
    (1, 'Cà phê',       'Cà phê pha máy và pha phin truyền thống'),
    (2, 'Trà trái cây', 'Trà kết hợp trái cây tươi, thanh mát'),
    (3, 'Trà sữa',      'Trà sữa các vị, topping đa dạng'),
    (4, 'Sinh tố',      'Sinh tố trái cây xay tươi'),
    (5, 'Đá xay',       'Đồ uống đá xay mát lạnh'),
    (6, 'Nước ép',      'Nước ép trái cây nguyên chất');

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

    /* =====================  4. TOPPINGS (10 món - tồn kho 40-50)  ===================== */
    INSERT INTO Toppings (ToppingId, Name, Price, Unit, ImageUrl, StockQuantity, IsAvailable) VALUES
    (1,  'Trân châu đen',   8000,  'phần', 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222644/cafeshop/toppings/topping_1.jpg', 50, 1),
    (2,  'Trân châu trắng', 8000,  'phần', 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222645/cafeshop/toppings/topping_2.jpg', 48, 1),
    (3,  'Thạch dừa',       7000,  'phần', 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222645/cafeshop/toppings/topping_3.jpg', 45, 1),
    (4,  'Thạch trái cây',  7000,  'phần', 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222646/cafeshop/toppings/topping_4.jpg', 50, 1),
    (5,  'Pudding trứng',   10000, 'phần', 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222647/cafeshop/toppings/topping_5.jpg', 46, 1),
    (6,  'Sương sáo',       6000,  'phần', 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222648/cafeshop/toppings/topping_6.jpg', 45, 1),
    (7,  'Kem cheese',      12000, 'phần', 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222649/cafeshop/toppings/topping_7.jpg', 50, 1),
    (8,  'Whipping cream',  8000,  'phần', 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222650/cafeshop/toppings/topping_8.jpg', 48, 1),
    (9,  'Đào miếng',       10000, 'phần', 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222651/cafeshop/toppings/topping_9.jpg', 42, 1),
    (10, 'Shot espresso',   10000, 'shot', 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222652/cafeshop/toppings/topping_10.jpg', 50, 1);

    /* =====================  5. PRODUCTS (30 ĐỒ UỐNG CHUẨN - tồn kho 40-50)  ===================== */
    INSERT INTO Products (ProductId, CategoryId, Name, BasePrice, Description, IsAvailable, IsDeleted, StockQuantity, ImageUrl, ImagePublicId) VALUES
    -- Category 1: Cà phê (1 - 5)
    (1,  1, 'Cà phê đen đá',             25000, 'Cà phê phin đậm vị, uống với đá',            1, 0, 45, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222653/cafeshop/products/product_1.jpg', 'cafeshop/products/product_1'),
    (2,  1, 'Cà phê sữa đá',             29000, 'Cà phê phin pha sữa đặc truyền thống',       1, 0, 50, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222654/cafeshop/products/product_2.jpg', 'cafeshop/products/product_2'),
    (3,  1, 'Bạc xỉu',                   32000, 'Nhiều sữa, ít cà phê, béo ngọt',              1, 0, 48, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222655/cafeshop/products/product_3.jpg', 'cafeshop/products/product_3'),
    (4,  1, 'Cappuccino',                45000, 'Espresso với sữa nóng và lớp foam dày',      1, 0, 40, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222656/cafeshop/products/product_4.jpg', 'cafeshop/products/product_4'),
    (5,  1, 'Latte',                     45000, 'Espresso và sữa tươi, vị dịu nhẹ',           1, 0, 42, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222657/cafeshop/products/product_5.jpg', 'cafeshop/products/product_5'),

    -- Category 2: Trà trái cây (6 - 10)
    (6,  2, 'Trà đào cam sả',            42000, 'Trà đen, đào miếng, cam và sả tươi',         1, 0, 50, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222658/cafeshop/products/product_6.jpg', 'cafeshop/products/product_6'),
    (7,  2, 'Trà vải hoa hồng',          42000, 'Trà thơm hương hoa hồng cùng vải',           1, 0, 45, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222659/cafeshop/products/product_7.jpg', 'cafeshop/products/product_7'),
    (8,  2, 'Trà chanh mật ong',         35000, 'Chanh tươi và mật ong nguyên chất',          1, 0, 46, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222660/cafeshop/products/product_8.jpg', 'cafeshop/products/product_8'),
    (9,  2, 'Trà oolong dâu tây',        45000, 'Oolong thơm kết hợp dâu tây tươi',           1, 0, 44, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222661/cafeshop/products/product_9.jpg', 'cafeshop/products/product_9'),
    (10, 2, 'Trà nhiệt đới',             42000, 'Trà với dứa, xoài, chanh dây',               1, 0, 48, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222662/cafeshop/products/product_10.jpg', 'cafeshop/products/product_10'),

    -- Category 3: Trà sữa (11 - 15)
    (11, 3, 'Trà sữa trân châu đường đen', 40000, 'Trà sữa, trân châu nấu đường đen',         1, 0, 50, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222662/cafeshop/products/product_11.jpg', 'cafeshop/products/product_11'),
    (12, 3, 'Trà sữa truyền thống',      35000, 'Vị trà sữa cổ điển',                         1, 0, 50, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222663/cafeshop/products/product_12.jpg', 'cafeshop/products/product_12'),
    (13, 3, 'Trà sữa matcha',            45000, 'Matcha Nhật Bản kết hợp sữa',                1, 0, 45, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222664/cafeshop/products/product_13.jpg', 'cafeshop/products/product_13'),
    (14, 3, 'Trà sữa khoai môn',         42000, 'Khoai môn tím béo thơm',                     1, 0, 42, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222665/cafeshop/products/product_14.jpg', 'cafeshop/products/product_14'),
    (15, 3, 'Hồng trà sữa macchiato',    45000, 'Hồng trà sữa phủ lớp kem cheese',            1, 0, 46, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222666/cafeshop/products/product_15.jpg', 'cafeshop/products/product_15'),

    -- Category 4: Sinh tố (16 - 20)
    (16, 4, 'Sinh tố bơ',                45000, 'Bơ sáp xay mịn với sữa',                     1, 0, 40, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222667/cafeshop/products/product_16.jpg', 'cafeshop/products/product_16'),
    (17, 4, 'Sinh tố xoài',              40000, 'Xoài chín ngọt xay lạnh',                    1, 0, 45, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222668/cafeshop/products/product_17.jpg', 'cafeshop/products/product_17'),
    (18, 4, 'Sinh tố dâu',               42000, 'Dâu tươi xay cùng sữa chua',                 1, 0, 44, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222669/cafeshop/products/product_18.jpg', 'cafeshop/products/product_18'),
    (19, 4, 'Sinh tố chuối yến mạch',    38000, 'Chuối, yến mạch, mật ong',                   1, 0, 42, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222670/cafeshop/products/product_19.jpg', 'cafeshop/products/product_19'),
    (20, 4, 'Sinh tố việt quất',         48000, 'Việt quất và sữa chua',                       1, 0, 40, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222671/cafeshop/products/product_20.jpg', 'cafeshop/products/product_20'),

    -- Category 5: Đá xay (21 - 25)
    (21, 5, 'Cookie đá xay',             52000, 'Bánh cookie xay cùng kem tươi',              1, 0, 48, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222672/cafeshop/products/product_21.jpg', 'cafeshop/products/product_21'),
    (22, 5, 'Matcha đá xay',             52000, 'Matcha đá xay phủ kem',                       1, 0, 45, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222673/cafeshop/products/product_22.jpg', 'cafeshop/products/product_22'),
    (23, 5, 'Cà phê đá xay',             50000, 'Cà phê đá xay béo mát',                       1, 0, 46, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222674/cafeshop/products/product_23.jpg', 'cafeshop/products/product_23'),
    (24, 5, 'Socola đá xay',             50000, 'Socola đậm vị đá xay',                        1, 0, 44, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222675/cafeshop/products/product_24.jpg', 'cafeshop/products/product_24'),
    (25, 5, 'Chanh tuyết',               42000, 'Chanh xay tuyết chua ngọt',                   1, 0, 50, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222676/cafeshop/products/product_25.jpg', 'cafeshop/products/product_25'),

    -- Category 6: Nước ép (26 - 30)
    (26, 6, 'Nước ép cam',               38000, 'Cam vắt nguyên chất',                         1, 0, 50, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222677/cafeshop/products/product_26.jpg', 'cafeshop/products/product_26'),
    (27, 6, 'Nước ép dưa hấu',           35000, 'Dưa hấu ép mát lạnh',                          1, 0, 48, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222678/cafeshop/products/product_27.jpg', 'cafeshop/products/product_27'),
    (28, 6, 'Nước ép ổi',                35000, 'Ổi hồng ép giàu vitamin C',                    1, 0, 45, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222679/cafeshop/products/product_28.jpg', 'cafeshop/products/product_28'),
    (29, 6, 'Nước ép cà rốt táo',        38000, 'Cà rốt và táo ép tươi',                        1, 0, 42, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222680/cafeshop/products/product_29.jpg', 'cafeshop/products/product_29'),
    (30, 6, 'Nước ép cần tây táo',       40000, 'Cần tây, táo xanh, thanh lọc',                 1, 0, 45, 'https://res.cloudinary.com/dver7jg4e/image/upload/v1792222681/cafeshop/products/product_30.jpg', 'cafeshop/products/product_30');

    -- ProductSizes: Tất cả 30 món nước đều có Size S, M, L. Price làm tròn hàng nghìn. Tồn kho ở mức 40-50 ly.
    INSERT INTO ProductSizes (ProductId, SizeId, Price, StockQuantity)
    SELECT p.ProductId, s.SizeId,
           ROUND(p.BasePrice * (1 + (CASE s.SizeId WHEN 1 THEN 0 WHEN 2 THEN 15 ELSE 30 END) / 100.0) / 1000.0, 0) * 1000,
           40 + ((p.ProductId * 3 + s.SizeId * 7) % 11)
    FROM Products p CROSS JOIN Sizes s;

    -- ProductToppings: Cà phê/Trà/Trà sữa (1-3) dùng cả 10 topping;
    -- Sinh tố/Đá xay/Nước ép (4-6) dùng topping 1-6.
    INSERT INTO ProductToppings (ProductId, ToppingId)
    SELECT p.ProductId, t.ToppingId
    FROM Products p CROSS JOIN Toppings t
    WHERE (p.CategoryId BETWEEN 1 AND 3)
       OR (p.CategoryId BETWEEN 4 AND 6 AND t.ToppingId <= 6);

    /* =====================  6. VOUCHERS  ===================== */
    INSERT INTO Vouchers (VoucherId, Code, Description, TargetType, ApplyType, DiscountType,
        DiscountValue, MinOrderValue, MaxDiscountAmount, StartDate, EndDate, UsageLimit, UsedCount, IsActive) VALUES
    (1,  'WELCOME10',  'Giảm 10% đơn hàng, tối đa 30k',   'PUBLIC', 'ORDER',    'PERCENTAGE', 10, 50000,  30000, '2026-01-01', '2026-12-31', 1000, 0,   1),
    (2,  'GIAM20K',    'Giảm 20k cho đơn từ 100k',        'PUBLIC', 'ORDER',    'FIXED',      20000, 100000, 20000, '2026-01-01', '2026-12-31', 500,  0,   1),
    (3,  'FREESHIP',   'Giảm 15k phí ship, đơn từ 50k',   'PUBLIC', 'SHIPPING', 'FIXED',      15000, 50000,  15000, '2026-01-01', '2026-12-31', 800,  0,   1),
    (4,  'SHIP50',     'Giảm 50% phí ship, không giới hạn lượt', 'PUBLIC', 'SHIPPING', 'PERCENTAGE', 50, 0, 10000, '2026-09-01', '2026-12-31', 0,    0,   1),
    (5,  'WEEKEND15',  'Giảm 15% cuối tuần, đơn từ 80k',  'PUBLIC', 'ORDER',    'PERCENTAGE', 15, 80000,  30000, '2026-09-01', '2026-12-31', 200,  0,   1),
    (6,  'VIP20',      'VIP20 - Ưu đãi riêng giảm 20%, đơn từ 150k', 'USER', 'ORDER', 'PERCENTAGE', 20, 150000, 50000, '2026-09-01', '2026-12-31', 50, 0, 1),
    (7,  'BIRTHDAY30', 'BIRTHDAY30 - Quà sinh nhật giảm 30k riêng', 'USER', 'ORDER', 'FIXED',   30000, 0, 30000, '2026-01-01', '2026-12-31', 50,   0,   1),
    (8,  'TET2025',    'Voucher Tết 2025 (đã hết hạn)',   'PUBLIC', 'ORDER',    'PERCENTAGE', 25, 100000, 40000, '2025-01-15', '2025-02-15', 300,  212, 1),
    (9,  'HETLUOT',    'Voucher đã hết lượt sử dụng',     'PUBLIC', 'ORDER',    'FIXED',      10000, 50000,  10000, '2026-01-01', '2026-12-31', 100,  100, 1),
    (10, 'TAMDUNG',    'Voucher đang tạm ngưng',          'PUBLIC', 'ORDER',    'PERCENTAGE', 5, 0,      15000, '2026-01-01', '2026-12-31', 100,  0,   0);

    -- UserVouchers
    INSERT INTO UserVouchers (UserId, VoucherId, UsageLimitPerUser, UsedCount, AssignedDate) VALUES
    (4, 6, 1, 0, '2026-09-01 09:00:00'),
    (5, 6, 1, 0, '2026-09-01 09:00:00'),
    (6, 7, 1, 0, '2026-09-10 09:00:00'),
    (8, 7, 1, 0, '2026-09-15 09:00:00');

    /* =====================  7. ADDRESSES  ===================== */
    INSERT INTO Addresses (AddressId, UserId, RecipientName, Phone, FullAddress, IsDefault, IsDeleted, Latitude, Longitude, CreatedAt) VALUES
    (1, 4,  'Phạm Ngọc Anh',   '0912000004', '25 Tây Sơn, Đống Đa, Hà Nội',           1, 0, 21.0075, 105.8231, '2026-02-10 10:05:00'),
    (2, 5,  'Vũ Đức Thắng',    '0912000005', '102 Cầu Giấy, Cầu Giấy, Hà Nội',        1, 0, 21.0333, 105.7950, '2026-02-15 11:35:00'),
    (3, 6,  'Đỗ Thùy Linh',    '0912000006', '7 Láng Hạ, Đống Đa, Hà Nội',            1, 0, 21.0158, 105.8121, '2026-03-01 14:05:00'),
    (4, 7,  'Hoàng Gia Huy',   '0912000007', '61 Trần Duy Hưng, Cầu Giấy, Hà Nội',    1, 0, 21.0086, 105.7987, '2026-03-12 09:50:00'),
    (5, 8,  'Bùi Khánh Vy',    '0912000008', '33 Giảng Võ, Ba Đình, Hà Nội',          1, 0, 21.0265, 105.8210, '2026-04-02 16:25:00'),
    (6, 9,  'Ngô Thành Long',  '0912000009', '19 Phố Huế, Hai Bà Trưng, Hà Nội',      1, 0, 21.0150, 105.8490, '2026-04-20 18:15:00'),
    (7, 10, 'Đặng Mai Phương', '0912000010', '54 Nguyễn Chí Thanh, Đống Đa, Hà Nội',  1, 0, 21.0230, 105.8085, '2026-05-05 08:35:00');

    /* =====================  8. CARTS (active)  ===================== */
    INSERT INTO Carts (CartId, UserId, Status, CreatedAt, UpdatedAt) VALUES
    (1, 4, 'ACTIVE', '2026-09-28 08:00:00', '2026-09-28 08:10:00'),
    (2, 5, 'ACTIVE', '2026-09-28 09:00:00', '2026-09-28 09:05:00'),
    (3, 9, 'ACTIVE', '2026-09-28 10:00:00', '2026-09-28 10:00:00');

    INSERT INTO CartItems (cart_item_id, cart_id, product_id, size_id, quantity, unit_price) VALUES
    (1, 1, 11, 2, 2, (SELECT Price FROM ProductSizes WHERE ProductId = 11 AND SizeId = 2)),   -- Trà sữa trân châu đường đen, size M
    (2, 2, 6,  1, 1, (SELECT Price FROM ProductSizes WHERE ProductId = 6  AND SizeId = 1)),   -- Trà đào cam sả, size S
    (3, 2, 1,  1, 1, (SELECT Price FROM ProductSizes WHERE ProductId = 1  AND SizeId = 1)),   -- Cà phê đen đá, size S
    (4, 3, 22, 3, 1, (SELECT Price FROM ProductSizes WHERE ProductId = 22 AND SizeId = 3));  -- Matcha đá xay, size L

    INSERT INTO cart_item_toppings (cart_item_topping_id, cart_item_id, topping_id, Quantity, unit_price) VALUES
    (1, 1, 1, 1, (SELECT Price FROM Toppings WHERE ToppingId = 1) * 1),   -- Trân châu đen
    (2, 4, 7, 1, (SELECT Price FROM Toppings WHERE ToppingId = 7) * 1);  -- Kem cheese

    /* =====================  9. SHIPPING CONFIG (1 dòng mặc định)  ===================== */
    INSERT INTO ShippingConfigs (Id, BaseFee, BaseDistanceKm, ExtraFeePerKm, MaxDistanceKm,
        IsFreeShippingEnabled, FreeShippingThreshold, NightSurcharge, NightHourStart, NightHourEnd,
        PeakHourSurcharge, PeakHourStart, PeakHourEnd, WeekendSurcharge) VALUES
    (1, 5000, 5.0, 2000, 10.0, 1, 200000, 2000, 22, 6, 0, 11, 13, 3000);

    /* =====================  10. STORE PROFILES (Cấu hình quán)  ===================== */
    INSERT INTO StoreProfiles (Id, StoreName, Hotline, FullAddress, Latitude, Longitude,
        IsAcceptingOrders, IsRealtimeNotificationEnabled, IsMaintenanceMode, OpenTime, CloseTime, CreatedAt, UpdatedAt) VALUES
    (1, 'CafeShop - Cửa Hàng Chính', '0901000001', '123 Đường Cầu Giấy, Cầu Giấy, Hà Nội', 21.0333, 105.7950,
     1, 1, 0, '07:00:00', '22:00:00', '2026-01-01 07:00:00', '2026-01-01 07:00:00')
    ON DUPLICATE KEY UPDATE
        StoreName = VALUES(StoreName),
        Hotline = VALUES(Hotline),
        FullAddress = VALUES(FullAddress),
        Latitude = VALUES(Latitude),
        Longitude = VALUES(Longitude),
        IsAcceptingOrders = VALUES(IsAcceptingOrders),
        IsRealtimeNotificationEnabled = VALUES(IsRealtimeNotificationEnabled),
        IsMaintenanceMode = VALUES(IsMaintenanceMode),
        OpenTime = VALUES(OpenTime),
        CloseTime = VALUES(CloseTime),
        UpdatedAt = VALUES(UpdatedAt);

    /* =====================  11. NEWS (10 bài viết truyền thông)  ===================== */
    INSERT INTO News (UserId, Title, Slug, Summary, Content, ImageUrl, Status, ScheduledPublishAt, PublishedAt, CreatedAt, UpdatedAt, IsDeleted, ViewCount) VALUES
    (1, 'CafeShop khai trương chi nhánh mới tại Cầu Giấy', 'cafeshop-khai-truong-chi-nhanh-cau-giay',
        'Chi nhánh thứ hai chính thức mở cửa với nhiều ưu đãi.',
        'CafeShop hân hạnh thông báo khai trương chi nhánh mới tại Cầu Giấy. Trong tuần đầu tiên, khách hàng được giảm 20% toàn bộ thực đơn đồ uống.',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', 'PUBLISHED', NULL, '2026-08-01 08:00:00', '2026-07-30 10:00:00', NULL, 0, 1520),
    (1, 'Ra mắt dòng trà trái cây mùa hè', 'ra-mat-dong-tra-trai-cay-mua-he',
        'Bộ sưu tập trà trái cây thanh mát cho mùa nóng.',
        'Từ ngày 1/6, CafeShop giới thiệu 5 món trà trái cây mới sử dụng nguyên liệu tươi mỗi ngày.',
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80', 'PUBLISHED', NULL, '2026-06-01 08:00:00', '2026-05-28 09:00:00', NULL, 0, 980),
    (2, 'Cách chọn hạt cà phê ngon tại nhà', 'cach-chon-hat-ca-phe-ngon-tai-nha',
        'Mẹo nhỏ giúp bạn chọn được hạt cà phê phù hợp khẩu vị.',
        'Hạt Arabica thiên về vị chua thanh, Robusta đậm và đắng. Hãy chọn loại rang vừa để cân bằng hương vị.',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', 'PUBLISHED', NULL, '2026-06-15 09:00:00', '2026-06-14 15:00:00', NULL, 0, 742),
    (2, 'Ưu đãi WELCOME10 dành cho khách hàng mới', 'uu-dai-welcome10-khach-hang-moi',
        'Nhập mã WELCOME10 để giảm 10% cho đơn hàng đầu tiên.',
        'Áp dụng cho mọi đơn hàng, giảm tối đa 30.000đ. Chương trình kéo dài đến hết năm 2026.',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', 'PUBLISHED', NULL, '2026-01-05 08:00:00', '2026-01-04 16:00:00', NULL, 0, 2310),
    (1, 'Hương vị Matcha đá xay Nhật Bản đặc trưng', 'huong-vi-matcha-da-xay-nhat-ban',
        'Thưởng thức bột trà xanh Uji hảo hạng kết hợp lớp whipping cream béo ngậy.',
        'Matcha đá xay tại CafeShop sử dụng 100% bột matcha nhập khẩu nguyên chất từ Nhật Bản.',
        'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=800&q=80', 'PUBLISHED', NULL, '2026-07-10 08:00:00', '2026-07-09 11:00:00', '2026-07-09 14:00:00', 0, 655),
    (3, 'Thông báo lịch làm việc dịp Quốc khánh 2/9', 'thong-bao-lich-lam-viec-quoc-khanh',
        'Quán hoạt động bình thường trong dịp lễ.',
        'CafeShop mở cửa từ 7h đến 22h trong các ngày nghỉ lễ 1/9 - 4/9. Rất mong được phục vụ quý khách.',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', 'PUBLISHED', NULL, '2026-08-28 08:00:00', '2026-08-27 17:00:00', NULL, 0, 430),
    (1, 'Chương trình khách hàng thân thiết VIP', 'chuong-trinh-khach-hang-than-thiet-vip',
        'Tích lũy đơn hàng để nhận voucher VIP20 giảm 20%.',
        'Khách hàng VIP sẽ nhận các voucher riêng, ưu đãi sinh nhật và quyền đặt món sớm.',
        'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80', 'PUBLISHED', NULL, '2026-09-01 08:00:00', '2026-08-31 10:00:00', NULL, 0, 512),
    (2, 'Bí quyết pha trà sữa trân châu đường đen', 'bi-quyet-pha-tra-sua-tran-chau-duong-den',
        'Bí quyết nấu trân châu dẻo dai, thơm đường đen.',
        'Trân châu được nấu và ủ đường đen mỗi 4 tiếng để giữ độ dẻo và hương vị tốt nhất.',
        'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80', 'DRAFT', NULL, NULL, '2026-09-20 13:00:00', NULL, 0, 0),
    (1, 'Sự kiện Trung thu: Mua 2 tặng 1', 'su-kien-trung-thu-mua-2-tang-1',
        'Đón Trung thu cùng CafeShop với ưu đãi hấp dẫn.',
        'Mua 2 đồ uống bất kỳ tặng 1 topping tùy chọn trong các ngày từ 25/9 đến 29/9.',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', 'SCHEDULED', '2026-10-01 08:00:00', NULL, '2026-09-25 10:00:00', NULL, 0, 0),
    (2, 'Bài viết cũ đã xóa: khuyến mãi tháng 3', 'bai-viet-cu-khuyen-mai-thang-3',
        'Bài viết đã được gỡ khỏi trang.',
        'Nội dung khuyến mãi tháng 3 đã hết hạn.',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80', 'PUBLISHED', NULL, '2026-03-01 08:00:00', '2026-02-28 10:00:00', '2026-04-01 09:00:00', 1, 120);

    /* =====================  12. ORDERS + DETAILS + TOPPINGS + HISTORY + PAYMENTS + FEEDBACK  =====================
       150 đơn hàng (đúng 5 đơn cho mỗi món trong 30 sản phẩm đồ uống).
       Tất cả đơn đều COMPLETED, PaymentStatus = Paid, có Payment 'success' và Feedback tương ứng. */

    CREATE TEMPORARY TABLE tmp_numbers (n INT PRIMARY KEY);
    INSERT INTO tmp_numbers (n)
    WITH RECURSIVE seq AS (
        SELECT 1 AS n
        UNION ALL
        SELECT n + 1 FROM seq WHERE n < 150
    )
    SELECT n FROM seq;

    CREATE TEMPORARY TABLE tmp_orders (
        n INT PRIMARY KEY,
        UserId INT, AddressId INT, ProductId INT, SizeId INT, Qty INT,
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
        1 + (num.n % 3)                                              AS SizeId,
        1 + ((num.n DIV 3) % 3)                                      AS Qty,
        CASE WHEN num.n % 2 = 0 THEN 1 + (num.n % 6) END             AS ToppingId,
        CASE WHEN num.n % 2 = 0 THEN 1 + (num.n % 2) END             AS ToppingQty,
        1.0 + (num.n % 9) + 0.5                                      AS DistanceKm,
        DATE_SUB('2026-09-27 18:00:00', INTERVAL num.n * 300 MINUTE) AS OrderDate,
        CASE num.n % 3 WHEN 0 THEN 'COD' WHEN 1 THEN 'MOMO' ELSE 'VNPAY' END AS PaymentMethod
    FROM tmp_numbers num
    JOIN Products p ON p.ProductId = ((num.n - 1) DIV 5) + 1;

    -- Đơn giá 1 ly theo Size
    UPDATE tmp_orders t
    JOIN ProductSizes ps ON ps.ProductId = t.ProductId AND ps.SizeId = t.SizeId
    SET t.UnitPricePerCup = ps.Price;

    -- Giá Topping
    UPDATE tmp_orders t
    JOIN Toppings tp ON tp.ToppingId = t.ToppingId
    SET t.ToppingUnitPriceRaw = tp.Price
    WHERE t.ToppingId IS NOT NULL;

    -- OrderDetailTopping.UnitPrice = ToppingPrice x Qty(topping) x SốLy
    UPDATE tmp_orders
    SET ToppingLineTotal = ToppingUnitPriceRaw * ToppingQty * Qty
    WHERE ToppingId IS NOT NULL;

    -- OrderDetail.UnitPrice = (đơn giá ly x SL) + tổng topping của dòng
    UPDATE tmp_orders
    SET DetailUnitPrice = (UnitPricePerCup * Qty) + IFNULL(ToppingLineTotal, 0);

    UPDATE tmp_orders SET SubTotal = DetailUnitPrice;

    -- Tính phí ship: BaseFee 5.000đ cho 5km đầu, +2.000đ/km vượt, freeship từ 200.000đ
    UPDATE tmp_orders
    SET ShippingFee = CASE
        WHEN SubTotal >= 200000 THEN 0
        ELSE 5000 + CASE WHEN DistanceKm > 5 THEN CEIL(DistanceKm - 5) * 2000 ELSE 0 END
    END;

    -- Gán voucher
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

    -- Demo voucher VIP20 (VoucherId=6, minOrder=150.000đ, riêng User 4)
    -- Dùng Product 21 (Cookie đá xay), Size L (SizeId=3, Price=68000đ), Qty=3 => SubTotal=204.000đ
    UPDATE tmp_orders
    SET UserId = 4, AddressId = 1, SizeId = 3, Qty = 3, ToppingId = NULL, ToppingQty = NULL,
        ToppingUnitPriceRaw = NULL, ToppingLineTotal = NULL,
        UnitPricePerCup = (SELECT Price FROM ProductSizes WHERE ProductId = 21 AND SizeId = 3),
        DetailUnitPrice = (SELECT Price FROM ProductSizes WHERE ProductId = 21 AND SizeId = 3) * 3,
        SubTotal = (SELECT Price FROM ProductSizes WHERE ProductId = 21 AND SizeId = 3) * 3,
        DistanceKm = 3.0, ShippingFee = 5000,
        VoucherId = 6,
        OrderDiscount = LEAST((SELECT Price FROM ProductSizes WHERE ProductId = 21 AND SizeId = 3) * 3 * 0.20, 50000),
        ShippingDiscount = 0
    WHERE ProductId = 21 ORDER BY n ASC LIMIT 1;

    UPDATE tmp_orders
    SET TotalAmount = SubTotal - OrderDiscount + ShippingFee - ShippingDiscount
    WHERE VoucherId = 6;

    -- Insert Orders
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

    -- Insert OrderDetails
    INSERT INTO OrderDetails (OrderDetailId, OrderId, ProductId, SizeId, Quantity, UnitPrice, Note)
    SELECT n, n, ProductId, SizeId, Qty, DetailUnitPrice, NULL FROM tmp_orders;

    -- Insert OrderDetailToppings
    INSERT INTO OrderDetailToppings (OrderDetailId, ToppingId, Quantity, UnitPrice)
    SELECT n, ToppingId, ToppingQty, ToppingLineTotal FROM tmp_orders WHERE ToppingId IS NOT NULL;

    -- Insert OrderStatusHistories: PENDING -> CONFIRMED -> PREPARING -> DELIVERING -> COMPLETED
    INSERT INTO OrderStatusHistories (OrderId, Status, ChangedBy, ChangedAt, Note)
    SELECT t.n, h.Status,
           CASE WHEN h.Step = 1 THEN t.UserId ELSE 3 END,
           DATE_ADD(t.OrderDate, INTERVAL h.OffsetMin MINUTE),
           h.Note
    FROM tmp_orders t
    CROSS JOIN (
        SELECT 1 AS Step, 'PENDING'    AS Status, 0  AS OffsetMin, 'Khách hàng tạo đơn thành công' AS Note
        UNION ALL
        SELECT 2,         'CONFIRMED',            5,               'Nhân viên đã xác nhận đơn'
        UNION ALL
        SELECT 3,         'PREPARING',            12,              'Barista đang pha chế'
        UNION ALL
        SELECT 4,         'DELIVERING',           25,              'Shipper đang giao hàng'
        UNION ALL
        SELECT 5,         'COMPLETED',            50,              'Giao hàng thành công'
    ) h;

    -- Insert Payments
    INSERT INTO Payments (OrderId, PaymentMethod, PaymentProvider, TransactionCode, Amount, PaymentStatus, PaidAt, ErrorMessage, CreatedAt)
    SELECT
        n,
        PaymentMethod,
        CASE PaymentMethod WHEN 'COD' THEN 'TIEN_MAT' WHEN 'MOMO' THEN 'MOMO_WALLET' ELSE 'VNPAY_QR' END,
        CASE PaymentMethod
            WHEN 'COD'   THEN CONCAT('COD-', LPAD(n, 6, '0'))
            WHEN 'MOMO'  THEN CONCAT('MOMO-', 1700000000 + n)
            ELSE              CONCAT('VNPAY-', 2026090000 + n)
        END,
        TotalAmount,
        'success',
        DATE_ADD(OrderDate, INTERVAL (CASE PaymentMethod WHEN 'COD' THEN 50 ELSE 1 END) MINUTE),
        NULL,
        OrderDate
    FROM tmp_orders;

    -- Feedback: đúng 5 feedbacks / mỗi sản phẩm
    CREATE TEMPORARY TABLE tmp_comments (Rating INT, Idx INT, Txt VARCHAR(300));
    INSERT INTO tmp_comments VALUES
    (2,0,'Đồ uống hơi nhạt, mong quán cải thiện thêm.'),
    (2,1,'Giao hơi lâu, món đến nơi không còn lạnh.'),
    (2,2,'Vị chưa đúng ý mình lắm.'),
    (3,0,'Tạm ổn, giá hợp lý.'),
    (3,1,'Bình thường, có thể thử lại lần sau.'),
    (3,2,'Món ổn nhưng đá hơi nhiều.'),
    (4,0,'Ngon, đúng vị, giao nhanh.'),
    (4,1,'Rất ổn, sẽ ủng hộ quán tiếp.'),
    (4,2,'Món ngon, nhân viên nhiệt tình.'),
    (5,0,'Tuyệt vời! Ngon hơn mong đợi, sẽ đặt lại.'),
    (5,1,'Rất thơm ngon, đóng gói cẩn thận.'),
    (5,2,'Quá đỉnh, đồ uống đậm vị rất thích!');

    INSERT INTO Feedbacks (ProductId, UserId, OrderDetailId, Rating, Comment, CreatedAt, IsVisible)
    SELECT r.ProductId, r.UserId, r.n, r.Rating, c.Txt,
           DATE_ADD(DATE_ADD(r.OrderDate, INTERVAL 55 MINUTE), INTERVAL (2 + (r.n % 20)) HOUR),
           CASE WHEN r.Rating = 2 THEN 0 ELSE 1 END
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

    /* ---- Đồng bộ tồn kho & lượt dùng voucher ---- */
    -- Đồ uống CÓ size: trừ ProductSizes.StockQuantity theo số lượng đã bán
    UPDATE ProductSizes ps
    JOIN (SELECT ProductId, SizeId, SUM(Qty) AS Sold FROM tmp_orders WHERE SizeId IS NOT NULL GROUP BY ProductId, SizeId) x
      ON x.ProductId = ps.ProductId AND x.SizeId = ps.SizeId
    SET ps.StockQuantity = GREATEST(30, ps.StockQuantity - x.Sold);

    -- Đảm bảo Products.StockQuantity ở mức 30-50
    UPDATE Products p
    JOIN (SELECT ProductId, ROUND(AVG(StockQuantity)) AS AvgStock FROM ProductSizes GROUP BY ProductId) x
      ON x.ProductId = p.ProductId
    SET p.StockQuantity = x.AvgStock;

    -- Topping tồn kho (giữ ở mức 30-50)
    UPDATE Toppings t
    JOIN (SELECT ToppingId, SUM(ToppingQty * Qty) AS Sold FROM tmp_orders WHERE ToppingId IS NOT NULL GROUP BY ToppingId) x
      ON x.ToppingId = t.ToppingId
    SET t.StockQuantity = GREATEST(30, t.StockQuantity - x.Sold);

    -- Voucher dùng chung
    UPDATE Vouchers v
    JOIN (SELECT VoucherId, COUNT(*) AS Cnt FROM tmp_orders WHERE VoucherId IS NOT NULL GROUP BY VoucherId) x
      ON x.VoucherId = v.VoucherId
    SET v.UsedCount = v.UsedCount + x.Cnt;

    -- Voucher riêng tư (UserVoucher)
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

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

CALL sp_seed_cafeshop();
DROP PROCEDURE sp_seed_cafeshop;
