import { useState, useEffect, useCallback } from 'react';
import { GeolocationPosition, GeolocationError, LocationState } from '@/types/weather';
import { getAddressFromCoords } from '@/lib/weatherApi';

export function useGeolocation() {
  const [state, setState] = useState<LocationState>({
    position: null,
    address: null,
    loading: false,
    error: null
  });

  const [isClient, setIsClient] = useState(false);

  // Kiểm tra trình duyệt có hỗ trợ geolocation không
  const isSupported = isClient && typeof navigator !== 'undefined' && 'geolocation' in navigator;

  // Fix hydration issue
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lấy vị trí hiện tại
  const getCurrentPosition = useCallback(async () => {
    if (!isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Trình duyệt không hỗ trợ định vị địa lý'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                altitude: pos.coords.altitude || undefined,
                altitudeAccuracy: pos.coords.altitudeAccuracy || undefined,
                heading: pos.coords.heading || undefined,
                speed: pos.coords.speed || undefined
              },
              timestamp: pos.timestamp
            });
          },
          (error) => {
            reject({
              code: error.code,
              message: getErrorMessage(error.code)
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // Cache trong 1 phút
          }
        );
      });

      // Lấy địa chỉ từ tọa độ
      const addressData = await getAddressFromCoords(
        position.coords.latitude,
        position.coords.longitude
      );

      setState({
        position,
        address: addressData.display_name,
        loading: false,
        error: null
      });

    } catch (error) {
      const geolocationError = error as GeolocationError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: geolocationError.message
      }));
    }
  }, [isSupported]);

  // Theo dõi vị trí liên tục
  const watchPosition = useCallback((callback?: (position: GeolocationPosition) => void) => {
    if (!isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Trình duyệt không hỗ trợ định vị địa lý'
      }));
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const position: GeolocationPosition = {
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude || undefined,
            altitudeAccuracy: pos.coords.altitudeAccuracy || undefined,
            heading: pos.coords.heading || undefined,
            speed: pos.coords.speed || undefined
          },
          timestamp: pos.timestamp
        };

        try {
          const addressData = await getAddressFromCoords(
            position.coords.latitude,
            position.coords.longitude
          );

          setState({
            position,
            address: addressData.display_name,
            loading: false,
            error: null
          });

          if (callback) {
            callback(position);
          }
        } catch (error) {
          console.error('Error getting address:', error);
        }
      },
      (error) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: getErrorMessage(error.code)
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // Cache trong 30 giây
      }
    );

    return watchId;
  }, [isSupported]);

  // Dừng theo dõi vị trí
  const clearWatch = useCallback((watchId: number) => {
    if (isSupported) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, [isSupported]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      position: null,
      address: null,
      loading: false,
      error: null
    });
  }, []);

  // Tự động lấy vị trí khi component mount và client-side
  useEffect(() => {
    if (isSupported && !state.position && !state.loading && !state.error) {
      getCurrentPosition();
    }
  }, [isSupported, state.position, state.loading, state.error]);

  return {
    ...state,
    isSupported,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    reset
  };
}

// Helper function để chuyển đổi error code thành message
function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Quyền truy cập vị trí bị từ chối. Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt.';
    case 2:
      return 'Không thể xác định vị trí hiện tại. Vui lòng thử lại.';
    case 3:
      return 'Hết thời gian chờ xác định vị trí. Vui lòng thử lại.';
    default:
      return 'Có lỗi xảy ra khi xác định vị trí. Vui lòng thử lại.';
  }
} 