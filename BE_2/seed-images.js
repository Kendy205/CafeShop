const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// 1. Cấu hình Cloudinary của bạn
cloudinary.config({
  cloud_name: 'dver7jg4e',
  api_key: '985284823471871',
  api_secret: 'E_fHeiJdZPF0qKHQ11GbYCDRDBc'
});

// 2. Danh sách 10 Topping kèm từ khóa tìm ảnh chuẩn xác 100%
const toppings = [
  { id: 1, name: 'Trân châu đen', query: 'Tapioca pearls bubble tea' },
  { id: 2, name: 'Trân châu trắng', query: 'White tapioca boba pearls' },
  { id: 3, name: 'Thạch dừa', query: 'Nata de coco' },
  { id: 4, name: 'Thạch trái cây', query: 'Fruit jelly cubes dessert' },
  { id: 5, name: 'Pudding trứng', query: 'Custard pudding caramel' },
  { id: 6, name: 'Sương sáo', query: 'Grass jelly cubes' },
  { id: 7, name: 'Kem cheese', query: 'Cheese foam tea macchiato' },
  { id: 8, name: 'Whipping cream', query: 'Whipped cream drink topping' },
  { id: 9, name: 'Đào miếng', query: 'Sliced peaches syrup' },
  { id: 10, name: 'Shot espresso', query: 'Espresso shot glass' }
];

// 3. Danh sách 30 Đồ uống (Đã bỏ toàn bộ bánh & đồ ăn vặt)
const products = [
  // --- Category 1: Cà phê (1 - 5) ---
  { id: 1, name: 'Cà phê đen đá', query: 'Iced black coffee glass' },
  { id: 2, name: 'Cà phê sữa đá', query: 'Vietnamese iced coffee condensed milk' },
  { id: 3, name: 'Bạc xỉu', query: 'Iced white coffee layered milk' },
  { id: 4, name: 'Cappuccino', query: 'Cappuccino cup foam' },
  { id: 5, name: 'Latte', query: 'Caffe latte art cup' },

  // --- Category 2: Trà trái cây (6 - 10) ---
  { id: 6, name: 'Trà đào cam sả', query: 'Peach iced tea glass' },
  { id: 7, name: 'Trà vải hoa hồng', query: 'Lychee iced tea drink' },
  { id: 8, name: 'Trà chanh mật ong', query: 'Honey lemon iced tea' },
  { id: 9, name: 'Trà oolong dâu tây', query: 'Strawberry iced tea glass' },
  { id: 10, name: 'Trà nhiệt đới', query: 'Tropical fruit iced tea' },

  // --- Category 3: Trà sữa (11 - 15) ---
  { id: 11, name: 'Trà sữa trân châu đường đen', query: 'Brown sugar pearl milk tea' },
  { id: 12, name: 'Trà sữa truyền thống', query: 'Bubble milk tea pearls' },
  { id: 13, name: 'Trà sữa matcha', query: 'Iced matcha bubble milk tea' },
  { id: 14, name: 'Trà sữa khoai môn', query: 'Taro bubble milk tea purple' },
  { id: 15, name: 'Hồng trà sữa macchiato', query: 'Black tea macchiato foam' },

  // --- Category 4: Sinh tố (16 - 20) ---
  { id: 16, name: 'Sinh tố bơ', query: 'Avocado smoothie glass' },
  { id: 17, name: 'Sinh tố xoài', query: 'Mango smoothie glass' },
  { id: 18, name: 'Sinh tố dâu', query: 'Strawberry smoothie glass' },
  { id: 19, name: 'Sinh tố chuối yến mạch', query: 'Banana smoothie glass' },
  { id: 20, name: 'Sinh tố việt quất', query: 'Blueberry smoothie glass' },

  // --- Category 5: Đá xay (21 - 25) ---
  { id: 21, name: 'Cookie đá xay', query: 'Oreo cookies and cream milkshake' },
  { id: 22, name: 'Matcha đá xay', query: 'Matcha green tea frappuccino whipped cream' },
  { id: 23, name: 'Cà phê đá xay', query: 'Coffee frappuccino whipped cream' },
  { id: 24, name: 'Socola đá xay', query: 'Chocolate milkshake whipped cream' },
  { id: 25, name: 'Chanh tuyết', query: 'Frozen lemonade slush glass' },

  // --- Category 6: Nước ép (26 - 30) ---
  { id: 26, name: 'Nước ép cam', query: 'Fresh orange juice glass' },
  { id: 27, name: 'Nước ép dưa hấu', query: 'Watermelon juice glass' },
  { id: 28, name: 'Nước ép ổi', query: 'Guava juice glass' },
  { id: 29, name: 'Nước ép cà rốt táo', query: 'Carrot juice glass' },
  { id: 30, name: 'Nước ép cần tây táo', query: 'Green celery juice glass' }
];

// Hàm tự động tìm ảnh thật trên Wikimedia Commons & tải buffer về để tránh lỗi link chết 404/403
async function fetchVerifiedImageBuffer(searchQuery) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=filetype:bitmap|drawing%20${encodeURIComponent(searchQuery)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json`;

  const res = await fetch(apiUrl, {
    headers: { 'User-Agent': 'CafeShopImageUpdater/1.0 (contact@cafeshop.local)' }
  });
  const data = await res.json();

  if (!data.query || !data.query.pages) {
    throw new Error(`Không tìm thấy ảnh cho từ khóa: ${searchQuery}`);
  }

  const pages = Object.values(data.query.pages);
  for (const page of pages) {
    const imgUrl = page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url;
    if (imgUrl && (imgUrl.endsWith('.jpg') || imgUrl.endsWith('.jpeg') || imgUrl.endsWith('.png'))) {
      // Kiểm tra tải thử ảnh về bộ nhớ đệm để chắc chắn 100% link sống
      const imgRes = await fetch(imgUrl, {
        headers: { 'User-Agent': 'CafeShopImageUpdater/1.0 (contact@cafeshop.local)' }
      });
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        return {
          dataUri: `data:${mimeType};base64,${base64Data}`,
          sourceUrl: imgUrl
        };
      }
    }
  }
  throw new Error(`Tất cả link ảnh cho "${searchQuery}" đều không khả dụng.`);
}

async function runUpload() {
  console.log('🚀 Bắt đầu tìm kiếm, xác thực ảnh sống và tải lên Cloudinary...');
  let sqlQueries = '-- CẬP NHẬT ẢNH CHUẨN XÁC CHO 10 TOPPINGS VÀ 30 ĐỒ UỐNG CAFESHOP\n\n';

  // 1. Upload 10 Toppings
  for (const item of toppings) {
    try {
      const { dataUri, sourceUrl } = await fetchVerifiedImageBuffer(item.query);
      const res = await cloudinary.uploader.upload(dataUri, {
        folder: 'cafeshop/toppings',
        public_id: `topping_${item.id}`,
        overwrite: true
      });
      sqlQueries += `UPDATE Toppings SET ImageUrl = '${res.secure_url}' WHERE ToppingId = ${item.id};\n`;
      console.log(`✅ Topping [${item.id}] ${item.name} -> Đã kiểm tra & Upload thành công (${sourceUrl})`);
    } catch (err) {
      console.error(`❌ Topping [${item.id}] ${item.name}:`, err.message);
    }
  }

  sqlQueries += '\n-- CẬP NHẬT 30 SẢN PHẨM ĐỒ UỐNG\n';

  // 2. Upload 30 Products (Đồ uống)
  for (const item of products) {
    try {
      const { dataUri, sourceUrl } = await fetchVerifiedImageBuffer(item.query);
      const res = await cloudinary.uploader.upload(dataUri, {
        folder: 'cafeshop/products',
        public_id: `product_${item.id}`,
        overwrite: true
      });
      sqlQueries += `UPDATE Products SET ImageUrl = '${res.secure_url}', ImagePublicId = '${res.public_id}', IsDeleted = 0, IsAvailable = 1 WHERE ProductId = ${item.id};\n`;
      console.log(`✅ Product [${item.id}] ${item.name} -> Đã kiểm tra & Upload thành công (${sourceUrl})`);
    } catch (err) {
      console.error(`❌ Product [${item.id}] ${item.name}:`, err.message);
    }
  }

  // 3. Ẩn (Soft Delete) các sản phẩm từ ID 31 trở đi (Bánh ngọt, Bánh mặn, Đồ ăn nhẹ...)
  sqlQueries += '\n-- ẨN CÁC SẢN PHẨM BÁNH & ĐỒ ĂN VẶT NGOÀI 30 MÓN NƯỚC TRÊN\n';
  sqlQueries += `UPDATE Products SET IsDeleted = 1, IsAvailable = 0 WHERE ProductId > 30;\n`;

  fs.writeFileSync('update_images.sql', sqlQueries);
  console.log('\n🎉 ĐÃ CẬP NHẬT XONG! Mở file "update_images.sql" và chạy trong Database.');
}

runUpload();