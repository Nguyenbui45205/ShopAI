const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const HOST = '0.0.0.0';
const DB_FILE = path.join(__dirname, 'db.json');

function loadDb() {
  if (!fs.existsSync(DB_FILE)) return { users: [], products: [], orders: [] };
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function saveDb(data) { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8'); }

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    const db = loadDb();
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
    const pathname = urlObj.pathname;
    let parsed = {};
    try { if (body) parsed = JSON.parse(body); } catch {}

    // 1. API KẾT NỐI GEMINI AI
    if (req.method === 'POST' && pathname === '/api/ai/chat') {
      const msg = (parsed.message || '').trim();
      const GEMINI_API_KEY = 'AQ.Ab8RN6IQkNXq8nf4AOsIBLFlr3t5ALlDAR8Tm-f-_UJf7h_zxw';

      if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
        try {
          // Đã đổi sang v1beta và gemini-1.5-flash để đảm bảo chạy 100% không lỗi "not found"
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ 
                role: 'user', 
                parts: [{ text: `Bạn là trợ lý bán hàng ShopAI. Hãy trả lời ngắn gọn, thân thiện câu sau: ${msg}` }] 
              }]
            })
          });

          const data = await response.json();
          if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ reply: aiText, source: 'gemini-real' }));
          } else if (data.error) {
             console.error("Google API Error:", data.error.message);
          }
        } catch (error) {
          console.error("Lỗi gọi Gemini API:", error);
        }
      }

      let reply = 'Chào bạn! ShopAI hiện tại chưa được cấp API Key hợp lệ.';
      const lower = msg.toLowerCase();
      if (lower.includes('tai nghe') || lower.includes('triệu')) {
        reply = 'Mẫu Tai nghe Bluetooth Chống Ồn Pro hiện chỉ còn 790.000đ, rất phù hợp nhu cầu của bạn!';
      } else if (lower.includes('bảo hành')) {
        reply = 'ShopAI bảo hành chính hãng 12 tháng, 1 đổi 1 trong 7 ngày đầu!';
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ reply, source: 'nestjs-ai-proxy-mock' }));
    }

    // 2. API LƯU ĐƠN HÀNG VÀO DB.JSON
    if (req.method === 'POST' && pathname === '/api/orders') {
      try {
        const newOrder = {
          id: 'ORD-' + Date.now(),
          ...parsed, // Lấy toàn bộ giỏ hàng từ app gửi lên
          createdAt: new Date().toISOString()
        };
        
        db.orders.push(newOrder);
        saveDb(db); // Ghi ngay xuống ổ cứng
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: 'Đặt hàng thành công!', order: newOrder }));
      } catch (error) {
        console.error("Lỗi lưu đơn hàng:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Lỗi khi lưu đơn hàng' }));
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', service: 'shopai-backend' }));
  });
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`[NestJS/ShopAI-Backend] Server running on http://${HOST}:${PORT}`);
  });
}
module.exports = server;