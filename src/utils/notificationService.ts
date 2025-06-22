import React, { useMemo } from 'react';
import { useNotifications } from '@/components/ui/notification';
import { profileValidation } from './sessionStorage';

export class NotificationService {
  private static addNotification: any;

  static initialize(addNotificationFn: any) {
    this.addNotification = addNotificationFn;
  }

  // Profile Update Notifications
  static showProfileUpdateReminder(daysUntilUpdate: number) {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'warning',
      title: 'Cập nhật thông tin cá nhân',
      message: `Thông tin của bạn sẽ cần cập nhật sau ${daysUntilUpdate} ngày nữa.`,
      duration: 8000,
      action: {
        label: 'Cập nhật ngay',
        onClick: () => {
          // Navigate to profile update
          window.location.href = '/experience';
        }
      }
    });
  }

  static showProfileUpdateRequired() {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'info',
      title: 'Cập nhật thông tin bắt buộc',
      message: 'Thông tin cá nhân của bạn đã quá 30 ngày. Vui lòng cập nhật để có gợi ý chính xác hơn.',
      duration: 0, // Don't auto dismiss
      action: {
        label: 'Cập nhật ngay',
        onClick: () => {
          window.location.href = '/experience';
        }
      }
    });
  }

  // Session Notifications
  static showSessionExpired() {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'warning',
      title: 'Phiên làm việc hết hạn',
      message: 'Phiên làm việc của bạn đã hết hạn. Vui lòng nhập lại thông tin.',
      duration: 6000
    });
  }

  static showSessionExpiringSoon(minutesLeft: number) {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'info',
      title: 'Phiên làm việc sắp hết hạn',
      message: `Phiên làm việc của bạn sẽ hết hạn sau ${minutesLeft} phút.`,
      duration: 5000,
      action: {
        label: 'Gia hạn',
        onClick: () => {
          // Extend session logic
          console.log('Extending session...');
        }
      }
    });
  }

  // Weather Notifications
  static showWeatherLoaded(location: string) {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'success',
      title: 'Thông tin thời tiết đã sẵn sàng',
      message: `Đã lấy thông tin thời tiết cho ${location}.`,
      duration: 3000
    });
  }

  static showWeatherError(error: string) {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'error',
      title: 'Lỗi thông tin thời tiết',
      message: `Không thể lấy thông tin thời tiết: ${error}`,
      duration: 6000
    });
  }

  // Location Notifications
  static showLocationPermissionDenied() {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'warning',
      title: 'Quyền truy cập vị trí bị từ chối',
      message: 'Để có gợi ý chính xác hơn, vui lòng cho phép truy cập vị trí.',
      duration: 8000,
      action: {
        label: 'Cài đặt lại',
        onClick: () => {
          // Guide user to enable location
          console.log('Guide to enable location...');
        }
      }
    });
  }

  // Form Notifications
  static showProfileSaved() {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'success',
      title: 'Lưu thông tin thành công',
      message: 'Thông tin cá nhân của bạn đã được lưu thành công.',
      duration: 4000
    });
  }

  static showProfileSaveError() {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'error',
      title: 'Lỗi lưu thông tin',
      message: 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.',
      duration: 6000
    });
  }

  // Mood Notifications
  static showMoodSelected(mood: string) {
    if (!this.addNotification) return;

    const moodLabels: { [key: string]: string } = {
      happy: 'Vui vẻ',
      sad: 'Buồn',
      stressed: 'Căng thẳng',
      excited: 'Hào hứng',
      tired: 'Mệt mỏi',
      hungry: 'Đói',
      neutral: 'Bình thường',
      celebrating: 'Ăn mừng'
    };

    this.addNotification({
      type: 'success',
      title: 'Đã chọn tâm trạng',
      message: `Tâm trạng: ${moodLabels[mood] || mood}`,
      duration: 3000
    });
  }

  // General Notifications
  static showWelcomeBack(userName: string) {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'info',
      title: 'Chào mừng trở lại!',
      message: `Xin chào ${userName}, chúng tôi đã sẵn sàng gợi ý món ăn cho bạn.`,
      duration: 4000
    });
  }

  static showRecommendationReady() {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'success',
      title: 'Gợi ý món ăn đã sẵn sàng',
      message: 'Chúng tôi đã có đủ thông tin để đưa ra gợi ý phù hợp.',
      duration: 5000,
      action: {
        label: 'Xem gợi ý',
        onClick: () => {
          // Navigate to recommendations
          console.log('Navigate to recommendations...');
        }
      }
    });
  }

  // Error Notifications
  static showNetworkError() {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'error',
      title: 'Lỗi kết nối',
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.',
      duration: 8000
    });
  }

  static showGenericError(message: string) {
    if (!this.addNotification) return;

    this.addNotification({
      type: 'error',
      title: 'Có lỗi xảy ra',
      message: message,
      duration: 6000
    });
  }
}

// Hook để sử dụng notification service
export const useNotificationService = () => {
  const { addNotification } = useNotifications();

  // Initialize service when hook is used
  React.useEffect(() => {
    NotificationService.initialize(addNotification);
  }, [addNotification]);

  // Memoize the returned object to prevent unnecessary re-renders
  const notificationMethods = useMemo(() => ({
    showProfileUpdateReminder: NotificationService.showProfileUpdateReminder,
    showProfileUpdateRequired: NotificationService.showProfileUpdateRequired,
    showSessionExpired: NotificationService.showSessionExpired,
    showSessionExpiringSoon: NotificationService.showSessionExpiringSoon,
    showWeatherLoaded: NotificationService.showWeatherLoaded,
    showWeatherError: NotificationService.showWeatherError,
    showLocationPermissionDenied: NotificationService.showLocationPermissionDenied,
    showProfileSaved: NotificationService.showProfileSaved,
    showProfileSaveError: NotificationService.showProfileSaveError,
    showMoodSelected: NotificationService.showMoodSelected,
    showWelcomeBack: NotificationService.showWelcomeBack,
    showRecommendationReady: NotificationService.showRecommendationReady,
    showNetworkError: NotificationService.showNetworkError,
    showGenericError: NotificationService.showGenericError
  }), []); // Empty dependency array since these are static methods

  return notificationMethods;
}; 