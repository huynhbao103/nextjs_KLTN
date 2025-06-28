// Types cho dữ liệu thời tiết
export interface WeatherData {
  location: LocationData;
  current: CurrentWeather;
  forecast?: ForecastData[];
}

// Interface duy nhất cho session weather data - chỉ chứa thời tiết hiện tại
export interface SessionWeatherData {
  // Thời tiết hiện tại
  current: {
    // Thông tin vị trí
    location: {
      name: string;
      country: string;
      region: string;
    };
    // Tọa độ
    lat: number;
    lon: number;
    // Nhiệt độ
    temp_c: number;
    temp_f: number;
    // Cảm giác
    feelslike_c: number;
    feelslike_f: number;
    // Điều kiện thời tiết
    condition: {
      text: string;
      icon: string;
    };
    // Thời gian cập nhật
    last_updated: string;
  };
}

export interface LocationData {
  name: string;
  country: string;
  region?: string;
  lat: number;
  lon: number;
  timezone: string;
  localtime: string;
}

export interface CurrentWeather {
  temp_c: number;
  temp_f: number;
  condition: WeatherCondition;
  humidity: number;
  wind_kph: number;
  wind_mph: number;
  wind_dir: string;
  pressure_mb: number;
  feelslike_c: number;
  feelslike_f: number;
  uv: number;
  visibility_km: number;
  vis_km: number;
  last_updated: string;
}

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface ForecastData {
  date: string;
  day: DayForecast;
  hour: HourForecast[];
}

export interface DayForecast {
  maxtemp_c: number;
  maxtemp_f: number;
  mintemp_c: number;
  mintemp_f: number;
  avgtemp_c: number;
  avgtemp_f: number;
  maxwind_kph: number;
  maxwind_mph: number;
  totalprecip_mm: number;
  totalprecip_in: number;
  avghumidity: number;
  condition: WeatherCondition;
  uv: number;
}

export interface HourForecast {
  time: string;
  temp_c: number;
  temp_f: number;
  condition: WeatherCondition;
  wind_kph: number;
  wind_mph: number;
  wind_dir: string;
  pressure_mb: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  chance_of_rain: number;
  chance_of_snow: number;
  vis_km: number;
  vis_miles: number;
  uv: number;
}

// Types cho geolocation
export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
  };
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

// Types cho API responses
export interface WeatherApiResponse {
  location: LocationData;
  current: CurrentWeather;
  forecast?: {
    forecastday: ForecastData[];
  };
}

export interface GeocodeResponse {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    country: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

// Types cho component states
export interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export interface LocationState {
  position: GeolocationPosition | null;
  address: string | null;
  loading: boolean;
  error: string | null;
} 