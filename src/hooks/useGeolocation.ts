import { useState, useEffect } from 'react';

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);

    const successHandler = (pos: GeolocationPosition) => {
      setPosition(pos);
      setError(null);
      setLoading(false);
    };

    const errorHandler = (err: GeolocationPositionError) => {
      let errorMessage = 'Unknown error occurred';
      
      switch (err.code) {
        case 1: // PERMISSION_DENIED
          errorMessage = 'User denied the request for Geolocation';
          break;
        case 2: // POSITION_UNAVAILABLE
          errorMessage = 'Location information is unavailable';
          break;
        case 3: // TIMEOUT
          errorMessage = 'The request to get user location timed out';
          break;
      }
      
      setError(errorMessage);
      setLoading(false);
    };

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
      maximumAge: 900000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, options);
  }, []);

  return { position, error, loading };
}; 