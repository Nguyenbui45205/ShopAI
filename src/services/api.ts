export type CategoryId = 'all' | 'electronics' | 'fashion' | 'home';

export type Product = {
  id: number;
  name: string;
  price: number;
  category: Exclude<CategoryId, 'all'>;
  categoryName: string;
  barcode: string;
  description: string;
  image: string;
};

export const API_BASE_URL = 'http://10.0.2.2:3000';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Tai nghe Bluetooth Chống Ồn AI',
    price: 890000,
    category: 'electronics',
    categoryName: 'Điện tử',
    barcode: '8930001',
    description: 'Tai nghe không dây chống ồn chủ động ANC, âm bass sâu, pin 30 giờ.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'Bàn phím Cơ Không Dây RGB',
    price: 1250000,
    category: 'electronics',
    categoryName: 'Điện tử',
    barcode: '8930002',
    description: 'Switch Hotswap êm ái, LED RGB 16.8 triệu màu, kết nối 3 chế độ Bluetooth / 2.4GHz / Type-C.',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Áo Khoác Gió Chống Nước Unisex',
    price: 350000,
    category: 'fashion',
    categoryName: 'Thời trang',
    barcode: '8930003',
    description: 'Vải dù 2 lớp trượt nước cao cấp, thoáng khí, chống tia UV khi đi ngoài trời.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    name: 'Đèn Bàn Học Thông Minh Cảm Ứng',
    price: 420000,
    category: 'home',
    categoryName: 'Gia dụng',
    barcode: '8930004',
    description: 'Đèn LED chống cận 3 chế độ nhiệt màu bảo vệ mắt, chạm cảm ứng tăng giảm độ sáng.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    name: 'Bình Giữ Nhiệt Hiển Thị Nhiệt Độ',
    price: 195000,
    category: 'home',
    categoryName: 'Gia dụng',
    barcode: '8930005',
    description: 'Inox 304 an toàn thực phẩm, giữ nhiệt 12 giờ, chạm nắp cảm ứng báo nhiệt độ nước.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
  },
];

export const validateProductSchema = (data: any[]): Product[] => {
  if (!Array.isArray(data)) throw new Error('ZOD_VALIDATION_ERROR: Dữ liệu không phải mảng');
  for (const item of data) {
    if (typeof item.id !== 'number' || typeof item.name !== 'string' || typeof item.price !== 'number') {
      throw new Error('ZOD_VALIDATION_ERROR: Sai cấu trúc Schema sản phẩm');
    }
  }
  return data as Product[];
};

export const fetchProductsApi = (
  simulateError: 'none' | 'network' | 'zod' = 'none'
): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simulateError === 'network') {
        reject(new Error('NETWORK_ERROR: Không thể kết nối máy chủ'));
      } else if (simulateError === 'zod') {
        try {
          validateProductSchema([{ id: 'sai_kieu', name: 123 }] as any);
        } catch (err) {
          reject(err);
        }
      } else {
        resolve(validateProductSchema(MOCK_PRODUCTS));
      }
    }, 400);
  });
};

export const loginApi = async (email: string, password: string) => {
  return new Promise<{ token: string; user: { email: string; name: string } }>((resolve, reject) => {
    setTimeout(() => {
      if (!email.includes('@') || password.length < 3) {
        reject(new Error('Email hoặc mật khẩu không hợp lệ'));
      } else {
        resolve({
          token: `jwt_${Date.now()}`,
          user: { email, name: email.split('@')[0] },
        });
      }
    }, 300);
  });
};

export const registerApi = async (name: string, email: string, password: string) => {
  return new Promise<{ token: string; user: { email: string; name: string } }>((resolve, reject) => {
    setTimeout(() => {
      if (!name.trim() || !email.includes('@') || password.length < 3) {
        reject(new Error('Vui lòng điền đủ Họ tên, Email và Mật khẩu'));
      } else {
        resolve({
          token: `jwt_${Date.now()}`,
          user: { email, name },
        });
      }
    }, 300);
  });
};

export const sendAiChatProxy = async (prompt: string, simulateFail = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simulateFail) {
        reject(new Error('Trợ lý AI đang bận xử lý'));
        return;
      }
      const q = prompt.trim().toLowerCase();
      if (q === 'hello' || q === 'hi' || q.includes('xin chào') || q.includes('chào')) {
        resolve('Chào bạn! 👋 Mình là trợ lý của ShopAI. Bạn đang muốn tìm sản phẩm nào hay cần tư vấn hôm nay?');
      } else if (q.includes('tai nghe') || q.includes('chống ồn')) {
        resolve('🎧 Mẫu "Tai nghe Bluetooth Chống Ồn AI" (890.000 đ) đang bán rất chạy với pin 30 giờ và công nghệ chống ồn ANC. Bạn có muốn thêm vào giỏ không?');
      } else if (q.includes('bàn phím') || q.includes('code') || q.includes('gaming')) {
        resolve('⌨️ "Bàn phím Cơ Không Dây RGB" (1.250.000 đ) rất phù hợp cho gõ code và chơi game, gõ êm và có kết nối Bluetooth linh hoạt.');
      } else if (q.includes('áo') || q.includes('thời trang')) {
        resolve('🧥 Shop đang có "Áo Khoác Gió Chống Nước Unisex" giá 350.000 đ, cản gió và chống nước đi mưa rất tiện.');
      } else if (q.includes('đèn') || q.includes('bình') || q.includes('gia dụng')) {
        resolve('🏠 Bên mình có "Đèn Bàn Cảm Ứng Chống Cận" (420.000 đ) và "Bình Giữ Nhiệt Cảm Ứng Báo Nhiệt" (195.000 đ), đều rất bền và tiện lợi.');
      } else if (q.includes('ship') || q.includes('vận chuyển') || q.includes('giao')) {
        resolve('🚚 Phí giao hàng của ShopAI được tính ưu đãi theo khoảng cách thực tế đến địa chỉ của bạn là 5.000 đ/km.');
      } else {
        resolve(`Dạ mình đã nhận yêu cầu "${prompt}". Bạn đang tìm sản phẩm tầm giá bao nhiêu để mình gợi ý món phù hợp nhất nhé!`);
      }
    }, 500);
  });
};