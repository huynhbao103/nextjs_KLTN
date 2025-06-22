import dynamic from 'next/dynamic';

// Dynamic import để tránh hydration error
const WeatherLocation = dynamic(() => import('@/components/weather/WeatherLocation').then(mod => ({ default: mod.WeatherLocation })), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Thông tin thời tiết</h1>
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    </div>
  )
});


export default function WeatherPage() {
  return (
    <div className="space-y-8">
 
      <WeatherLocation />
    </div>
  );
} 