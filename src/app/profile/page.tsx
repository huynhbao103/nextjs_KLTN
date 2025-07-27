'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Scale, 
  Ruler, 
  Heart, 
  Plus, 
  X, 
  Camera, 
  Save, 
  Trash2,
  ChevronDown,
  Sparkles,
  Shield,
  Activity
} from 'lucide-react';
import Header from '@/components/header/page';

interface UserData {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  weight?: number;
  height?: number;
  allergies?: string[];
  medicalConditions?: string[];
  createdAt: string;
  updatedAt: string;
  image?: string;
}

// Danh sách bệnh lý phổ biến
const COMMON_MEDICAL_CONDITIONS = [
  'Không có',
  'Đái tháo đường',
  'Cao huyết áp',
  "Bệnh tim mạch vành",
  "Rối loạn lipid máu",
  "Suy tim mãn tính",
  "Xơ vữa động mạch",
  "Viêm phế quản mãn tính",
  "Bệnh phổi tắc nghẽn mạn tính – COPD",
  "Hen phế quản",
  "Suy giáp mãn tính",
  "Đái tháo đường",
  "Rối loạn lipid máu",
  "Bệnh Parkinson",
  "Đa xơ cứng",
  "Động kinh",
  "Rối loạn tâm thần phân liệt",
  "Trầm cảm mãn tính",
  "Rối loạn lo âu kéo dài",
  "Viêm khớp dạng thấp",
  "Thoái hóa khớp",
  "Loãng xương",
  "Viêm gan mạn tính",
  "Xơ gan",
  "Viêm da cơ địa mạn tính",
  "Vảy nến",
  "Suy thận mạn tính",
  "Viêm tuyến tiền liệt mạn tính",
  "Ung thư gan",
  "Ung thư phổi",
  "Ung thư vú",
  "Viêm gan virus B và C mạn tính",
  "Nhiễm HIV/AIDS",
];

const COMMON_ALLERGIES = [
  'Không có',
  'Đậu phộng',
  'Hạt cây (hạnh nhân, óc chó, hạt điều)',
  'Sữa',
  'Trứng',
  'Đậu nành',
  'Lúa mì',
  'Cá',
  'Động vật có vỏ (tôm, cua, sò)',
  'Hạt mè',
  'Sulfites',
  'Gluten',
  'Lactose',
  'Hải sản',
  'Thịt bò',
  'Thịt gà',
  'Thịt lợn',
  'Rau củ (cà chua, cà rốt)',
  'Trái cây (dâu tây, cam, táo)',
  'Gia vị (ớt, tiêu, tỏi)'
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newCondition, setNewCondition] = useState('');
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [showAllergyDropdown, setShowAllergyDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dateOfBirth: '',
    weight: '',
    height: '',
    allergies: [] as string[],
    medicalConditions: [] as string[]
  });

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchUserData();
  }, [status, router]);

  useEffect(() => {
    if (userData?.image) {
      setAvatarPreview(userData.image);
    }
  }, [userData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.allergy-dropdown') && !target.closest('.condition-dropdown')) {
        setShowAllergyDropdown(false);
        setShowConditionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        
        // Populate form with user data
        const user = data.user;
        setFormData({
          name: user.name || '',
          gender: user.gender || '',
          dateOfBirth: user.dateOfBirth || '',
          weight: user.weight?.toString() || '',
          height: user.height?.toString() || '',
          allergies: user.allergies || [],
          medicalConditions: user.medicalConditions || []
        });
      } else {
        setError('Không thể tải thông tin người dùng');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMedicalCondition = (condition?: string) => {
    const conditionToAdd = condition || newCondition.trim();
    if (conditionToAdd && !formData.medicalConditions.includes(conditionToAdd)) {
      let updatedConditions: string[];
      
      if (conditionToAdd === 'Không có') {
        updatedConditions = ['Không có'];
      } else {
        updatedConditions = formData.medicalConditions
          .filter(c => c !== 'Không có')
          .concat(conditionToAdd);
      }
      
      setFormData(prev => ({
        ...prev,
        medicalConditions: updatedConditions
      }));
      setNewCondition('');
      setShowConditionDropdown(false);
    }
  };

  const removeMedicalCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter(c => c !== condition)
    }));
  };

  const addAllergy = (allergy?: string) => {
    const allergyToAdd = allergy || newAllergy.trim();
    if (allergyToAdd && !formData.allergies.includes(allergyToAdd)) {
      let updatedAllergies: string[];
      
      if (allergyToAdd === 'Không có') {
        updatedAllergies = ['Không có'];
      } else {
        updatedAllergies = formData.allergies
          .filter(a => a !== 'Không có')
          .concat(allergyToAdd);
      }
      
      setFormData(prev => ({
        ...prev,
        allergies: updatedAllergies
      }));
      setNewAllergy('');
      setShowAllergyDropdown(false);
    }
  };

  const removeAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const filteredConditions = COMMON_MEDICAL_CONDITIONS.filter(
    condition => {
      if (formData.medicalConditions.includes('Không có')) {
        return condition === 'Không có' && 
               condition.toLowerCase().includes(newCondition.toLowerCase());
      }
      
      if (condition === 'Không có') {
        return false;
      }
      
      return !formData.medicalConditions.includes(condition) &&
             condition.toLowerCase().includes(newCondition.toLowerCase());
    }
  );

  const filteredAllergies = COMMON_ALLERGIES.filter(
    allergy => {
      if (formData.allergies.includes('Không có')) {
        return allergy === 'Không có' && 
               allergy.toLowerCase().includes(newAllergy.toLowerCase());
      }
      
      if (allergy === 'Không có') {
        return false;
      }
      
      return !formData.allergies.includes(allergy) &&
             allergy.toLowerCase().includes(newAllergy.toLowerCase());
    }
  );

  // Avatar upload handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAvatarError('Chỉ chấp nhận file ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('Ảnh quá lớn (tối đa 5MB)');
        return;
      }
      setAvatarFile(file);
      setAvatarError(null);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const formData = new FormData();
      formData.append('image', avatarFile);
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setAvatarPreview(data.imageUrl);
        setUserData((prev) => prev ? { ...prev, image: data.imageUrl } : prev);
        setAvatarFile(null);
        setSuccess('Cập nhật avatar thành công!');
        await fetch('/api/auth/session?update');
        window.location.reload();
      } else {
        setAvatarError(data.message || 'Lỗi khi upload avatar');
      }
    } catch (err) {
      setAvatarError('Lỗi khi upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const res = await fetch('/api/user/avatar', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setAvatarPreview(null);
        setUserData((prev) => prev ? { ...prev, image: undefined } : prev);
        setSuccess('Đã xóa avatar!');
        await fetch('/api/auth/session?update');
        window.location.reload();
      } else {
        setAvatarError(data.message || 'Lỗi khi xóa avatar');
      }
    } catch (err) {
      setAvatarError('Lỗi khi xóa avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined
      };

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setSuccess('Cập nhật thông tin thành công!');
        await fetch('/api/auth/session?update');
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-primary via-white-primary to-orange-primary/10 dark:from-dark-bg dark:via-dark-card dark:to-orange-primary/5">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-brown-primary/70 dark:text-dark-text-secondary">Đang tải thông tin...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-primary via-white-primary to-orange-primary/10 dark:from-dark-bg dark:via-dark-card dark:to-orange-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
    
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-brown-primary dark:text-dark-text mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Hồ Sơ Cá Nhân
              </motion.h1>
    
            </div>

            {/* Avatar Section */}
            <motion.div 
              className="card-glass p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  {avatarPreview ? (
                    <motion.img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-orange-primary/20 shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  ) : (
                    <motion.div 
                      className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-primary to-green-primary flex items-center justify-center text-4xl text-white-primary font-bold shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {userData?.name?.[0] || userData?.email?.[0] || 'U'}
                    </motion.div>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-white-primary/80 dark:bg-dark-card/80 flex items-center justify-center rounded-full">
                      <div className="loading-spinner w-8 h-8"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-semibold text-brown-primary dark:text-dark-text">
                    Ảnh Đại Diện
                  </h3>
                  <p className="text-brown-primary/70 dark:text-dark-text-secondary">
                    Cập nhật ảnh đại diện để cá nhân hóa hồ sơ của bạn
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={avatarUploading}
                      />
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-primary to-green-primary text-white-primary rounded-xl hover:from-orange-primary/90 hover:to-green-primary/90 transition-all duration-300 transform hover:scale-105">
                        <Camera className="w-4 h-4" />
                        Chọn ảnh
                      </div>
                    </label>
                    
                    {avatarFile && (
                      <motion.button
                        type="button"
                        onClick={handleAvatarUpload}
                        disabled={avatarUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-primary to-orange-primary text-white-primary rounded-xl hover:from-green-primary/90 hover:to-orange-primary/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Save className="w-4 h-4" />
                        {avatarUploading ? 'Đang lưu...' : 'Lưu avatar'}
                      </motion.button>
                    )}
                    
                    {avatarPreview && (
                      <motion.button
                        type="button"
                        onClick={handleAvatarDelete}
                        disabled={avatarUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white-primary rounded-xl hover:from-red-500/90 hover:to-red-600/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa avatar
                      </motion.button>
                    )}
                  </div>
                  
                  {avatarError && (
                    <motion.div 
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <p className="text-red-600 dark:text-red-400 text-sm">{avatarError}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Error/Success Messages */}
            {error && (
              <motion.div 
                className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div 
                className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-green-600 dark:text-green-400">{success}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Thông tin cơ bản */}
                <motion.div 
                  className="card-glass p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-primary to-green-primary rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-brown-primary dark:text-dark-text">
                      Thông Tin Cơ Bản
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={userData?.email || ''}
                        disabled
                        className="input-primary bg-gray-50 dark:bg-dark-bg/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Nhập họ và tên"
                        className="input-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                        Giới tính
                      </label>
                      <select 
                        value={formData.gender} 
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="input-primary"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="input-primary"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Thông tin thể chất */}
                <motion.div 
                  className="card-glass p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-primary to-orange-primary rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-brown-primary dark:text-dark-text">
                      Thông Tin Thể Chất
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                        <Scale className="w-4 h-4 inline mr-2" />
                        Cân nặng (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        placeholder="Nhập cân nặng"
                        min="0"
                        step="0.1"
                        className="input-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                        <Ruler className="w-4 h-4 inline mr-2" />
                        Chiều cao (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder="Nhập chiều cao"
                        min="0"
                        step="0.1"
                        className="input-primary"
                      />
                    </div>


                  </div>
                </motion.div>
              </div>

              {/* Thông tin bệnh lý */}
              <motion.div 
                className="card-glass p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-brown-primary to-orange-primary rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-brown-primary dark:text-dark-text">
                      Thông Tin Bệnh Lý
                    </h2>
                    <p className="text-brown-primary/70 dark:text-dark-text-secondary">
                      Chọn các bệnh lý để nhận được gợi ý món ăn phù hợp với tình trạng sức khỏe
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          value={newCondition}
                          onChange={(e) => {
                            setNewCondition(e.target.value);
                            setShowConditionDropdown(true);
                          }}
                          onFocus={() => setShowConditionDropdown(true)}
                          placeholder="Tìm kiếm hoặc nhập bệnh lý"
                          className="input-primary"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addMedicalCondition();
                            }
                          }}
                        />
                        {showConditionDropdown && (
                          <div className="condition-dropdown absolute top-full left-0 right-0 z-50 bg-white-primary dark:bg-dark-card border border-orange-primary/20 dark:border-orange-primary/10 rounded-xl shadow-xl max-h-60 overflow-y-auto mt-1">
                            {filteredConditions.length > 0 ? (
                              filteredConditions.map((condition, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="w-full text-left p-3 hover:bg-orange-primary/10 dark:hover:bg-orange-primary/20 focus:bg-orange-primary/10 dark:focus:bg-orange-primary/20 focus:outline-none border-b border-orange-primary/10 last:border-b-0"
                                  onClick={() => addMedicalCondition(condition)}
                                >
                                  {condition}
                                </button>
                              ))
                            ) : newCondition.trim() ? (
                              <div className="p-3 text-brown-primary/50 dark:text-dark-text-secondary">
                                Không tìm thấy bệnh lý. Nhấn Enter để thêm "{newCondition}"
                              </div>
                            ) : (
                              <div className="p-3 text-brown-primary/50 dark:text-dark-text-secondary">
                                Gõ để tìm kiếm bệnh lý
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => addMedicalCondition()}
                        disabled={!newCondition.trim()}
                        className="px-4 py-3 bg-gradient-to-r from-orange-primary to-green-primary text-white-primary rounded-xl hover:from-orange-primary/90 hover:to-green-primary/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Danh sách bệnh lý phổ biến */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-brown-primary dark:text-dark-text">
                      Bệnh lý phổ biến:
                    </label>
                    
                    {/* Hiển thị "Không có" riêng biệt */}
                    <div>
                      <motion.button
                        type="button"
                        onClick={() => addMedicalCondition('Không có')}
                        disabled={formData.medicalConditions.includes('Không có')}
                        className={`px-6 py-3 rounded-xl text-sm border transition-all duration-300 transform hover:scale-105 ${
                          formData.medicalConditions.includes('Không có')
                            ? 'bg-green-primary/20 text-green-primary border-green-primary/30 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-primary/10 to-green-primary/20 text-green-primary border-green-primary/30 hover:from-green-primary/20 hover:to-green-primary/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Shield className="w-4 h-4 inline mr-2" />
                        Không có
                      </motion.button>
                    </div>

                    {/* Hiển thị các bệnh lý khác chỉ khi chưa chọn "Không có" */}
                    {!formData.medicalConditions.includes('Không có') && (
                      <div className="flex flex-wrap gap-3">
                        {COMMON_MEDICAL_CONDITIONS.slice(1, 11).map((condition) => (
                          <motion.button
                            key={condition}
                            type="button"
                            onClick={() => addMedicalCondition(condition)}
                            disabled={formData.medicalConditions.includes(condition)}
                            className={`px-4 py-2 rounded-xl text-sm border transition-all duration-300 transform hover:scale-105 ${
                              formData.medicalConditions.includes(condition)
                                ? 'bg-orange-primary/20 text-orange-primary border-orange-primary/30 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-primary/10 to-orange-primary/20 text-orange-primary border-orange-primary/30 hover:from-orange-primary/20 hover:to-orange-primary/30'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {condition}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>

                  {formData.medicalConditions.length > 0 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-brown-primary dark:text-dark-text">
                        Bệnh lý đã chọn:
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {formData.medicalConditions.map((condition, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-2 bg-gradient-to-r from-orange-primary/20 to-green-primary/20 text-orange-primary dark:text-orange-primary border border-orange-primary/30 px-4 py-2 rounded-xl text-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Heart className="w-4 h-4" />
                            <span>{condition}</span>
                            <motion.button
                              type="button"
                              onClick={() => removeMedicalCondition(condition)}
                              className="hover:bg-orange-primary/30 rounded-full p-1 transition-colors"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Thông tin dị ứng */}
              <motion.div 
                className="card-glass p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-primary to-green-primary rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white-primary" />
                    </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-brown-primary dark:text-dark-text">
                      Thông Tin Dị Ứng
                    </h2>
                    <p className="text-brown-primary/70 dark:text-dark-text-secondary">
                      Chọn các dị ứng để tránh các món ăn có thể gây phản ứng không mong muốn
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          value={newAllergy}
                          onChange={(e) => {
                            setNewAllergy(e.target.value);
                            setShowAllergyDropdown(true);
                          }}
                          onFocus={() => setShowAllergyDropdown(true)}
                          placeholder="Tìm kiếm hoặc nhập dị ứng"
                          className="input-primary"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addAllergy();
                            }
                          }}
                        />
                        {showAllergyDropdown && (
                          <div className="allergy-dropdown absolute top-full left-0 right-0 z-50 bg-white-primary dark:bg-dark-card border border-orange-primary/20 dark:border-orange-primary/10 rounded-xl shadow-xl max-h-60 overflow-y-auto mt-1">
                            {filteredAllergies.length > 0 ? (
                              filteredAllergies.map((allergy, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="w-full text-left p-3 hover:bg-orange-primary/10 dark:hover:bg-orange-primary/20 focus:bg-orange-primary/10 dark:focus:bg-orange-primary/20 focus:outline-none border-b border-orange-primary/10 last:border-b-0"
                                  onClick={() => addAllergy(allergy)}
                                >
                                  {allergy}
                                </button>
                              ))
                            ) : newAllergy.trim() ? (
                              <div className="p-3 text-brown-primary/50 dark:text-dark-text-secondary">
                                Không tìm thấy dị ứng. Nhấn Enter để thêm "{newAllergy}"
                              </div>
                            ) : (
                              <div className="p-3 text-brown-primary/50 dark:text-dark-text-secondary">
                                Gõ để tìm kiếm dị ứng
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => addAllergy()}
                        disabled={!newAllergy.trim()}
                        className="px-4 py-3 bg-gradient-to-r from-orange-primary to-green-primary text-white-primary rounded-xl hover:from-orange-primary/90 hover:to-green-primary/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Danh sách dị ứng phổ biến */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-brown-primary dark:text-dark-text">
                      Dị ứng phổ biến:
                    </label>
                    
                    {/* Hiển thị "Không có" riêng biệt */}
                    <div>
                      <motion.button
                        type="button"
                        onClick={() => addAllergy('Không có')}
                        disabled={formData.allergies.includes('Không có')}
                        className={`px-6 py-3 rounded-xl text-sm border transition-all duration-300 transform hover:scale-105 ${
                          formData.allergies.includes('Không có')
                            ? 'bg-green-primary/20 text-green-primary border-green-primary/30 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-primary/10 to-green-primary/20 text-green-primary border-green-primary/30 hover:from-green-primary/20 hover:to-green-primary/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Shield className="w-4 h-4 inline mr-2" />
                        Không có
                      </motion.button>
                    </div>

                    {/* Hiển thị các dị ứng khác chỉ khi chưa chọn "Không có" */}
                    {!formData.allergies.includes('Không có') && (
                      <div className="flex flex-wrap gap-3">
                        {COMMON_ALLERGIES.slice(1, 11).map((allergy) => (
                          <motion.button
                            key={allergy}
                            type="button"
                            onClick={() => addAllergy(allergy)}
                            disabled={formData.allergies.includes(allergy)}
                            className={`px-4 py-2 rounded-xl text-sm border transition-all duration-300 transform hover:scale-105 ${
                              formData.allergies.includes(allergy)
                                ? 'bg-orange-primary/20 text-orange-primary border-orange-primary/30 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-primary/10 to-orange-primary/20 text-orange-primary border-orange-primary/30 hover:from-orange-primary/20 hover:to-orange-primary/30'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {allergy}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hiển thị dị ứng đã chọn */}
                  {formData.allergies.length > 0 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-brown-primary dark:text-dark-text">
                        Dị ứng đã chọn:
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {formData.allergies.map((allergy, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-2 bg-gradient-to-r from-orange-primary/20 to-green-primary/20 text-orange-primary dark:text-orange-primary border border-orange-primary/30 px-4 py-2 rounded-xl text-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Shield className="w-4 h-4" />
                            <span>{allergy}</span>
                            <motion.button
                              type="button"
                              onClick={() => removeAllergy(allergy)}
                              className="hover:bg-orange-primary/30 rounded-full p-1 transition-colors"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Nút lưu */}
              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <motion.button 
                  type="submit" 
                  disabled={saving}
                  className="group btn-primary text-lg px-12 py-4 shadow-2xl hover:shadow-orange-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="loading-spinner w-5 h-5 mr-2"></div>
                      Đang lưu...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Lưu thay đổi
                    </div>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 