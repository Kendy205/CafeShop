# Cafe Ordering — Frontend

Ứng dụng đặt món cà phê (Vite + React 19 + Redux Toolkit + Axios + React Router + Tailwind 4). Domain bám **Tài liệu đặc tả API — Cafe Ordering System**, không dùng domain shop giày.

## Chạy dự án

```bash
cd Cafe
npm install
npm run dev
```

Tạo file `.env` (hoặc copy `.env.example`):

```
VITE_API_URL=https://localhost:7198
```

`DOMAIN` trong `src/utils/constants/System.js` đọc `import.meta.env.VITE_API_URL`.

## Auth

- Login: `POST /api/Auth/login` — `{ username, password }` → `token`, `userId`, `fullName`, `role` (`Customer` / admin).
- Register: `POST /api/Auth/register`.
- JWT lưu `localStorage`; role từ response hoặc `jwt-decode`.
- Interceptor 401: nếu có refresh token thì gọi `POST /api/Auth/refresh` (không có trong đặc tả — nếu backend chưa hỗ trợ sẽ logout). Login API chỉ trả `token`, không bắt buộc refresh.

## Feature theo API

| Module | Endpoint | UI |
|--------|----------|----|
| Product | `GET /api/Product`, `GET /api/Product/{id}` | Trang chủ, tìm kiếm, chi tiết |
| Size / Topping | `GET /api/Size`, `GET /api/Topping/available` | Chọn size & topping lúc đặt |
| Cart | `GET /api/Cart`, `POST /api/Cart/add`, `PUT /api/Cart/update`, `DELETE /api/Cart/remove/{id}`, `DELETE /api/Cart/clear` | Chi tiết món → giỏ → checkout |
| Address | CRUD + `PATCH .../default` | Sổ địa chỉ (cần đăng nhập) |
| Order | `POST /api/Order/buy-now`, `POST /api/Order/checkout` | Mua ngay gửi items; thanh toán từ giỏ dùng checkout |
| Voucher (client) | `GET /api/Voucher/available` | Chọn mã lúc checkout |
| Voucher (admin) | `POST/PUT /api/Voucher`, `PATCH .../toggle-active` | `/admin/vouchers` |

Thêm giỏ (`POST /api/Cart/add`): `{ productId, sizeId (null nếu không có size), quantity, toppings: [{ toppingId, quantity }] }`.

Admin list voucher dùng `GET /api/Voucher` (suy ra từ CRUD; đặc tả không ghi GET danh sách). Nếu 404, trang admin vẫn tạo/sửa theo id khi API bổ sung.

## Kiến trúc

Mỗi resource: **Service → createAsyncThunk → Slice → Page**. Không gọi Axios trong component.

Xem cấu trúc `src/` (`services/`, `redux/actions|slices`, `pages/`, `templates/`).
