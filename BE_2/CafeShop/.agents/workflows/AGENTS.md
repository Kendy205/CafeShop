---
description: 
---

AGENTS.md

CAFE SHOP BACKEND AGENT WORKFLOW

1. RULE GỐC

Mọi task phải theo: UNDERSTAND → ANALYZE → ASK → PLAN → EXPLAIN → CONFIRM → IMPLEMENT → TEST → REVIEW → REPORT.
Chỉ code sau khi User xác nhận kế hoạch.
Trước approval: KHÔNG sửa code, tạo file, migration, cài package, commit, push.

2. ĐỌC PROJECT

Kiểm tra solution/project structure, .csproj, Program.cs, configuration, Controller, DTO, Entity, Service, Repository, UnitOfWork, DbContext, Redis, Auth, SignalR, Cloudinary và Tests liên quan.
Tìm flow và dependency đầy đủ, không mở một file rồi sửa ngay.

3. KHÔNG ĐOÁN

Điểm chưa rõ phải hỏi User. Nếu có nhiều thiết kế hợp lý, nêu option + trade-off và chờ User chọn.
Issue ngoài scope chỉ được báo, không tự tiện refactor.

4. KIẾN TRÚC

Controller → Service → Repository/UnitOfWork → EF Core → MySQL.
Controller xử lý HTTP boundary, binding, authorization, gọi Service và HTTP response.
Service xử lý business logic, orchestration, business validation và transaction theo convention.
Repository xử lý data access/query/persistence.
UnitOfWork quản lý repository và SaveChanges/transaction theo implementation hiện tại.
DTO là API contract. Không expose persistence Entity trực tiếp nếu project dùng DTO.
Không inject/call ApplicationDbContext trực tiếp từ Controller/Service.
Không đưa EF-specific query/Include/ThenInclude phức tạp vào Service nếu làm lộ persistence detail.

5. QUY TRÌNH API MỚI

Xác định resource/use case/actor/ownership.

Tìm API, Service, Repository tương tự để reuse.

Đặc tả HTTP method, route, path/query params, request DTO, validation, response DTO, status code, error contract.

Xác định Service interface + implementation.

Kiểm tra Repository/UoW; chỉ thêm method khi abstraction hiện tại chưa đáp ứng.

Xác định business rules, transaction, concurrency, side effects.

Với collection: paging/filter/search/sort + giới hạn dữ liệu.

Kiểm tra JWT, role, permission, ownership.

Đánh giá Redis/cache, SignalR, Cloudinary nếu liên quan.

Đánh giá DB schema, migration, index, N+1 và query performance.

Lập test cases.

Trình bày plan và CHỜ CONFIRM.

6. API SPEC BẮT BUỘC

Mỗi API mới phải mô tả: Purpose, Actor, Auth, Authorization, Method, Route, Parameters, Request DTO, Validation, Business Rules, Response DTO, Success Status, Error Statuses, Error Body, Pagination/Filter/Search/Sort, Side Effects, Transaction, Concurrency, Cache, Logging, Tests.
Không tự ý thay đổi API cũ hoặc tạo breaking change.

7. PLAN TRƯỚC CODE

TASK ANALYSIS

Understanding: ...
Current architecture/flow: ...
Relevant files: ...
Requirement/root cause: ...
API contract: ...
Architecture compliance: ...
Database impact: ...
Security: ...
Performance: ...
Tests: ...
Questions/ambiguities: ...
Proposed design: ...
Files to change/add: ...
Risks: ...
Approval: Chưa thay đổi code. Chờ User xác nhận.

8. IMPLEMENTATION

Chỉ code sau approval.
Ưu tiên reuse existing code/abstraction.
Minimal change, không sửa module ngoài scope.
Không thêm dependency nếu chưa kiểm tra và chưa được approve.
Giữ convention naming, folder, DI, async, mapping, logging và error handling hiện tại.

9. DATABASE

Mọi schema change phải phân tích Entity → Mapping → Migration → Database → Query/Index.
Không drop/rename/delete/destructive migration nếu chưa được User approve.

10. AUTH + SECURITY

Mọi endpoint phải kiểm tra authentication, authorization, role/permission, ownership, input validation và data exposure.
Backend phải tự bảo vệ API; không dựa vào frontend.
Không trả stack trace, SQL detail hoặc secret.

11. REDIS

Dùng IRedisCacheService cho distributed cache.
Dùng IConnectionMultiplexer cho Redis-native operation theo implementation hiện tại như INCR, SET NX/lock, SCAN.
Mỗi cache phải xác định key, scope, TTL, invalidation và stale-data risk.

12. SIGNALR

Hub hiện tại: /hubs/notification.
Không đặt business logic lớn trong Hub; dùng abstraction/service hiện tại.
JWT hỗ trợ đọc access_token từ query cho NotificationHub theo Program.cs hiện tại.

13. TEST

Dùng xUnit + Moq theo convention hiện tại.
Tên test: [Method][InputState][ExpectedResult].
Test happy path, invalid input, null/empty, not found, duplicate, unauthorized/forbidden, boundary và business rules phù hợp.
Task ảnh hưởng DB/Redis/Auth/API/SignalR thì xem xét integration test.

14. REVIEW

Kiểm tra đúng layer, DTO, auth, validation, exception, logging, async, transaction, N+1, paging, cache, index, tests và breaking changes.

15. FINAL REPORT

Implemented: ...
Files changed: ...
API contract: ...
Architecture flow: ...
Tests/build: ...
Known issues: ...
Không báo hoàn thành nếu còn lỗi đã biết.