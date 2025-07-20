'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePicker from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { X, Plus, ChevronDown } from 'lucide-react';

interface UserData {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  weight?: number;
  height?: number;
  activityLevel?: string;
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

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dateOfBirth: '',
    weight: '',
    height: '',
    activityLevel: '',
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
          activityLevel: user.activityLevel || '',
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
        // Nếu chọn "Không có", xóa tất cả bệnh lý khác
        updatedConditions = ['Không có'];
      } else {
        // Nếu chọn bệnh lý khác, xóa "Không có" và thêm bệnh lý mới
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

  const filteredConditions = COMMON_MEDICAL_CONDITIONS.filter(
    condition => {
      // Nếu đã chọn "Không có", chỉ hiển thị "Không có"
      if (formData.medicalConditions.includes('Không có')) {
        return condition === 'Không có' && 
               condition.toLowerCase().includes(newCondition.toLowerCase());
      }
      
      // Nếu đã chọn bệnh lý khác, không hiển thị "Không có"
      if (condition === 'Không có') {
        return false;
      }
      
      // Hiển thị các bệnh lý khác chưa được chọn
      return !formData.medicalConditions.includes(condition) &&
             condition.toLowerCase().includes(newCondition.toLowerCase());
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải thông tin...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Hồ Sơ Cá Nhân</h1>
              <p className="text-muted-foreground">
                Cập nhật thông tin cá nhân để nhận được gợi ý món ăn phù hợp nhất
              </p>
              {/* Avatar section */}
              <div className="flex items-center gap-6 mt-6">
                <div className="relative w-24 h-24">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-500">
                      {userData?.name?.[0] || userData?.email?.[0] || 'U'}
                    </div>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="block">
                    <span className="sr-only">Chọn ảnh đại diện</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={handleAvatarChange}
                      disabled={avatarUploading}
                    />
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleAvatarUpload}
                      disabled={!avatarFile || avatarUploading}
                      className="px-4"
                    >
                      {avatarUploading ? 'Đang lưu...' : 'Lưu avatar'}
                    </Button>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleAvatarDelete}
                        disabled={avatarUploading}
                        className="px-4"
                      >
                        Xóa avatar
                      </Button>
                    )}
                  </div>
                  {avatarError && <div className="text-red-500 text-sm">{avatarError}</div>}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Thông tin cơ bản */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thông Tin Cơ Bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={userData?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="name">Họ và tên</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gender">Giới tính</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                      <DatePicker
                        value={formData.dateOfBirth}
                        onChange={(date) => handleInputChange('dateOfBirth', date)}
                        placeholder="Chọn ngày sinh"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Thông tin thể chất */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thông Tin Thể Chất</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="weight">Cân nặng (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        placeholder="Nhập cân nặng"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="height">Chiều cao (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder="Nhập chiều cao"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="activityLevel">Mức độ hoạt động</Label>
                      <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mức độ hoạt động" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Ít vận động</SelectItem>
                          <SelectItem value="light">Vận động nhẹ</SelectItem>
                          <SelectItem value="moderate">Vận động vừa phải</SelectItem>
                          <SelectItem value="active">Vận động nhiều</SelectItem>
                          <SelectItem value="very_active">Vận động rất nhiều</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Thông tin bệnh lý */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Thông Tin Bệnh Lý</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Chọn các bệnh lý để nhận được gợi ý món ăn phù hợp với tình trạng sức khỏe
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          value={newCondition}
                          onChange={(e) => {
                            setNewCondition(e.target.value);
                            setShowConditionDropdown(true);
                          }}
                          onFocus={() => setShowConditionDropdown(true)}
                          placeholder="Tìm kiếm hoặc nhập bệnh lý"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addMedicalCondition();
                            }
                          }}
                        />
                        {showConditionDropdown && (
                          <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredConditions.length > 0 ? (
                              filteredConditions.map((condition, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
                                  onClick={() => addMedicalCondition(condition)}
                                >
                                  {condition}
                                </button>
                              ))
                            ) : newCondition.trim() ? (
                              <div className="px-4 py-2 text-gray-500">
                                Không tìm thấy bệnh lý. Nhấn Enter để thêm "{newCondition}"
                              </div>
                            ) : (
                              <div className="px-4 py-2 text-gray-500">
                                Gõ để tìm kiếm bệnh lý
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={() => addMedicalCondition()}
                        disabled={!newCondition.trim()}
                        className="px-4"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Danh sách bệnh lý phổ biến */}
                  <div className="space-y-2">
                    <Label>Bệnh lý phổ biến:</Label>
                    
                    {/* Hiển thị "Không có" riêng biệt */}
                    <div className="mb-3">
                      <button
                        type="button"
                        onClick={() => addMedicalCondition('Không có')}
                        disabled={formData.medicalConditions.includes('Không có')}
                        className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                          formData.medicalConditions.includes('Không có')
                            ? 'bg-green-100 text-green-700 border-green-200 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        Không có
                      </button>
                    </div>

                    {/* Hiển thị các bệnh lý khác chỉ khi chưa chọn "Không có" */}
                    {!formData.medicalConditions.includes('Không có') && (
                      <div className="flex flex-wrap gap-2">
                        {COMMON_MEDICAL_CONDITIONS.slice(1, 11).map((condition) => (
                          <button
                            key={condition}
                            type="button"
                            onClick={() => addMedicalCondition(condition)}
                            disabled={formData.medicalConditions.includes(condition)}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                              formData.medicalConditions.includes(condition)
                                ? 'bg-blue-100 text-blue-700 border-blue-200 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            {condition}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {formData.medicalConditions.length > 0 && (
                    <div className="space-y-2">
                      <Label>Bệnh lý đã chọn:</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.medicalConditions.map((condition, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{condition}</span>
                            <button
                              type="button"
                              onClick={() => removeMedicalCondition(condition)}
                              className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator className="my-8" />

              {/* Nút lưu */}
              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="min-w-[120px]">
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 