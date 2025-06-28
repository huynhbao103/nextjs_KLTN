'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useSessionStorage } from '@/utils/sessionStorage';
import { SearchIcon, XIcon } from 'lucide-react';

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

interface ProfileSetupFormProps {
  onComplete: (profile: ProfileData) => void;
  onBack?: () => void;
  initialData?: Partial<ProfileData>;
  isUpdate?: boolean;
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

export function ProfileSetupForm({ onComplete, onBack, initialData, isUpdate = false }: ProfileSetupFormProps) {
  const [formData, setFormData] = useState<ProfileData>({
    name: initialData?.name || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    gender: initialData?.gender || '',
    weight: initialData?.weight || 0,
    height: initialData?.height || 0,
    activityLevel: initialData?.activityLevel || '',
    medicalConditions: initialData?.medicalConditions || []
  });

  const [errors, setErrors] = useState<Partial<ProfileErrors>>({});
  const [loading, setLoading] = useState(false);
  const { setProfileComplete } = useSessionStorage();
  const [medicalSearchTerm, setMedicalSearchTerm] = useState('');
  const [showMedicalDropdown, setShowMedicalDropdown] = useState(false);

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
      // Convert dateOfBirth to Date object
      const dataToSend = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
      };

      console.log('Sending data:', dataToSend); // Debug log

      // Save to database
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setProfileComplete(true);
        onComplete(formData);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ name: 'Có lỗi xảy ra khi lưu thông tin' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: any) => {
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

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/20">
      <CardHeader className="text-center bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-2xl font-bold text-brown-primary dark:text-orange-400">
          {isUpdate ? 'Cập nhật thông tin cá nhân' : 'Thông tin cá nhân'}
        </CardTitle>
        <p className="text-brown-primary/70 dark:text-orange-300/80">
          {isUpdate 
            ? 'Cập nhật thông tin để có gợi ý chính xác hơn'
            : 'Hãy cho chúng tôi biết thêm về bạn để có gợi ý phù hợp'
          }
        </p>
      </CardHeader>
      
      <CardContent className="p-6 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className='text-sm font-medium text-gray-700 dark:text-gray-200'>Họ và tên *</Label>
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
              <Label htmlFor="dateOfBirth" className='text-sm font-medium text-gray-700 dark:text-gray-200'>Ngày sinh *</Label>
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
              <Label htmlFor="gender" className='text-sm font-medium text-gray-700 dark:text-gray-200'>Giới tính *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className={`${errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400`}>
                  <SelectValue className='text-sm text-gray-900 dark:text-white [&[data-placeholder]]:text-gray-500 dark:[&[data-placeholder]]:text-gray-400' placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent className='text-sm bg-white dark:bg-gray-800 dark:border-gray-600'>
                  <SelectItem value="male" className="text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20">Nam</SelectItem>
                  <SelectItem value="female" className="text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20">Nữ</SelectItem>
                  <SelectItem value="other" className="text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20">Khác</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel" className='text-sm font-medium text-gray-700 dark:text-gray-200'>Mức độ vận động *</Label>
              <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
                <SelectTrigger className={`${errors.activityLevel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400`}>
                  <SelectValue placeholder="Chọn mức độ vận động" className='text-sm text-gray-900 dark:text-white [&[data-placeholder]]:text-gray-500 dark:[&[data-placeholder]]:text-gray-400' />
                </SelectTrigger>
                <SelectContent className='text-sm bg-white dark:bg-gray-800 dark:border-gray-600'>
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
              <Label htmlFor="weight" className='text-sm font-medium text-gray-700 dark:text-gray-200'>Cân nặng (kg) *</Label>
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
              <Label htmlFor="height" className='text-sm font-medium text-gray-700 dark:text-gray-200'>Chiều cao (cm) *</Label>
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
            <Label className='text-sm font-medium text-gray-700 dark:text-gray-200'>Bệnh lý (có thể chọn nhiều)</Label>
            
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
            {onBack && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Quay lại
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={loading}
              className="ml-auto bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600 transition-all duration-200"
            >
              {loading ? 'Đang lưu...' : (isUpdate ? 'Cập nhật' : 'Tiếp tục')}
            </Button>
          </div>
        </form>
      </CardContent>
      
    </Card>
  );
} 