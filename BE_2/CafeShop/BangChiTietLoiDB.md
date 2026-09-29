2. Bảng chi tiết
#Mục	Trạng thái	Mức độ	File:dòng	Bằng chứng	Hậu quả thực tế	Đề xuất sửa
1. Địa chỉ đơn hàng	❌	Critical	Order.cs:16	public int AddressId { get; set; }	Khách sửa địa chỉ (trong sổ địa chỉ) sẽ làm thay đổi thông tin giao hàng của đơn cũ đã hoàn thành.	Thêm snapshot: RecipientName, Phone, FullAddress vào Order.
2. Tồn kho hai nguồn	⚠️	High	OrderService.cs:387	if (productSize.StockQuantity < cartItem.Quantity)	Tồn kho phụ thuộc vào việc có Size hay không. Logic đúng nhưng dễ gây hiểu lầm cho frontend nếu trả ra Product.StockQuantity.	Rõ ràng API DTO, nếu sp có Size thì ẩn Product.StockQuantity.
3. Concurrency	⚠️	Medium	OrderController.cs:57	catch (DbUpdateConcurrencyException)	Bắt lỗi ở User nhưng trong AdminOrderController và CartService (trừ tồn kho) KHÔNG bắt exception này.	Áp dụng global filter hoặc try-catch đồng bộ cho toàn bộ luồng update kho.
4. Giá hai nguồn	❌	High	Size.cs:19	public decimal PercentIncrease { get; set; }	Backend bỏ qua hoàn toàn PercentIncrease, chỉ tính giá bằng ProductSize.Price.	Xóa PercentIncrease nếu không xài, hoặc sửa logic tính giá.
5. Magic string	⚠️	Medium	Cart.cs:23	Status = "active"	Hard-code chuỗi rải rác ở Cart, PaymentMethod (gán "COD" trong OrderService).	Tạo Enum hoặc Constants cho CartStatus, PaymentMethod.
6. Nullable sai	❌	Low	Category.cs:16	public string? Name { get; set; } nhưng có [Required]	Mâu thuẫn EF Core nullable reference types.	Sửa thành public string Name { get; set; } = null!;
7. Unique index	❌	High	ApplicationDbContext.cs:40	Thiếu cấu hình index IsUnique cho User	Có thể tạo 2 user trùng username/email, 2 voucher trùng code do chỉ rào bằng C# check (GetFirstOrDefaultAsync).	Thêm HasIndex().IsUnique() cho Username, Email, Code.
8. Composite key	✅	-	ApplicationDbContext.cs:45	HasKey(ps => new { ps.ProductId...	Đã cấu hình đúng bằng Fluent API.	Tiếp tục duy trì.
9. OrderHistory.Status	❌	Low	OrderStatusHistory.cs:17	[StringLength(500)]	Phí bộ nhớ và giảm hiệu năng index (Status chỉ cần 50 chars).	Đổi thành [StringLength(50)].
10. Precision tiền tệ	❌	High	ApplicationDbContext.cs	KHÔNG TÌM THẤY HasPrecision	EF Core sẽ map về decimal(18,2) mặc định hoặc văng warning, dễ sinh lỗi làm tròn tiền VNĐ.	Cấu hình toàn cầu: ConfigureConventions -> decimal(18,0).
11. Delete behavior	❌	Critical	ApplicationDbContext.cs:49	Chỉ Restrict cho Feedback. Các FK khác bị bỏ ngỏ.	Xóa 1 Sản phẩm sẽ xóa sạch OrderDetail chứa nó -> Mất doanh thu.	Cấu hình Restrict cho Product -> OrderDetail. Bổ sung IsDeleted xóa mềm.
12. Dữ liệu thừa	⚠️	Medium	AuthService.cs:199	user.Role : CafeShop.Uitls.SystemRole.User;	Dùng cả bảng Role và User.Role dạng chuỗi để fallback.	Bỏ hẳn User.Role và User.Address trong User.cs.
13. Order.TotalAmount	❌	Medium	OrderService.cs:108	Math.Max(0, orderTotal + shippingFee - discountAmount)	Không lưu SubTotal. Giảm giá ship và đơn gộp chung 1 cột.	Tách DiscountOrder, DiscountShipping và thêm SubTotal.
14. Công thức topping	❌	Medium	OrderService.cs:483	unitPrice += toppingPrice; rồi unitPrice * qty	Topping nhân theo số ly (2 trà sữa x 1 Trân châu = 2 trân châu). Lệch mô tả "(Base+Size)xSL + Topping".	Thống nhất với PO xem topping bán theo ly hay bán rời.
15. State machine	❌	High	AdminOrderService.cs:83	Không check chặn bước. Thiếu lưu Note hủy.	Admin có thể đổi từ Pending -> Completed. Không rõ lý do hủy.	Bổ sung State Machine Pattern và field CancelReason.
16. Hoàn kho khi Hủy	✅	-	OrderService.cs:190	await RestoreStockAsync	Nằm trong UnitOfWork.BeginTransaction.	Đã ổn.
17. Đặt hàng	❌	High	OrderService.cs:96	Insert Order nhưng tuyệt nhiên không tạo OrderStatusHistory.	Bảng OrderStatusHistory vô dụng vì bị bỏ quên hoàn toàn.	Thêm insert OrderStatusHistory vào SubmitOrderAsync và UpdateOrderStatusAsync.
18. Thanh toán	❌	Medium	Order.cs:20	Chỉ có chuỗi PaymentMethod	Đơn hàng không biết đã thanh toán chưa (PaidAt / PaymentStatus bị thiếu).	Thêm bảng Payment hoặc field PaymentStatus.
19. Voucher Race Condition	❌	Critical	VoucherService.cs:315	voucher.UsedCount += 1; _unitOfWork.Voucher.Update(voucher);	Xảy ra Lost Update khi 10 người dùng cùng click áp mã (mã giới hạn 1).	Dùng [ConcurrencyCheck] hoặc raw SQL UPDATE ... WHERE UsedCount < Limit.
20. ShippingConfig	❌	Medium	ShippingService.cs:36	//if (distanceKm > config.MaxDistanceKm)	Code bị comment, khách ở xa 100km vẫn đặt được ship, hệ thống vẫn tính tiền bình thường.	Mở comment chặn logic MaxDistanceKm.
21. Bảo mật Token	❌	High	UserService.cs:117	Đổi pass ChangePasswordAsync không clear Token cũ.	Tài khoản bị lộ -> đổi mật khẩu -> hacker cầm refreshToken cũ vẫn renew được token.	Thêm user.RefreshToken = null; khi đổi mật khẩu.
22. Phân quyền Endpoint	❌	High	Admin/OrderController.cs:16	[Authorize(Roles = ...Admin)]	Bảng Permission đã thiết kế nhưng KHÔNG hề được sử dụng ở Controller.	Tạo Policy và [Authorize(Policy="VIEW_ORDER")].
23. Tin Client?	✅	-	OrderService.cs:432	var product = await _unitOfWork.Product...	Code backend tự tính lại toàn bộ giá dựa vào kho/DB.	Đã ổn.
24. Cập nhật News	❌	Medium	Project	Không có BackgroundService.	ScheduledPublishAt (Hẹn giờ đăng) hoàn toàn vô dụng.	Thêm thư viện Hangfire hoặc HostedService.
25. Feedback	⚠️	Medium	FeedbackService.cs:50	Đã check order Completed/User, nhưng thiếu Unique.	Thiếu thuộc tính IsVisible (quản trị không thể ẩn review chửi bới).	Thêm field IsVisible vào model Feedback.
26. N+1 & Query Index	❌	Medium	FeedbackService.cs:77	GetAllAsync không dùng AsNoTracking (Read-only query).	Tốn RAM theo dõi Entity. Không có index composite Order(UserId, Date).	Tối ưu BaseRepository để hỗ trợ AsNoTracking và thêm Index.
27. Snake_case ở Cart	❌	Low	Cart.cs:14	[Column("cart_id")]	Lệch chuẩn toàn bộ db (PascalCase).	Đổi lại Attribute Column cho khớp.
28. Tài liệu vs Code	❓	Low	NGHIEP_VU_USER_ADMIN.md	KHÔNG TỒN TẠI FILE này trong source code.	Không thể đối chiếu chéo yêu cầu nghiệp vụ thực tế.	Cung cấp tài liệu đúng tên.
