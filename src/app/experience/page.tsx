'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/header/page';
import { useSessionStorage, profileValidation } from '@/utils/sessionStorage';
import { useNotificationService } from '@/utils/notificationService';
import { useWeather } from '@/hooks/useWeather';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Loader2, MapPin, Cloud, Heart, User, Clock, Thermometer } from 'lucide-react';
import { MoodSelection } from '@/components/experience/MoodSelection';
import { ProfileSetupForm } from '@/components/experience/ProfileSetupForm';
import { ProfileUpdatePrompt } from '@/components/experience/ProfileUpdatePrompt';

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

type ExperienceStep = 'loading' | 'profile' | 'profile-update' | 'mood' | 'weather' | 'complete';

export default function Experience() {
  const [currentStep, setCurrentStep] = useState<ExperienceStep>('loading');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [weatherRequested, setWeatherRequested] = useState(false);
  
  const { 
    setWeather, 
    getMood, 
    getWeather, 
    hasData, 
    isExpired, 
    getRemainingTime,
    clearAll 
  } = useSessionStorage();
  
  const notificationService = useNotificationService();
  const { position, error: locationError } = useGeolocation();
  const { data: weatherData, loading: weatherLoading, error: weatherError } = useWeather(
    position?.coords.latitude,
    position?.coords.longitude
  );

  // Check user profile and session data
  useEffect(() => {
    const checkUserData = async () => {
      try {
        // Check if user is logged in and has profile
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setUserProfile(userData);
          
          console.log('=== DEBUG USER DATA ===');
          console.log('User data loaded:', userData);
          console.log('User name:', userData.name);
          console.log('User gender:', userData.gender);
          console.log('User weight:', userData.weight);
          console.log('User height:', userData.height);
          console.log('User activityLevel:', userData.activityLevel);
          console.log('User dateOfBirth:', userData.dateOfBirth);
          console.log('User lastUpdateDate:', userData.lastUpdateDate);
          
          // Check if profile is complete
          const isProfileComplete = profileValidation.isComplete(userData);
          console.log('Is profile complete:', isProfileComplete);
          
          // Check if profile needs update
          const needsUpdate = profileValidation.needsUpdate(userData.lastUpdateDate);
          console.log('Profile needs update:', needsUpdate);
          console.log('Last update date:', userData.lastUpdateDate);
          console.log('Days since update:', userData.lastUpdateDate ? Math.floor((new Date().getTime() - new Date(userData.lastUpdateDate).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A');
          console.log('=== END DEBUG ===');
          
          if (!isProfileComplete) {
            // User needs to complete profile
            console.log('Setting step to: profile (incomplete)');
            setCurrentStep('profile');
            notificationService.showProfileUpdateRequired();
          } else {
            // Profile is complete - always ask if user wants to update
            console.log('Profile is complete, asking if user wants to update');
            setCurrentStep('profile-update');
            notificationService.showProfileUpdateRequired();
          }
        } else {
          // User not logged in, redirect to login
          console.log('User not logged in, setting step to: profile');
          setCurrentStep('profile'); // Temporary for testing
        }
      } catch (error) {
        console.error('Error checking user data:', error);
        notificationService.showNetworkError();
        setCurrentStep('profile'); // Fallback
      } finally {
        setLoading(false);
      }
    };

    checkUserData();
  }, [hasData, isExpired, clearAll]);

  // Handle weather data
  useEffect(() => {
    if (weatherRequested && position?.coords.latitude && position?.coords.longitude) {
      // Gọi API lấy thời tiết
      // (useWeather sẽ tự động fetch khi lat/lon thay đổi, nên ta chỉ cần set state)
    }
  }, [weatherRequested, position]);

  // Khi có weatherData và đã request, mới chuyển sang complete
  useEffect(() => {
    if (weatherRequested && weatherData && currentStep === 'weather') {
      setWeather(weatherData);
      // Không cần setLocation vì weatherData và locationData giờ giống nhau
      setCurrentStep('complete');
      notificationService.showWeatherLoaded(weatherData.location.name);
      notificationService.showRecommendationReady();
      setWeatherRequested(false); // reset lại để lần sau quay lại phải xác nhận lại
    }
  }, [weatherRequested, weatherData, currentStep, setWeather, notificationService]);

  // Handle weather error
  useEffect(() => {
    if (weatherError && currentStep === 'weather') {
      notificationService.showWeatherError(weatherError);
    }
  }, [weatherError, currentStep]);

  // Handle location error
  useEffect(() => {
    if (locationError) {
      notificationService.showLocationPermissionDenied();
    }
  }, [locationError]);

  // Session expiration warning
  useEffect(() => {
    const remainingTime = getRemainingTime();
    if (remainingTime > 0 && remainingTime <= 5) {
      notificationService.showSessionExpiringSoon(remainingTime);
    }
  }, [getRemainingTime]);

  const handleMoodSelected = useCallback((mood: string) => {
    console.log('Mood selected:', mood);
    notificationService.showMoodSelected(mood);
    setCurrentStep('weather');
  }, [notificationService]);

  const handleProfileComplete = useCallback((profile: any) => {
    console.log('Profile completed:', profile);
    setUserProfile(profile);
    notificationService.showProfileSaved();
    setCurrentStep('mood');
  }, [notificationService]);

  const handleProfileUpdate = useCallback((profile: any) => {
    console.log('Profile updated:', profile);
    setUserProfile(profile);
    notificationService.showProfileSaved();
    // Chuyển sang mood sau khi cập nhật thành công
    setCurrentStep('mood');
  }, [notificationService]);

  const handleStartUpdate = useCallback(() => {
    console.log('Starting profile update');
    setCurrentStep('profile');
  }, []);

  const handleSkipUpdate = useCallback(() => {
    setCurrentStep('mood');
  }, []);

  const handleBackToMood = useCallback(() => {
    clearAll();
    setCurrentStep('mood');
  }, [clearAll]);

  const handleBackToProfile = useCallback(() => {
    setCurrentStep('profile');
  }, []);

  const handleBackToProfileUpdate = useCallback(() => {
    setCurrentStep('profile-update');
  }, []);

  const handleBackToWeather = useCallback(() => {
    setCurrentStep('weather');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-primary dark:bg-dark-bg">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-primary" />
              <p className="text-brown-primary dark:text-dark-text">Đang tải...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-primary dark:bg-dark-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep === 'profile' || currentStep === 'profile-update' ? 'text-orange-primary' : 'text-gray-400'}`}>
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Hồ sơ</span>
              </div>
              <div className={`w-8 h-0.5 ${currentStep === 'mood' || currentStep === 'weather' || currentStep === 'complete' ? 'bg-orange-primary' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep === 'mood' ? 'text-orange-primary' : currentStep === 'weather' || currentStep === 'complete' ? 'text-green-primary' : 'text-gray-400'}`}>
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">Tâm trạng</span>
              </div>
              <div className={`w-8 h-0.5 ${currentStep === 'weather' || currentStep === 'complete' ? 'bg-orange-primary' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep === 'weather' ? 'text-orange-primary' : currentStep === 'complete' ? 'text-green-primary' : 'text-gray-400'}`}>
                <Cloud className="w-5 h-5" />
                <span className="hidden sm:inline">Thời tiết</span>
              </div>
              <div className={`w-8 h-0.5 ${currentStep === 'complete' ? 'bg-orange-primary' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep === 'complete' ? 'text-green-primary' : 'text-gray-400'}`}>
                <MapPin className="w-5 h-5" />
                <span className="hidden sm:inline">Hoàn thành</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {/* Profile Setup/Update */}
            {(currentStep === 'profile' || currentStep === 'profile-update') && (
              <Card className="food-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-6 h-6 text-orange-primary dark:text-dark-text" />
                    <span className='text-brown-primary dark:text-dark-text'>{currentStep === 'profile' ? 'Thiết lập hồ sơ' : 'Cập nhật hồ sơ'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentStep === 'profile' ? (
                    <ProfileSetupForm 
                      onComplete={userProfile ? handleProfileUpdate : handleProfileComplete} 
                      initialData={userProfile}
                      isUpdate={!!userProfile}
                    />
                  ) : (
                    <ProfileUpdatePrompt 
                      onUpdate={() => handleStartUpdate()} 
                      onSkip={handleSkipUpdate}
                      userProfile={userProfile}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mood Selection */}
            {currentStep === 'mood' && (
              <Card className="food-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-6 h-6 text-orange-primary dark:text-dark-text" />
                    <span className='text-brown-primary dark:text-dark-text'>Chọn tâm trạng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MoodSelection onMoodSelected={handleMoodSelected} />
                  <div className="mt-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handleBackToProfile}
                      className="flex items-center space-x-2"
                    >
                      <User className="w-4 h-4 text-brown-primary dark:text-dark-text" />
                      <span className='text-brown-primary dark:text-dark-text'>Quay lại</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weather Loading */}
            {currentStep === 'weather' && (
              <Card className="food-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cloud className="w-6 h-6 text-orange-primary dark:text-dark-text" />
                    <span className='text-brown-primary dark:text-dark-text'>Thông tin thời tiết</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    {!weatherRequested ? (
                      <div>
                        <p className="text-brown-primary dark:text-dark-text mb-4">
                          Để có gợi ý chính xác hơn, chúng tôi cần thông tin thời tiết tại vị trí của bạn.
                        </p>
                        <Button 
                          onClick={() => setWeatherRequested(true)}
                          className="bg-orange-primary hover:bg-orange-primary/90"
                        >
                          Lấy thông tin thời tiết
                        </Button>
                      </div>
                    ) : (
                      <div>
                        {weatherLoading ? (
                          <div className="space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-primary" />
                            <p className="text-brown-primary dark:text-dark-text">
                              Đang lấy thông tin thời tiết...
                            </p>
                          </div>
                        ) : weatherError ? (
                          <div className="space-y-4">
                            <p className="text-red-500">
                              Không thể lấy thông tin thời tiết: {weatherError}
                            </p>
                            <Button 
                              onClick={() => setWeatherRequested(false)}
                              variant="outline"
                            >
                              Thử lại
                            </Button>
                          </div>
                        ) : getWeather() ? (
                          <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                              <div className="flex items-center justify-center gap-3 mb-2">
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {Math.round(getWeather()?.current?.temp_c || 0)}°C
                                </span>
                                {getWeather()?.current?.condition?.icon && (
                                  <img 
                                    src={getWeather()?.current.condition.icon} 
                                    alt={getWeather()?.current.condition.text}
                                    className="w-12 h-12"
                                  />
                                )}
                              </div>
                              <p className="text-center text-blue-800 dark:text-blue-200 font-medium">
                                {getWeather()?.current?.condition?.text}
                              </p>
                              <p className="text-center text-sm text-blue-600 dark:text-blue-300">
                                Cảm giác như {Math.round(getWeather()?.current?.feelslike_c || 0)}°C
                              </p>
                            </div>
                            <p className="text-green-600 dark:text-green-400 font-medium">
                              ✓ Đã lấy thông tin thời tiết thành công!
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handleBackToMood}
                      className="flex items-center space-x-2"
                    >
                      <Heart className="w-4 h-4 text-brown-primary dark:text-dark-text" />
                      <span className='text-brown-primary dark:text-dark-text'>Quay lại</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Complete */}
            {currentStep === 'complete' && (
              <Card className="food-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-6 h-6 text-green-primary dark:text-dark-text" />
                    <span>Hoàn thành!</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-semibold text-brown-primary dark:text-dark-text">
                      Đã thu thập đủ thông tin!
                    </h3>
                    <p className="text-brown-primary/70 dark:text-dark-text-secondary">
                      Chúng tôi đã có đủ thông tin để đưa ra gợi ý món ăn phù hợp nhất cho bạn.
                    </p>
                    
                    {/* Display collected data */}
                    <div className="mt-6 space-y-3 text-left">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-orange-primary" />
                        <span className="text-brown-primary dark:text-dark-text">
                          Hồ sơ: {userProfile?.name || 'Đã cập nhật'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-orange-primary" />
                        <span className="text-brown-primary dark:text-dark-text">
                          Tâm trạng: {getMood() || 'Đã chọn'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Cloud className="w-4 h-4 text-orange-primary" />
                        <div className="flex-1">
                          <span className="text-brown-primary dark:text-dark-text">
                            Thời tiết: {getWeather()?.current?.location?.name || 'Đã lấy'}
                          </span>
                          {getWeather()?.current && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-brown-primary/70 dark:text-dark-text-secondary">
                                {Math.round(getWeather()?.current.temp_c || 0)}°C
                              </span>
                              {getWeather()?.current.condition?.icon && (
                                <img 
                                  src={getWeather()?.current.condition.icon} 
                                  alt={getWeather()?.current.condition.text}
                                  className="w-6 h-6"
                                />
                              )}
                              <span className="text-sm text-brown-primary/70 dark:text-dark-text-secondary">
                                {getWeather()?.current.condition?.text}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button 
                        className="bg-orange-primary hover:bg-orange-primary/90 text-white dark:text-dark-text"
                        onClick={() => {
                          // TODO: Navigate to recommendations
                          console.log('Navigate to recommendations');
                        }}
                      >
                        Xem gợi ý món ăn
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handleBackToWeather}
                      className="flex items-center space-x-2"
                    >
                      <Cloud className="w-4 h-4 text-brown-primary dark:text-dark-text" />
                      <span className='text-brown-primary dark:text-dark-text'>Quay lại</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}