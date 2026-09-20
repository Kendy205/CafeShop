# 📋 BÁO CÁO TOÀN DIỆN CODE REVIEW - DỰ ÁN CAFE SHOP FRONTEND

> **Người thực hiện:** Senior Frontend React / Architect  
> **Dự án:** Cafe Shop Web App (Customer + Admin Portal)  
> **Tech Stack:** React 19, Vite 8, Redux Toolkit 2.12, Ant Design 6.6, Tailwind CSS v4, React Router v7, Axios, Formik + Yup  
> **Ngày lập báo cáo:** 19/09/2026

---

## 1. TỔNG QUAN ĐÁNH GIÁ (EXECUTIVE SUMMARY)

| Trọng số / Hạng mục | Điểm số | Đánh giá tổng quan |
|---|:---:|---|
| **Kiến trúc phân tầng (Architecture Layering)** | **8.5 / 10** | Rất rõ ràng (`services → actions → slices → pages/components`). Luồng dữ liệu 1 chiều chuẩn mực. |
| **Quản lý State Redux (Redux Toolkit)** | **8.0 / 10** | Sử dụng `createAsyncThunk`, `extraReducers` builder pattern bài bản, counter-based global loading. |
| **Tầng Network & Services (BaseService / API)** | **7.0 / 10** | Interceptor refresh token xử lý queue tốt, unwrapApi chuẩn hóa .NET PascalCase tốt, nhưng còn lẫn lộn class methods vs arrow property. |
| **Độ đồng bộ giữa 2 Module (Admin vs User)** | **6.5 / 10** | Có độ vênh về quy ước đặt tên (fetch vs get), chiến lược phân trang (client vs server), và giao diện (Ant Design thuần vs Tailwind). |
| **Clean Code & Component Decomposition** | **6.5 / 10** | Một số Page quá lớn (>500 dòng), trộn lẫn Controller + View + Modal. Cần tách nhỏ. |
| **UX / Security / Route Guard** | **8.5 / 10** | `ProtectedRoute` bật AuthModal thông minh, lưu đường dẫn quay lại, validate vai trò chuẩn. |
| **ĐIỂM TRUNG BÌNH TOÀN DỰ ÁN** | **7.5 / 10** | **Khá - Tốt (Solid Foundation, cần tinh chỉnh đồng bộ & tái cấu trúc UI)** |

---

## 2. PHÂN TÍCH CHI TIẾT THEO TỪNG LỚP KIẾN TRÚC

### 2.1. Lớp Redux State Management (`src/redux/`)

#### Điểm cộng lớn (Best Practices):
1. **Chia tách Slice rõ ràng theo nghiệp vụ và domain**:
   - Thư mục `slices/admin/`: `adminProductSlice`, `adminCategorySlice`, `adminSizeSlice`, `adminToppingSlice`, `adminVoucherSlice`, `adminUserSlice`, `adminDashboardSlice`.
   - Thư mục `slices/user/`: `productSlice`, `cartSlice`, `orderSlice`, `addressSlice`, `voucherSlice`, `sizeSlice`, `toppingSlice`, `userSlice`.
   - Lõi dùng chung: `authSlice`, `uiSlice`.
2. **`uiSlice` sử dụng Counter thay vì Boolean**:
   - `startGlobalLoading`: `loadingCount += 1`
   - `stopGlobalLoading`: `loadingCount = Math.max(0, loadingCount - 1)`
   - *Lợi ích:* Khi có 3-4 API cùng lúc bắn ra trên cùng 1 trang, không bao giờ xảy ra lỗi API xong trước làm tắt nhầm loading của API đang chạy.
3. **Reset state chéo (Cross-slice reset)**:
   - Trong `cartSlice.js`, bắt trực tiếp action `logout` của `authSlice` để tự dọn dẹp giỏ hàng về rỗng khi người dùng đăng xuất.
4. **Chuẩn hóa Error Handling**:
   - Hầu hết các thunk đều có `try/catch` bọc với `rejectWithValue(pickErrorMessage(error, fallback))` giúp payload lỗi trong state luôn là 1 `string` thân thiện với UI.

#### Điểm cần khắc phục:
1. **Lệch cấu trúc State (Shape mismatch) giữa Admin và User Product**:
   - `adminProductSlice.initialState`: `{ items, total, page, pageSize, detail, loading, detailLoading, error, submitting }` (thiếu `totalPages`).
   - `productSlice.initialState` (user): `{ items, total, totalPages, page, pageSize, detail, loading, detailLoading, error, categories, categoriesLoading }`.
   - *Hậu quả:* Khi code component dùng chung hoặc truyền dữ liệu qua lại, dev phải nhớ admin có gì, user có gì.
2. **Kẹp danh mục (`categories`) vào `productSlice` của User**:
   - User lấy danh mục bộ lọc nằm ngay trong `productSlice` (`getCategories`), trong khi Admin có riêng `adminCategorySlice`. Đáng lẽ nên có 1 `categorySlice` chung cho user hoặc tách riêng.
3. **File `store.jsx` mang đuôi `.jsx`**:
   - Không chứa bất kỳ thẻ JSX nào, nên đổi thành `store.js`.

---

### 2.2. Lớp Services & API Helpers (`src/services/` & `src/utils/helpers/`)

#### Điểm cộng lớn:
1. **`api.js` được thiết kế tương thích rất cao với Backend .NET**:
   - Hàm `unwrapApi`: Bóc tách được cả `data`, `Data`, kiểm tra cờ `Success` / `success`, ném `Error` kèm message chính xác khi status >= 400.
   - Hàm `normalizePagedResult`: Tự động map hoa thường (`Items`/`items`, `Total`/`total`, `PageNumber`/`page`), tự động tính `totalPages = Math.ceil(total / pageSize)`.
   - Hàm `pickErrorMessage`: Quét từ `string`, `message`, `Message`, `detail`, `title` đến mảng `errors` chuẩn format FluentValidation hoặc ModelState của ASP.NET.
2. **Cơ chế Refresh Token chống đua (Race Condition Prevention)**:
   - Trong `BaseService.js`, có biến cờ `isRefreshing` và mảng `failedQueue`.
   - Khi token hết hạn, chỉ có đúng **1 request** đứng ra gọi refresh token lên máy chủ, các request khác được gom vào hàng đợi (`failedQueue`). Khi token mới về, toàn bộ hàng đợi được replay với token mới.

#### Điểm cần khắc phục:
1. **Style viết Service không nhất quán**:
   - `AdminProductService.js`: Dùng phương thức class truyền thống (`getProducts(params) { ... }`).
   - `ProductService.js` (user): Dùng thuộc tính arrow function (`getProducts = (params) => ...`).
   - `AdminCategoryService.js`: Dùng method class.
   - `VoucherService.js`: Dùng arrow function.
   - *Khuyến nghị:* Chọn 1 style duy nhất trong toàn project (khuyên dùng arrow property để tránh mất ngữ cảnh `this` khi truyền qua callback).
2. **`AdminProductService` tự ý import instance `http`**:
   - Tại dòng 2 & 16: `import { http } from '../BaseService'` rồi gọi `http.post(this.basePath, formData)`.
   - Việc này nhảy cóc qua lớp trừu tượng `this.post(...)` của `BaseServices`, tạo ra thói quen không đồng nhất.

---

### 2.3. So sánh đối chiếu Module ADMIN vs USER (Tính đồng bộ)

| Tiêu chí | Module ADMIN | Module USER | Đánh giá & Rủi ro |
|---|---|---|---|
| **Thư viện Giao diện** | Ant Design thuần (`<Table>`, `<Modal>`, `<Switch>`, `<Tag>`) | Tailwind CSS thuần kết hợp Apple Glassmorphism | Giao diện 2 bên có cảm giác từ 2 framework khác nhau; tuy nhiên với mô hình Admin/User phân tách, điều này chấp nhận được nếu có design token chung. |
| **Tiền tố Action Redux** | Dùng `fetchAdmin*`, `createAdmin*` | Dùng `get*`, `add*` | Thiếu đồng bộ quy ước (Naming convention). Nên thống nhất: `fetch*` cho GET, `create*`/`update*`/`delete*` cho POST/PUT/DELETE. |
| **Chiến lược Phân trang (Pagination)** | **Không đồng nhất nội bộ**: Product/User dùng Server-side; Category/Size/Topping lại dùng Client-side slice | Dùng Server-side pagination theo params (`pageNumber`, `pageSize`) | **Nguy hiểm**: Nếu danh mục, size hoặc topping sau này lên hàng trăm bản ghi, việc load toàn bộ rồi slice trên client sẽ gây lag UI và tốn băng thông. |
| **Component Phân trang** | Trước đây dùng `CustomPagination.jsx` (bọc Antd) | Trước đây dùng `Pagination.jsx` (nút HTML tự chế) | **ĐÃ GIẢI QUYẾT**: Hiện đã hợp nhất thành `AppPagination.jsx` dùng chung toàn hệ thống. |
| **Cách xử lý Form** | Controlled Component thông qua `useState` thuần với form state lớn | Formik + Yup ở AuthModal; useState ở giỏ hàng & checkout | Chưa có sự nhất quán về form validation (Admin validate chay bằng if/else, User có Yup). |

---

### 2.4. Clean Code & Tái cấu trúc Component

1. **Vấn đề Monolithic Component (File quá dài, ôm đồm)**:
   - `AdminProductPage.jsx`: **565 dòng**
     - Đang gánh: Table columns định nghĩa, bộ lọc, state modal, xử lý upload file ảnh, quản lý dynamic size pricing, form validation, submit logic.
     - *Giải pháp:* Tách ra thành 3 file:
       - `AdminProductPage.jsx` (Chỉ quản lý Table, Filter, Pagination)
       - `ProductModal.jsx` (Quản lý Dialog và Upload)
       - `ProductSizeField.jsx` (Quản lý cụm Size và Giá)
   - `HomePage.jsx`: **478 dòng**
     - Đang gánh: Banner Hero, Feature Badges, Toolbar tìm kiếm & lọc category, Product Grid, Pagination, Bottom story card.
     - *Giải pháp:* Tách thành các section components trong thư mục `pages/home/components/`.
   - `ProductDetailPage.jsx`: **638 dòng**
     - Ôm cả bộ custom Topping, Size, Review section, Add-to-cart & Buy-now.
2. **Các component trong `adminShared.jsx` bị bỏ quên**:
   - Trong `src/pages/admin/adminShared.jsx` có định nghĩa `AdminTable`, `AdminModal`, `PageHeader`, `FormField` viết bằng Tailwind rất đẹp.
   - Nhưng các trang admin (`AdminProductPage`, `AdminCategoryPage`...) lại import trực tiếp `<Table>`, `<Modal>` của Ant Design, dẫn đến `adminShared.jsx` trở thành **dead code**.
   - Cần đưa ra quyết định: Hoặc migrate dần các trang sang dùng `adminShared`, hoặc dọn dẹp file này.

---

## 3. CHI TIẾT VIỆC GIẢI QUYẾT VẤN ĐỀ 2 PAGINATION

### Thực trạng ban đầu:
- **`Pagination.jsx`** (cho User):
  - Nhận props: `pageNumber`, `totalPages`, `onChange`.
  - Tự vẽ các thẻ `<button>` số trang bằng thuật toán `Math.max(1, pageNumber - 2)`.
  - Không hiển thị tổng số bản ghi, không dùng style chuẩn của hệ thống.
- **`CustomPagination.jsx`** (cho Admin):
  - Nhận props: `current`, `pageSize`, `total`, `onChange`.
  - Bọc component `<Pagination>` của Ant Design.
  - Hiển thị text "Hiển thị X–Y trong Z mục".

### Giải pháp kiến trúc đã thực thi:
1. **Tạo component duy nhất: [`AppPagination.jsx`](file:///d:/hoc%20tap/PTPMMNM/FE/Cafe/src/components/common/AppPagination.jsx)**
   - **Đa hình Props (Universal Props Interface):**
     - Nhận cả `current`, `page`, `pageNumber` (tự động fallback).
     - Nhận cả `total` (số lượng bản ghi chuẩn) lẫn `totalPages` (nếu trang chỉ trả về số trang thì tự tính `computedTotal = totalPages * pageSize`).
     - Có cờ `border` (false cho các trang giao diện khách, true kèm nền trắng viền xám cho các bảng dữ liệu Admin).
     - Có `showTotal` linh hoạt (tự động bật trên Admin có tổng số lượng rõ ràng, tắt trên trang khách để giữ độ tối giản).
     - Tự động ẩn nếu tổng số bản ghi `<= pageSize` hoặc chỉ có 1 trang (không render thừa).
2. **Đã chuẩn hóa trên 8 trang toàn hệ thống:**
   - `HomePage.jsx` (User)
   - `SearchPage.jsx` (User)
   - `OrderHistoryPage.jsx` (User)
   - `AdminProductPage.jsx` (Admin)
   - `AdminCategoryPage.jsx` (Admin)
   - `AdminSizePage.jsx` (Admin)
   - `AdminToppingPage.jsx` (Admin)
   - `AdminUsersPage.jsx` (Admin)
   - `AdminOrderPage.jsx` (Admin)
3. **Bảo toàn tính tương thích ngược (Zero-breaking change):**
   - Giữ lại `Pagination.jsx` và `CustomPagination.jsx` như các wrapper component trỏ về `AppPagination`. Nếu bất kỳ thành viên nào trong team vô tình import component cũ, hệ thống vẫn chạy ổn định 100%.

---

## 4. BẢNG CHECKLIST HÀNH ĐỘNG TIẾP THEO (ACTIONABLE ROADMAP)

### 🔴 Ưu tiên 1 (Cần chuẩn hóa tiếp theo)
- [ ] **Đồng bộ hóa Pagination phía Backend/Admin**:
  - Chuyển `AdminCategoryPage`, `AdminSizePage`, `AdminToppingPage` từ phân trang client (`slice`) sang nhận `pageNumber` / `pageSize` từ server API giống như `AdminProductPage` và `AdminUsersPage`.
- [ ] **Bổ sung `totalPages` vào `adminProductSlice.initialState`**:
  - Đồng bộ state shape với `productSlice` của user.
- [ ] **Sửa `AdminProductService.js`**:
  - Đổi `http.post(this.basePath, formData)` thành `this.post(...)` để qua đúng BaseServices layer.

### 🟡 Ưu tiên 2 (Cải thiện Clean Code & Maintainability)
- [ ] **Tách nhỏ các Monolithic Component**:
  - `AdminProductPage.jsx` (565 dòng) -> Tách `ProductFormModal.jsx` và `ProductSizesForm.jsx`.
  - `HomePage.jsx` (478 dòng) -> Tách `HomeHero.jsx`, `HomePromoBanner.jsx`, `HomeFeatureGrid.jsx`.
  - `ProductDetailPage.jsx` (638 dòng) -> Tách `ProductCustomizer.jsx` và `ToppingSelector.jsx`.
- [ ] **Chuẩn hóa Naming Convention trong Redux Actions**:
  - Quyết định dùng chung `fetch*` cho danh sách/chi tiết, `create*`, `update*`, `delete*` cho mọi thao tác CUD.

### 🟢 Ưu tiên 3 (Tối ưu hóa & Dọn dẹp)
- [ ] Đổi tên file `src/redux/store.jsx` -> `src/redux/store.js`.
- [ ] Xử lý hoặc dọn dẹp các component chưa sử dụng trong `adminShared.jsx`.
- [ ] Thêm Mobile Drawer Navigation cho `AdminTemplate.jsx` để responsive trọn vẹn trên điện thoại/máy tính bảng.
- [ ] Xóa bỏ các khối `try / catch` dư thừa bao quanh `dispatch(thunk())` tại các Page (vì `createAsyncThunk` không quăng ngoại lệ ra ngoài).

