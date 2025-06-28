'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/header/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CameraIcon, Trash2Icon, UserIcon, SearchIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { useNotificationService } from '@/utils/notificationService';

interface ProfileData {
  name: string;
  dateOfBirth: string;
  gender: string;
  weight: number;
  height: number;
  activityLevel: string;
  medicalConditions: string[];
}

interface ProfileErrors {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  weight?: string;
  height?: string;
  activityLevel?: string;
  medicalConditions?: string;
}

const activityLevels = [
  { value: 'sedentary', label: 'Ít vận động', description: 'Ngồi nhiều, ít tập thể dục' },
  { value: 'light', label: 'Vận động nhẹ', description: 'Tập thể dục 1-3 lần/tuần' },
  { value: 'moderate', label: 'Vận động vừa', description: 'Tập thể dục 3-5 lần/tuần' },
  { value: 'active', label: 'Vận động nhiều', description: 'Tập thể dục 6-7 lần/tuần' },
  { value: 'very_active', label: 'Vận động rất nhiều', description: 'Tập thể dục 2 lần/ngày' }
];

const medicalConditions = [
  'Tiểu đường',
  'Huyết áp cao',
  'Bệnh tim',
  'Dị ứng thực phẩm',
  'Không dung nạp lactose',
  'Bệnh dạ dày',
  'Bệnh thận',
  'Bệnh gan',
  'Bệnh phổi',
  'Bệnh xương khớp',
  'Bệnh thần kinh',
  'Bệnh mắt',
  'Bệnh da',
  'Bệnh răng miệng',
  'Bệnh tai mũi họng',
  'Bệnh nội tiết',
  'Bệnh tiêu hóa',
  'Bệnh hô hấp',
  'Bệnh tuần hoàn',
  'Bệnh miễn dịch',
  'Không có'
];

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const notificationService = useNotificationService();
  
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    dateOfBirth: '',
    gender: '',
    weight: 0,
    height: 0,
    activityLevel: '',
    medicalConditions: []
  });

  const [errors, setErrors] = useState<Partial<ProfileErrors>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [medicalSearchTerm, setMedicalSearchTerm] = useState('');
  const [showMedicalDropdown, setShowMedicalDropdown] = useState(false);

  // Load user data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      // Load fresh data from database
      const loadUserData = async () => {
        try {
          const response = await fetch('/api/user');
          if (response.ok) {
            const userData = await response.json();
            console.log('User data from DB:', userData); // Debug log
            
            // Handle dateOfBirth properly - avoid timezone issues
            let dateOfBirth = '';
            if (userData.dateOfBirth) {
              try {
                // If it's already a string in YYYY-MM-DD format, use it directly
                if (typeof userData.dateOfBirth === 'string' && userData.dateOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  dateOfBirth = userData.dateOfBirth;
                  console.log('Using dateOfBirth as string:', dateOfBirth); // Debug log
                } else {
                  // If it's a Date object or other format, parse it carefully
                  const date = new Date(userData.dateOfBirth);
                  console.log('Parsed date object:', date); // Debug log
                  if (!isNaN(date.getTime())) {
                    // Use local date to avoid timezone issues
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    dateOfBirth = `${year}-${month}-${day}`;
                    console.log('Created dateOfBirth from date object:', dateOfBirth); // Debug log
                  }
                }
              } catch (error) {
                console.error('Error parsing dateOfBirth:', error);
              }
            }
            
            console.log('Final dateOfBirth for form:', dateOfBirth); // Debug log
            
            setFormData({
              name: userData.name || '',
              dateOfBirth: dateOfBirth,
              gender: userData.gender || '',
              weight: userData.weight || 0,
              height: userData.height || 0,
              activityLevel: userData.activityLevel || '',
              medicalConditions: userData.medicalConditions || []
            });
            setAvatarUrl(userData.image || null);

            // Check if profile needs update
            if (userData.lastUpdateDate) {
              const lastUpdate = new Date(userData.lastUpdateDate);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              setNeedsConfirmation(lastUpdate < thirtyDaysAgo);
            }
          } else {
            console.error('Failed to load user data from DB');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };

      loadUserData();
    }
  }, [session, status, router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileErrors> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
      } else {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 13 || age > 100) {
        newErrors.dateOfBirth = 'Tuổi phải từ 13-100';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Vui lòng chọn giới tính';
    }

    if (!formData.weight || formData.weight < 20 || formData.weight > 300) {
      newErrors.weight = 'Cân nặng phải từ 20-300kg';
    }

    if (!formData.height || formData.height < 100 || formData.height > 250) {
      newErrors.height = 'Chiều cao phải từ 100-250cm';
    }

    if (!formData.activityLevel) {
      newErrors.activityLevel = 'Vui lòng chọn mức độ vận động';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: new Date(formData.dateOfBirth),
          confirmUpdate: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        notificationService.showProfileSaved();
        setNeedsConfirmation(false);
        
        // Update session with the correct dateOfBirth format
        const updatedUser = {
          ...session?.user,
          ...formData,
          dateOfBirth: formData.dateOfBirth, // Keep the string format
          lastUpdateDate: new Date()
        };
        
        console.log('Updating session with:', updatedUser); // Debug log
        
        await update({
          ...session,
          user: updatedUser
        });
      } else if (data.needsConfirmation) {
        setNeedsConfirmation(true);
        notificationService.showProfileUpdateRequired();
      } else {
        notificationService.showProfileSaveError();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      notificationService.showProfileSaveError();
    } finally {
      setLoading(false);
    }
  };

  const handleSkipUpdate = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmUpdate: true,
          skipUpdate: true
        }),
      });

      if (response.ok) {
        notificationService.showProfileSaved();
        setNeedsConfirmation(false);
        
        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            lastUpdateDate: new Date()
          }
        });
      } else {
        notificationService.showProfileSaveError();
      }
    } catch (error) {
      notificationService.showProfileSaveError();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    console.log('handleInputChange:', field, value); // Debug log
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const filteredMedicalConditions = medicalConditions.filter(condition =>
    condition.toLowerCase().includes(medicalSearchTerm.toLowerCase())
  );

  const handleMedicalConditionToggle = (condition: string) => {
    setFormData(prev => {
      const currentConditions = [...prev.medicalConditions];
      
      if (condition === 'Không có') {
        // Nếu click vào "Không có"
        if (currentConditions.includes('Không có')) {
          // Nếu đã chọn "Không có", bỏ chọn nó
          return {
            ...prev,
            medicalConditions: currentConditions.filter(c => c !== 'Không có')
          };
        } else {
          // Nếu chưa chọn "Không có", chỉ chọn nó và bỏ tất cả bệnh khác
          return {
            ...prev,
            medicalConditions: ['Không có']
          };
        }
      } else {
        // Nếu click vào bệnh khác
        if (currentConditions.includes('Không có')) {
          // Nếu đã chọn "Không có", bỏ nó và chọn bệnh này
          return {
            ...prev,
            medicalConditions: currentConditions.filter(c => c !== 'Không có').concat(condition)
          };
        } else {
          // Nếu chưa chọn "Không có", toggle bệnh này bình thường
          return {
            ...prev,
            medicalConditions: currentConditions.includes(condition)
              ? currentConditions.filter(c => c !== condition)
              : [...currentConditions, condition]
          };
        }
      }
    });
    setMedicalSearchTerm('');
    setShowMedicalDropdown(false);
  };

  const removeMedicalCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter(c => c !== condition)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notificationService.showGenericError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      notificationService.showGenericError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAvatarUrl(data.imageUrl);
        notificationService.showProfileSaved();
        await update({
          ...session,
          user: {
            ...session?.user,
            image: data.imageUrl
          }
        });
      } else {
        notificationService.showGenericError(data.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện');
      }
    } catch (error) {
      notificationService.showGenericError('Có lỗi xảy ra khi cập nhật ảnh đại diện');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!avatarUrl) return;

    setUploading(true);
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setAvatarUrl(null);
        notificationService.showProfileSaved();
        await update({
          ...session,
          user: {
            ...session?.user,
            image: null
          }
        });
      } else {
        notificationService.showGenericError(data.message || 'Có lỗi xảy ra khi xóa ảnh đại diện');
      }
    } catch (error) {
      notificationService.showGenericError('Có lỗi xảy ra khi xóa ảnh đại diện');
    } finally {
      setUploading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream-primary dark:bg-dark-bg">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-primary mx-auto mb-4"></div>
            <p className="text-brown-primary dark:text-dark-text">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-primary dark:bg-dark-bg">
    <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Update Confirmation Alert */}
          {needsConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800">
                <AlertDescription className="text-yellow-800 dark:text-yellow-100">
                  Thông tin của bạn đã quá 30 ngày chưa được xác nhận. Vui lòng xác nhận xem bạn có cần cập nhật thông tin không.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/20">
              <CardHeader className="text-center bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-2xl font-bold text-brown-primary dark:text-orange-400">
              Hồ sơ cá nhân
            </CardTitle>
                <p className="text-brown-primary/70 dark:text-orange-300/80">
                  Cập nhật thông tin để có gợi ý chính xác hơn
                </p>
          </CardHeader>
              
              <CardContent className="p-6 bg-white dark:bg-gray-900">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 dark:border-orange-400">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <UserIcon className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 flex gap-2">
                  <label
                    htmlFor="avatar-upload"
                        className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full cursor-pointer transition-colors"
                  >
                    <CameraIcon className="w-5 h-5" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={uploading}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer transition-colors"
                    >
                      <Trash2Icon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {uploading ? 'Đang xử lý...' : avatarUrl ? 'Nhấn vào biểu tượng camera để thay đổi ảnh đại diện' : 'Nhấn vào biểu tượng camera để thêm ảnh đại diện'}
              </p>
            </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-200">Họ và tên *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Nhập họ và tên"
                        className={`${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-orange-500 dark:focus:border-orange-400`}
                      />
                      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 dark:text-gray-200">Ngày sinh *</Label>
                      <DatePicker
                        value={formData.dateOfBirth}
                        onChange={(value) => handleInputChange('dateOfBirth', value)}
                        error={!!errors.dateOfBirth}
                      />
                      {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-200">Giới tính *</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger className={`${errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400`}>
                          <SelectValue placeholder="Chọn giới tính" className="text-gray-900 dark:text-white [&[data-placeholder]]:text-gray-500 dark:[&[data-placeholder]]:text-gray-400" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 dark:border-gray-600">
                          <SelectItem value="male" className="text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20">Nam</SelectItem>
                          <SelectItem value="female" className="text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20">Nữ</SelectItem>
                          <SelectItem value="other" className="text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
                </div>

                <div className="space-y-2">
                      <Label htmlFor="activityLevel" className="text-sm font-medium text-gray-700 dark:text-gray-200">Mức độ vận động *</Label>
                      <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
                        <SelectTrigger className={`${errors.activityLevel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400`}>
                          <SelectValue placeholder="Chọn mức độ vận động" className="text-gray-900 dark:text-white [&[data-placeholder]]:text-gray-500 dark:[&[data-placeholder]]:text-gray-400" />
                    </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 dark:border-gray-600">
                          {activityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value} className="text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20">
                              <div>
                                <div className="font-medium">{level.label}</div>
                                {/* <div className="text-xs text-gray-500 dark:text-gray-400">{level.description}</div> */}
                              </div>
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                      {errors.activityLevel && <p className="text-red-500 text-sm">{errors.activityLevel}</p>}
                    </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                      <Label htmlFor="weight" className="text-sm font-medium text-gray-700 dark:text-gray-200">Cân nặng (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                        value={formData.weight || ''}
                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                        placeholder="Nhập cân nặng"
                        className={`${errors.weight ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-orange-500 dark:focus:border-orange-400`}
                      />
                      {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
                </div>

                <div className="space-y-2">
                      <Label htmlFor="height" className="text-sm font-medium text-gray-700 dark:text-gray-200">Chiều cao (cm) *</Label>
                    <Input
                      id="height"
                      type="number"
                        value={formData.height || ''}
                        onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                        placeholder="Nhập chiều cao"
                        className={`${errors.height ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-orange-500 dark:focus:border-orange-400`}
                      />
                      {errors.height && <p className="text-red-500 text-sm">{errors.height}</p>}
                    </div>
                </div>

                  {/* Medical Conditions */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Bệnh lý (có thể chọn nhiều)</Label>
                    
                    {/* Selected Conditions Tags */}
                    {formData.medicalConditions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.medicalConditions.map((condition) => (
                          <div
                            key={condition}
                            className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{condition}</span>
                            <button
                              type="button"
                              onClick={() => removeMedicalCondition(condition)}
                              className="ml-1 hover:bg-orange-200 dark:hover:bg-orange-800/50 rounded-full p-0.5"
                            >
                              <XIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Search and Dropdown */}
                    <div className="relative">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Tìm kiếm bệnh lý..."
                          value={medicalSearchTerm}
                          onChange={(e) => {
                            setMedicalSearchTerm(e.target.value);
                            setShowMedicalDropdown(true);
                          }}
                          onFocus={() => setShowMedicalDropdown(true)}
                          className="pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400"
                        />
                      </div>

                      {/* Dropdown */}
                      {showMedicalDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredMedicalConditions.length > 0 ? (
                            filteredMedicalConditions.map((condition) => (
                              <button
                                key={condition}
                                type="button"
                                onClick={() => handleMedicalConditionToggle(condition)}
                                className={`w-full text-left px-4 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors ${
                                  formData.medicalConditions.includes(condition)
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                                    : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                {condition}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                              Không tìm thấy bệnh lý phù hợp
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Click outside to close dropdown */}
                    {showMedicalDropdown && (
                      <div
                        className="fixed inset-0 z-0"
                        onClick={() => setShowMedicalDropdown(false)}
                      />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                {needsConfirmation && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkipUpdate}
                    disabled={loading}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Không cần cập nhật
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={loading}
                      className="ml-auto bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600 transition-all duration-200"
                >
                      {loading ? 'Đang lưu...' : 'Cập nhật thông tin'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
          </motion.div>
      </div>
      </main>
    </div>
  );
} 