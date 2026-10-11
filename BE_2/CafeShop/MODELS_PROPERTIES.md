# All Model Properties

### Address.cs
| Property | Type |
| --- | --- |
| AddressId | int |
| UserId | int |
| RecipientName | string |
| Phone | string? |
| FullAddress | string |
| IsDefault | bool |
| IsDeleted | bool |
| Latitude | double |
| Longitude | double |
| CreatedAt | DateTime |
| User | User? |
| Orders | ICollection<Order>? |

### Cart.cs
| Property | Type |
| --- | --- |
| CartId | int |
| UserId | int |
| Status | string |
| CreatedAt | DateTime |
| UpdatedAt | DateTime |
| User | User |
| CartItems | ICollection<CartItem> |

### CartItem.cs
| Property | Type |
| --- | --- |
| CartItemId | int |
| CartId | int |
| ProductId | int |
| SizeId | int? |
| Quantity | int |
| UnitPrice | decimal |
| Cart | Cart |
| Product | Product |
| Size | Size? |
| CartItemToppings | ICollection<CartItemTopping> |

### CartItemTopping.cs
| Property | Type |
| --- | --- |
| CartItemToppingId | int |
| CartItemId | int |
| ToppingId | int |
| Quantity | int |
| UnitPrice | decimal |
| CartItem | CartItem |
| Topping | Topping |

### Category.cs
| Property | Type |
| --- | --- |
| CategoryId | int |
| Name | string |
| Description | string? |
| Products | ICollection<Product>? |

### Feedback.cs
| Property | Type |
| --- | --- |
| FeedbackId | int |
| ProductId | int |
| UserId | int |
| OrderDetailId | int |
| Rating | int |
| Comment | string? |
| CreatedAt | DateTime |
| IsVisible | bool |
| Product | Product? |
| User | User? |
| OrderDetail | OrderDetail? |

### News.cs
| Property | Type |
| --- | --- |
| NewsId | int |
| UserId | int |
| Title | string? |
| Slug | string? |
| Summary | string? |
| Content | string? |
| ImageUrl | string? |
| Status | string? |
| ScheduledPublishAt | DateTime? |
| PublishedAt | DateTime? |
| CreatedAt | DateTime |
| UpdatedAt | DateTime? |
| IsDeleted | bool |
| ViewCount | int |
| User | User? |

### Order.cs
| Property | Type |
| --- | --- |
| OrderId | int |
| UserId | int |
| AddressId | int |
| RecipientName | string? |
| Phone | string? |
| FullAddress | string? |
| OrderDate | DateTime |
| SubTotal | decimal |
| TotalAmount | decimal |
| PaymentMethod | string? |
| PaymentStatus | string |
| CurrentStatus | string? |
| Note | string? |
| VoucherId | int? |
| OrderDiscount | decimal |
| ShippingDiscount | decimal |
| User | User? |
| Voucher | Voucher? |
| Address | Address? |
| ShippingFee | decimal |
| DistanceKm | double |
| OrderDetails | ICollection<OrderDetail>? |
| StatusHistories | ICollection<OrderStatusHistory>? |
| Payments | ICollection<Payment>? |

### OrderDetail.cs
| Property | Type |
| --- | --- |
| OrderDetailId | int |
| OrderId | int |
| ProductId | int |
| SizeId | int? |
| Quantity | int |
| UnitPrice | decimal |
| Note | string? |
| Order | Order? |
| Product | Product? |
| Size | Size? |
| Feedbacks | ICollection<Feedback>? |
| OrderDetailToppings | ICollection<OrderDetailTopping>? |

### OrderDetailTopping.cs
| Property | Type |
| --- | --- |
| Id | int |
| OrderDetailId | int |
| ToppingId | int |
| Quantity | int |
| UnitPrice | decimal |
| OrderDetail | OrderDetail? |
| Topping | Topping? |

### OrderStatusHistory.cs
| Property | Type |
| --- | --- |
| HistoryId | int |
| OrderId | int |
| Status | string? |
| ChangedBy | int |
| ChangedAt | DateTime |
| Note | string? |
| Order | Order? |
| UserAction | User? |

### Payment.cs
| Property | Type |
| --- | --- |
| PaymentId | int |
| OrderId | int |
| PaymentMethod | string |
| PaymentProvider | string? |
| TransactionCode | string? |
| Amount | decimal |
| PaymentStatus | string |
| PaidAt | DateTime? |
| ErrorMessage | string? |
| CreatedAt | DateTime |
| Order | Order? |

### Permission.cs
| Property | Type |
| --- | --- |
| PermissionId | int |
| Code | string |
| Module | string |
| Description | string? |
| RolePermissions | ICollection<RolePermission>? |

### Product.cs
| Property | Type |
| --- | --- |
| ProductId | int |
| CategoryId | int |
| Name | string |
| BasePrice | decimal |
| ImageUrl | string? |
| ImagePublicId | string? |
| Description | string? |
| IsAvailable | bool |
| StockQuantity | int |
| Category | Category? |
| ProductSizes | ICollection<ProductSize>? |
| ProductToppings | ICollection<ProductTopping>? |
| Feedbacks | ICollection<Feedback>? |

### ProductSize.cs
| Property | Type |
| --- | --- |
| ProductId | int |
| SizeId | int |
| Price | decimal? |
| StockQuantity | int |
| Product | Product? |
| Size | Size? |

### ProductTopping.cs
| Property | Type |
| --- | --- |
| ProductId | int |
| ToppingId | int |
| Product | Product? |
| Topping | Topping? |

### Role.cs
| Property | Type |
| --- | --- |
| RoleId | int |
| Name | string |
| Description | string? |
| UserRoles | ICollection<UserRole>? |
| RolePermissions | ICollection<RolePermission>? |

### RolePermission.cs
| Property | Type |
| --- | --- |
| RoleId | int |
| PermissionId | int |
| Role | Role |
| Permission | Permission |

### ShippingConfig.cs
| Property | Type |
| --- | --- |
| Id | int |
| BaseFee | decimal |
| BaseDistanceKm | double |
| ExtraFeePerKm | decimal |
| MaxDistanceKm | double |
| IsFreeShippingEnabled | bool |
| FreeShippingThreshold | decimal |
| NightSurcharge | decimal |
| NightHourStart | int |
| NightHourEnd | int |
| PeakHourSurcharge | decimal |
| PeakHourStart | int |
| PeakHourEnd | int |
| WeekendSurcharge | decimal |

### Size.cs
| Property | Type |
| --- | --- |
| SizeId | int |
| Name | string |
| ProductSizes | ICollection<ProductSize>? |

### Topping.cs
| Property | Type |
| --- | --- |
| ToppingId | int |
| Name | string |
| Price | decimal? |
| Unit | string |
| ImageUrl | string? |
| StockQuantity | int |
| IsAvailable | bool |
| ProductToppings | ICollection<ProductTopping>? |

### User.cs
| Property | Type |
| --- | --- |
| UserId | int |
| Username | string |
| PasswordHash | string |
| FullName | string? |
| PhoneNumber | string? |
| Email | string? |
| AvatarUrl | string? |
| AvatarPublicId | string? |
| RefreshToken | string? |
| RefreshTokenExpiryTime | DateTime? |
| IsActive | bool |
| CreatedAt | DateTime |
| Orders | ICollection<Order>? |
| Feedbacks | ICollection<Feedback>? |
| Addresses | ICollection<Address>? |
| Cart | Cart? |
| UserRoles | ICollection<UserRole>? |

### UserRole.cs
| Property | Type |
| --- | --- |
| UserId | int |
| RoleId | int |
| User | User |
| Role | Role |

### UserVoucher.cs
| Property | Type |
| --- | --- |
| Id | int |
| UserId | int |
| VoucherId | int |
| UsageLimitPerUser | int |
| UsedCount | int |
| AssignedDate | DateTime |
| Voucher | Voucher |

### Voucher.cs
| Property | Type |
| --- | --- |
| VoucherId | int |
| Code | string? |
| Description | string |
| TargetType | string |
| ApplyType | string |
| DiscountType | string? |
| DiscountValue | decimal |
| MinOrderValue | decimal |
| MaxDiscountAmount | decimal |
| StartDate | DateTime |
| EndDate | DateTime |
| UsageLimit | int |
| UsedCount | int |
| IsActive | bool |
| UserVouchers | ICollection<UserVoucher> |


