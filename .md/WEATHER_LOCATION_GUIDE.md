# Hướng dẫn lấy địa điểm và thời tiết hiện tại của người dùng

## 🏗️ **Kiến trúc Backend-First (Đã triển khai)**

### **Frontend (FE):**
- Chỉ gọi BE API routes
- Không expose API key
- UI/UX components

### **Backend (BE):**
- Bảo vệ API key
- Cache & Rate limiting
- Xử lý logic phức tạp
- Proxy external APIs

---

## 📁 **Cấu trúc file đã tạo:**

### **1. Types & Interfaces**
**File:** `src/types/weather.ts`
```ts
export interface WeatherData { ... }
export interface LocationData { ... }
export interface CurrentWeather { ... }
// ...
```
> Định nghĩa kiểu dữ liệu cho type safety

### **2. Frontend API Client**
**File:** `src/lib/weatherApi.ts`
```ts
// Gọi BE API thay vì external API
const WEATHER_API_BASE_URL = '/api/weather';
const GEOCODING_API_BASE_URL = '/api/geocode';

export async function getWeatherData(lat: number, lon: number) {
  const url = `${WEATHER_API_BASE_URL}?lat=${lat}&lon=${lon}`;
  const response = await fetch(url);
  return response.json();
}
```
> Client-side functions gọi BE API

### **3. Custom Hooks**
**File:** `src/hooks/useGeolocation.ts`
```ts
export function useGeolocation() {
  // Lấy vị trí người dùng
  // Chuyển đổi tọa độ thành địa chỉ
  // Quản lý loading/error states
}
```

**File:** `src/hooks/useWeather.ts`
```ts
export function useWeather(lat?: number, lon?: number) {
  // Lấy thời tiết từ BE API
  // Cache client-side
  // Error handling
}
```

### **4. UI Components**
**File:** `src/components/weather/WeatherCard.tsx`
```tsx
export function WeatherCard({ weatherData, onRefresh, loading }) {
  // Hiển thị thông tin thời tiết
  // Icons, nhiệt độ, độ ẩm, gió, ...
}
```

**File:** `src/components/weather/LocationDisplay.tsx`
```tsx
export function LocationDisplay({ address, loading, error, onRefresh }) {
  // Hiển thị địa chỉ hiện tại
  // Search functionality
}
```

**File:** `src/components/weather/WeatherLocation.tsx`
```tsx
export function WeatherLocation() {
  // Component chính kết hợp tất cả
  // Tab switching (current location vs search)
}
```

### **5. Backend API Routes**
**File:** `src/app/api/weather/route.ts`
```ts
export async function GET(request: NextRequest) {
  // Rate limiting (30 req/min)
  // Cache (10 minutes)
  // API key protection
  // Error handling
  // Call external WeatherAPI
}
```

**File:** `src/app/api/geocode/route.ts`
```ts
export async function GET(request: NextRequest) {
  // Rate limiting (50 req/min)
  // Cache (1 hour)
  // Call OpenStreetMap Nominatim
  // Error handling
}
```

### **6. Page Component**
**File:** `src/app/weather/page.tsx`
```tsx
import { WeatherLocation } from '@/components/weather/WeatherLocation';
export default function WeatherPage() {
  return <WeatherLocation />;
}
```

---

## 🔒 **Tính năng bảo mật đã triển khai:**

### **1. API Key Protection**
```ts
// ❌ Không dùng (lộ API key)
const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

// ✅ Dùng (bảo vệ API key)
const apiKey = process.env.WEATHER_API_KEY;
```

### **2. Rate Limiting**
```ts
// 30 requests/minute cho weather API
// 50 requests/minute cho geocoding API
const RATE_LIMIT_MAX_REQUESTS = 30;
```

### **3. Caching**
```ts
// Weather data: 10 minutes
// Geocoding data: 1 hour
const CACHE_DURATION = 10 * 60 * 1000;
```

### **4. Error Handling**
```ts
try {
  // API calls
} catch (error) {
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## 🚀 **Setup và chạy:**

### **1. Cài đặt dependencies**
```bash
npm install @radix-ui/react-tabs lucide-react
```

### **2. Tạo file .env.local**
```env
WEATHER_API_KEY=your_api_key_here
```

### **3. Đăng ký Weather API**
- WeatherAPI.com: https://www.weatherapi.com/
- OpenWeatherMap: https://openweathermap.org/api

### **4. Chạy development server**
```bash
npm run dev
```

### **5. Test**
Truy cập: `http://localhost:3000/weather`

---

## 📊 **Luồng hoạt động:**

```
User Browser (FE)
    ↓
Next.js API Routes (BE)
    ↓
External APIs (WeatherAPI, OpenStreetMap)
    ↓
Cache & Rate Limit (BE)
    ↓
Response to User (FE)
```

---

## 🎯 **Ưu điểm của kiến trúc Backend-First:**

1. **Bảo mật**: API key được bảo vệ ở server
2. **Performance**: Cache giảm thời gian response
3. **Rate Limiting**: Tránh spam và bảo vệ external APIs
4. **Scalability**: Dễ scale và monitor
5. **Error Handling**: Xử lý lỗi tập trung
6. **Analytics**: Có thể track usage patterns

---

## 🔧 **Production Recommendations:**

1. **Redis**: Thay thế in-memory cache
2. **Database**: Lưu cache và analytics
3. **Monitoring**: Track API usage và errors
4. **CDN**: Cache static assets
5. **Load Balancer**: Scale horizontally

**Nếu cần giải thích chi tiết từng đoạn code, hãy hỏi cụ thể!** 