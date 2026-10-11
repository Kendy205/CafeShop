---
description: 
---

ARCHITECTURE.md

CAFE SHOP ASP.NET CORE BACKEND

1. TECH STACK

.NET 8, ASP.NET Core Web API, C#, Entity Framework Core, MySQL, Repository Pattern, UnitOfWork, DTO, AutoMapper, Redis, JWT Bearer, Authorization/Role, SignalR, Cloudinary, Swagger/OpenAPI, xUnit, Moq, Docker/Compose.

2. RUNTIME / PROGRAM.CS

ApplicationDbContext dùng MySQL qua UseMySql + ServerVersion.AutoDetect.
AutoMapper scan mapping từ Program assembly.
IUnitOfWork → UnitOfWork.
Redis: IDistributedCache + StackExchange.Redis IConnectionMultiplexer + IRedisCacheService; InstanceName hiện tại: CafeShop_.
Các User/Admin/Public Service được DI Scoped.
CORS policy FE cho localhost ports 5173/3000/5174 theo Program.cs.
JWT Bearer validate Issuer, Audience, Lifetime, SigningKey.
CloudinarySettings bind từ configuration.
Controllers dùng JsonSerializer ReferenceHandler.IgnoreCycles.
Swagger chỉ bật khi Development.
SignalR enabled; NotificationHub route: /hubs/notification.
Pipeline: HTTPS → CORS → Authentication → Authorization → Controllers/Hub.

3. LAYER FLOW

HTTP Request → Controller → Service Interface → Service → Repository/UnitOfWork → EF Core → MySQL.
Response: Entity/data → Service business processing + mapping → Response DTO → Controller → HTTP Response.
Infrastructure side effects như Redis, Cloudinary, SignalR phải đi qua abstraction/service hiện có khi project đã có.

4. CONTROLLER

Chỉ xử lý HTTP boundary.
Được: route, model binding, request validation integration, claims, authorization, gọi Service, trả HTTP response.
Không: business logic phức tạp, DbContext trực tiếp, EF query trực tiếp, Redis/Cloudinary SDK trực tiếp khi đã có abstraction, trả Entity persistence trực tiếp khi dùng DTO.

5. DTO

Request/Response API dùng DTO.
DTO là contract, không expose Entity/navigation graph chỉ vì tiện.
Validation input theo convention hiện tại; business validation thuộc Service.
Không dùng DTO để che giấu business rule.

6. SERVICE

Service chịu business logic, orchestration, business validation và side effects phù hợp.
Service phụ thuộc interface/abstraction.
Không inject/call ApplicationDbContext trực tiếp.
Không chứa persistence implementation detail không cần thiết.
Async end-to-end cho I/O.

7. REPOSITORY + UNITOFWORK

Repository chịu query/data access/persistence.
UnitOfWork là entry point quản lý repositories và persistence lifecycle theo implementation hiện tại.
Query mới phải kiểm tra repository hiện tại trước.
Nếu cần query phức tạp với Include/ThenInclude/filter/sort/paging, ưu tiên Repository/query abstraction phù hợp; không bypass bằng DbContext trong Service.

8. API CONTRACT

Trước khi code API mới phải xác định: Purpose, Actor, Authentication, Authorization/Ownership, Method, Route, Path Params, Query Params, Request DTO, Validation, Business Rules, Response DTO, Success Status, Error Statuses, Error Body, Pagination, Filter, Search, Sort, Side Effects, Transaction, Concurrency, Cache, Logging, Tests.
Không breaking change API cũ khi chưa được User approve.

9. STATUS CODE

Theo convention hiện tại. Thông thường: 200/201 success, 400 invalid request, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 500 unexpected error.
Không tự tạo status-code convention mới nếu project chưa thống nhất.

10. ERROR CONTRACT

Error response phải nhất quán với project.
Không trả stack trace, SQL/internal exception, secret hoặc dữ liệu nhạy cảm.
Exception handling phải theo mechanism hiện tại; không nuốt exception.

11. AUTHORIZATION

JWT Bearer là auth mechanism hiện tại.
Mỗi protected endpoint phải xác định cần authenticated, role/permission và/hoặc ownership.
Backend tự kiểm tra quyền.
NotificationHub nhận token từ query access_token khi path bắt đầu /hubs/notification theo cấu hình hiện tại.

12. REDIS

IRedisCacheService là abstraction cho distributed cache.
IConnectionMultiplexer dùng cho Redis-native operations cần thiết như INCR, SET NX/lock, SCAN theo implementation.
Mọi cache phải có key convention, TTL, scope, invalidation và concurrency consideration.
Không cache dữ liệu cá nhân/quyền hạn bằng key quá rộng.

13. SIGNALR

SignalR dùng realtime communication.
Hub hiện tại: NotificationHub.
Business logic lớn không đặt trong Hub; orchestration qua SignalR service/abstraction hiện tại.

14. DATABASE

MySQL + EF Core.
Migration phải được review trước khi chạy.
Không destructive migration chưa được approve.
Filter/search/sort/paging phải đánh giá index, query plan, N+1 và data volume.
Không ToList/ToListAsync sớm nếu có thể filter/paging tại database.

15. AUTOMAPPER

Reuse mapping profile hiện tại.
Mapping chỉ chuyển đổi dữ liệu; không dùng mapping để quyết định business rule.

16. CLOUDINARY

CloudinarySettings lấy từ configuration.
Upload/delete/media nên đi qua PhotoService hoặc abstraction hiện tại.
Không hard-code credential.

17. DI / NAMING

Tuân theo naming, namespace, folder và lifetime đang tồn tại.
Service thường Scoped theo Program.cs hiện tại.
Không tự tạo pattern mới nếu pattern tương đương đã tồn tại.

18. NEW API TEMPLATE

Controller: HTTP + binding + auth + validation boundary + Service call + response.
Service: business rules + orchestration + Repository/UoW + mapping/side effects.
Repository: query + persistence.
DTO: request/response contract.
Tests: Service unit tests; integration tests khi cần.

19. QUALITY GATE

API mới phải kiểm tra: đúng layer, DTO, validation, authentication, authorization, error handling, async, UoW/Repository, transaction/concurrency, performance, pagination, cache, logging, Swagger, tests và breaking changes.

20. SOURCE OF TRUTH

Program.cs/code thực tế quyết định runtime behavior.
AGENTS.md quyết định workflow của Agent.
ARCHITECTURE.md mô tả nguyên tắc kiến trúc.
User requirement có ưu tiên cao nhất.
Nếu docs và code mâu thuẫn: không đoán, phải xác minh và hỏi User.