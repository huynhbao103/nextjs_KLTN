# Hướng dẫn setup Environment Variables

## 1. Tạo file .env.local

Tạo file `.env.local` trong thư mục gốc của project với nội dung:

```env
# Weather API Configuration
# Đăng ký tại: https://www.weatherapi.com/ hoặc https://openweathermap.org/api
WEATHER_API_KEY=your_weather_api_key_here

# Database Configuration (nếu cần)
MONGODB_URI=mongodb://localhost:27017/your_database

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (nếu cần)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_email_password

# Cloudinary Configuration (nếu cần)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 2. Đăng ký Weather API

### Option 1: WeatherAPI.com (Khuyến nghị)
1. Truy cập: https://www.weatherapi.com/
2. Đăng ký tài khoản miễn phí
3. Lấy API key từ dashboard
4. Miễn phí: 1,000,000 calls/month

### Option 2: OpenWeatherMap
1. Truy cập: https://openweathermap.org/api
2. Đăng ký tài khoản miễn phí
3. Lấy API key từ dashboard
4. Miễn phí: 1,000 calls/day

## 3. Cập nhật .env.local

Thay thế `your_weather_api_key_here` bằng API key thật:

```env
WEATHER_API_KEY=abc123def456ghi789
```

## 4. Restart development server

```bash
npm run dev
```

## 5. Test API

Truy cập: `http://localhost:3000/weather`

## Lưu ý quan trọng:

- **KHÔNG** commit file `.env.local` vào git
- **KHÔNG** sử dụng `NEXT_PUBLIC_` prefix cho API key (bảo mật)
- Trong production, sử dụng Redis cho cache và rate limiting
- Monitor API usage để tránh vượt quota 

# Hướng dẫn setup Environment Variables cho OpenWeatherMap

## 1. Tạo file .env.local

Tạo file `.env.local` trong thư mục gốc của project với nội dung:

```env
# OpenWeatherMap API Configuration
# Đăng ký tại: https://openweathermap.org/api
WEATHER_API_KEY=your_openweathermap_api_key_here

# Database Configuration (nếu cần)
MONGODB_URI=mongodb://localhost:27017/your_database

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (nếu cần)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_email_password

# Cloudinary Configuration (nếu cần)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 2. Đăng ký OpenWeatherMap API

### Bước 1: Đăng ký tài khoản
1. Truy cập: https://openweathermap.org/
2. Click "Sign Up" để tạo tài khoản mới
3. Xác nhận email

### Bước 2: Lấy API Key
1. Đăng nhập vào tài khoản
2. Vào "My API Keys" trong profile
3. Copy API key (hoặc tạo mới nếu cần)
4. **Lưu ý**: API key mới có thể mất 2-3 giờ để kích hoạt

### Bước 3: Kiểm tra API Key
- Miễn phí: 1,000 calls/day
- Có thể test ngay sau khi tạo

## 3. Cập nhật .env.local

Thay thế `your_openweathermap_api_key_here` bằng API key thật:

```env
WEATHER_API_KEY=abc123def456ghi789
```

## 4. Restart development server

```bash
npm run dev
```

## 5. Test API

Truy cập: `http://localhost:3000/weather`

## Lưu ý quan trọng:

- **KHÔNG** commit file `.env.local` vào git
- **KHÔNG** sử dụng `NEXT_PUBLIC_` prefix cho API key (bảo mật)
- API key mới có thể mất 2-3 giờ để kích hoạt
- Trong production, sử dụng Redis cho cache và rate limiting
- Monitor API usage để tránh vượt quota (1,000 calls/day)

## Troubleshooting:

### Lỗi "401 Unauthorized"
- API key chưa được kích hoạt (đợi 2-3 giờ)
- API key sai
- Vượt quota

### Lỗi "429 Too Many Requests"
- Vượt giới hạn 1,000 calls/day
- Đợi đến ngày hôm sau hoặc upgrade plan

### Lỗi "Network Error"
- Kiểm tra kết nối internet
- Kiểm tra firewall 