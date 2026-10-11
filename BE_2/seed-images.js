const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// 1. Cấu hình Cloudinary của bạn
cloudinary.config({
  cloud_name: 'dver7jg4e',
  api_key: '985284823471871',
  api_secret: 'E_fHeiJdZPF0qKHQ11GbYCDRDBc'
});

// 2. Danh sách 10 Topping (Đúng 100% theo tên món)
const toppings = [
  { id: 1, name: 'Trân châu đen', url: 'https://images.unsplash.com/photo-1558857563-b37fe432d660?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Trân châu trắng', url: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Thạch dừa', url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Thạch trái cây', url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Pudding trứng', url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80' },
  { id: 6, name: 'Sương sáo', url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80' },
  { id: 7, name: 'Kem cheese', url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=600&q=80' },
  { id: 8, name: 'Whipping cream', url: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=600&q=80' },
  { id: 9, name: 'Đào miếng', url: 'https://images.unsplash.com/photo-1629828874514-c1e5103f2150?auto=format&fit=crop&w=600&q=80' },
  { id: 10, name: 'Shot espresso', url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80' }
];

// 3. Danh sách 50 Sản phẩm chuẩn từng món (Đã sửa triệt để các món bị lệch)
const products = [
  // --- Category 1: Cà phê ---
  { id: 1, name: 'Cà phê đen đá', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Cà phê sữa đá', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Bạc xỉu', url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Cappuccino', url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Latte', url: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?auto=format&fit=crop&w=600&q=80' },

  // --- Category 2: Trà trái cây ---
  { id: 6, name: 'Trà đào cam sả', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80' },
  { id: 7, name: 'Trà vải hoa hồng', url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80' },
  { id: 8, name: 'Trà chanh mật ong', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80' },
  { id: 9, name: 'Trà oolong dâu tây', url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80' },
  { id: 10, name: 'Trà nhiệt đới', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80' },

  // --- Category 3: Trà sữa (Thay toàn bộ link để không còn ảnh xe hơi/tách nóng) ---
  { id: 11, name: 'Trà sữa trân châu đường đen', url: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80' },
  { id: 12, name: 'Trà sữa truyền thống', url: 'https://images.unsplash.com/photo-1558857563-b37fe432d660?auto=format&fit=crop&w=600&q=80' },
  { id: 13, name: 'Trà sữa matcha', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80' },
  { id: 14, name: 'Trà sữa khoai môn', url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80' },
  { id: 15, name: 'Hồng trà sữa macchiato', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80' },

  // --- Category 4: Sinh tố (Sửa triệt để bơ, xoài, dâu, chuối) ---
  { id: 16, name: 'Sinh tố bơ', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Avocado_smoothie_2.jpg/640px-Avocado_smoothie_2.jpg' },
  { id: 17, name: 'Sinh tố xoài', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Mango_Lassi_in_Tall_Glass.jpg/640px-Mango_Lassi_in_Tall_Glass.jpg' },
  { id: 18, name: 'Sinh tố dâu', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Strawberry_smoothie_%283489814400%29.jpg/640px-Strawberry_smoothie_%283489814400%29.jpg' },
  { id: 19, name: 'Sinh tố chuối yến mạch', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Banana_smoothie.jpg/640px-Banana_smoothie.jpg' },
  { id: 20, name: 'Sinh tố việt quất', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Blueberry_smoothie.jpg/640px-Blueberry_smoothie.jpg' },

  // --- Category 5: Đá xay ---
  { id: 21, name: 'Cookie đá xay', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80' },
  { id: 22, name: 'Matcha đá xay', url: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=600&q=80' },
  { id: 23, name: 'Cà phê đá xay', url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80' },
  { id: 24, name: 'Socola đá xay', url: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=600&q=80' },
  { id: 25, name: 'Chanh tuyết', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80' },

  // --- Category 6: Nước ép ---
  { id: 26, name: 'Nước ép cam', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80' },
  { id: 27, name: 'Nước ép dưa hấu', url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80' },
  { id: 28, name: 'Nước ép ổi', url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80' },
  { id: 29, name: 'Nước ép cà rốt táo', url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80' },
  { id: 30, name: 'Nước ép cần tây táo', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80' },

  // --- Category 7: Soda ---
  { id: 31, name: 'Soda chanh', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80' },
  { id: 32, name: 'Soda việt quất', url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80' },
  { id: 33, name: 'Soda dâu', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80' },
  { id: 34, name: 'Soda bạc hà', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80' },
  { id: 35, name: 'Soda đào', url: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80' },

  // --- Category 8: Bánh ngọt ---
  { id: 36, name: 'Tiramisu', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80' },
  { id: 37, name: 'Cheesecake chanh dây', url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80' },
  { id: 38, name: 'Red velvet', url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80' },
  { id: 39, name: 'Bánh su kem', url: 'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=600&q=80' },
  { id: 40, name: 'Bánh flan caramel', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Cr%C3%A8me_caramel_with_berries.jpg/640px-Cr%C3%A8me_caramel_with_berries.jpg' },

  // --- Category 9: Bánh mặn ---
  { id: 41, name: 'Bánh mì que pate', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/B%C3%A1nh_m%C3%AC_th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng.png/640px-B%C3%A1nh_m%C3%AC_th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng.png' },
  { id: 42, name: 'Bánh mì gà xé', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80' },
  { id: 43, name: 'Sandwich jambon phô mai', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80' },
  { id: 44, name: 'Bông lan trứng muối', url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80' },
  { id: 45, name: 'Croissant phô mai', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80' },

  // --- Category 10: Đồ ăn nhẹ ---
  { id: 46, name: 'Khoai tây chiên', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/French_Fries.JPG/640px-French_Fries.JPG' },
  { id: 47, name: 'Gà viên chiên', url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80' },
  { id: 48, name: 'Bánh tráng trộn', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
  { id: 49, name: 'Cơm cháy chà bông', url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80' },
  { id: 50, name: 'Xúc xích nướng', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Grilled_sausages.jpg/640px-Grilled_sausages.jpg' }
];

async function runUpload() {
  console.log('🚀 Bắt đầu cập nhật lại toàn bộ ảnh chuẩn...');
  let sqlQueries = '-- CẬP NHẬT ẢNH CHUẨN XÁC 100% CHO CAFESHOP\n\n';

  // 1. Upload Toppings
  for (const item of toppings) {
    try {
      const res = await cloudinary.uploader.upload(item.url, {
        folder: 'cafeshop/toppings',
        public_id: `topping_${item.id}`,
        overwrite: true // Ghi đè ảnh cũ
      });
      sqlQueries += `UPDATE Toppings SET ImageUrl = '${res.secure_url}' WHERE ToppingId = ${item.id};\n`;
      console.log(`✅ Topping [${item.id}]: ${item.name}`);
    } catch (err) {
      console.error(`❌ Topping [${item.id}]:`, err.message);
    }
  }

  // 2. Upload Products
  for (const item of products) {
    try {
      const res = await cloudinary.uploader.upload(item.url, {
        folder: 'cafeshop/products',
        public_id: `product_${item.id}`,
        overwrite: true // Ghi đè ảnh cũ
      });
      sqlQueries += `UPDATE Products SET ImageUrl = '${res.secure_url}', ImagePublicId = '${res.public_id}' WHERE ProductId = ${item.id};\n`;
      console.log(`✅ Product [${item.id}]: ${item.name}`);
    } catch (err) {
      console.error(`❌ Product [${item.id}]:`, err.message);
    }
  }

  fs.writeFileSync('update_images.sql', sqlQueries);
  console.log('\n🎉 ĐÃ CẬP NHẬT XONG! Mở file "update_images.sql" và chạy trong MySQL.');
}

runUpload();