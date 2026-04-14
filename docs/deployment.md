# Hướng dẫn Triển Khai (Deployment)

Việc chạy hệ thống ở môi trường Local là chưa đủ, bạn sẽ muốn triển khai nền tảng Bot/Dashboard này ra ngoài thực tế để mọi người có thể sử dụng (Production).

Hệ thống Discord Counselor hiện tại phân chia thành nhiều module và được khuyên cấu hình trên hình thức máy ảo Cloud.

## Đặc tả Hệ thống Cloud Khuyên dùng

Để vận hành mượt mà với mô hình này, chúng ta sẽ cần:
1. Máy chủ Cơ sở dữ liệu: `PostgreSQL` (Gợi ý dùng **Supabase** để scale tốt, dễ deploy).
2. Máy chủ Redis: Gợi ý **Upstash** dành cho môi trường Serverless hoặc Deploy Node tĩnh. 
3. Máy tính xử lý logic Node.js: **Render**, **Railway**, **Fly.io** hoặc **AWS VPS**.

---

## 🚀 Phương thức 1: Triển khai bằng Công cụ Cloud (Render & Railway)

Cách này thân thiện với các nhà phát triển và giúp tối ưu hóa chi phí (hoàn toàn có thể chạy mức giá miễn phí nếu lượng dùng ít). Hãy tham khảo theo hình mẫu Render:

### Bước 1: Setup Backend Server 
1. Liên kết tài khoản Render với Github Repository của dự án.
2. Tạo một dịch vụ `Web Service` (Dành cho việc mở Port cho kết nối từ User). Trỏ Root Directory vào `backend/`.
3. Chỉ định các Start Command như sau:
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `node src/index.js`
4. Copy toàn bộ các Variables từ file `.env` vào Config của Render Service này để Server đọc khi chạy. (Đặc biệt lưu ý: Phải điền các kết nối `DATABASE_URL` mới nhất từ Supabase và `REDIS_URL` từ Upstash).

### Bước 2: Setup Directive Bot/Worker
Bot Worker không cần kết nối qua Port web để lắng nghe tương tác HTTP, vì thế Render hỗ trợ loại Background Worker.

1. Tạo một node chạy nền `Background Worker`, trỏ thư mục `directive/`.
2. Start/Build command định nghĩa như sau:
   - Build Command: `npm install`
   - Start Command: `node src/index.js` (hoặc có thể setup package script như `npm start`)
3. Set các biến Environment Variables từ file Config (Cấp cho Worker đúng DB Database URL và URL Redis tương tự Backend).

### Bước 3: Đăng ký Slash Command cho Bot
Khác với Web Server, ứng dụng Discord Bot cần đăng nhập Slash Command. Bạn có thể sử dụng tính năng SSH hoặc Exec Terminal trên Node Worker Directive của Render và gọi: `npm run deploy` 1 lần duy nhất trong Terminal để cấp phát UI Lệnh điều khiển lên Discord Server. 

*(Dự án tương lai sẽ build Dashboard tĩnh dạng SPA/SSG trực tiếp ra CDN Vercel hoặc Netlify để Load cực nhanh cho user thay vì Render Service).*

---

## 🐳 Phương thức 2: Deploy bằng Docker Compose chuyên nghiệp (VPS/On-Premise) 

Đối với ai muốn tự thân vận hành trên 1 con máy ảo riêng có Docker, tài liệu cung cấp sẵn file `docker-compose.yml`.

1. Hãy tải project code về máy ảo hoặc VPS Cloud.
2. Sửa lại các `.env` sử dụng url nội bộ trong không gian Docker Network. (VD: `REDIS_URL=redis://redis:6379`)
3. Chạy câu lệnh xây dựng toàn bộ container:
```bash
docker compose build
docker compose up -d
```
Docker sẽ setup toàn bộ, sau đó bạn cấu hình thêm một Reverse Proxy (NHƯ `Nginx` / `Traefik`) bằng cách mở Port localhost chỉ định kết nối tên miền về Server VPS của bạn là xong.
