'use client';

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/header/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format, differenceInDays, addDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, UserIcon, PhoneIcon, ScaleIcon, RulerIcon, ActivityIcon, HeartIcon, CameraIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'

interface User {
  id: string
  name?: string | null
  email?: string | null
  phone?: string
  dateOfBirth?: Date
  gender?: string
  weight?: number
  height?: number
  activityLevel?: string
  medicalConditions?: string[]
  lastUpdateDate?: Date
  image?: string | null
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [nextUpdateDate, setNextUpdateDate] = useState<Date | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    medicalConditions: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user) {
      const user = session.user as User
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? format(new Date(user.dateOfBirth), 'yyyy-MM-dd') : '',
        gender: user.gender || '',
        weight: user.weight?.toString() || '',
        height: user.height?.toString() || '',
        activityLevel: user.activityLevel || '',
        medicalConditions: user.medicalConditions?.join(', ') || ''
      })
      setAvatarUrl(user.image || null)

      if (user.lastUpdateDate) {
        const lastUpdate = new Date(user.lastUpdateDate)
        const daysSinceLastUpdate = differenceInDays(new Date(), lastUpdate)
        const nextUpdate = addDays(lastUpdate, 30)
        
        setNeedsConfirmation(daysSinceLastUpdate >= 30)
        setNextUpdateDate(nextUpdate)
      }
    }
  }, [session, status, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Kích thước ảnh không được vượt quá 5MB' })
      return
    }

    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file ảnh hợp lệ' })
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setAvatarUrl(data.imageUrl)
        setMessage({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' })
        // Cập nhật session để hiển thị ảnh mới
        await update({
          ...session,
          user: {
            ...session?.user,
            image: data.imageUrl
          }
        })
      } else {
        setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật ảnh đại diện' })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!avatarUrl) return

    setUploading(true)
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setAvatarUrl(null)
        setMessage({ type: 'success', text: 'Xóa ảnh đại diện thành công!' })
        // Cập nhật session để hiển thị ảnh mới
        await update({
          ...session,
          user: {
            ...session?.user,
            image: null
          }
        })
      } else {
        setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra khi xóa ảnh đại diện' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xóa ảnh đại diện' })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
          medicalConditions: formData.medicalConditions
            ? formData.medicalConditions.split(',').map(condition => condition.trim())
            : [],
          confirmUpdate: true
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
        setNeedsConfirmation(false)
        setNextUpdateDate(addDays(new Date(), 30))
      } else if (data.needsConfirmation) {
        setNeedsConfirmation(true)
        setMessage({ type: 'error', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra khi cập nhật thông tin' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật thông tin' })
    } finally {
      setLoading(false)
    }
  }

  const handleSkipUpdate = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          confirmUpdate: true,
          skipUpdate: true
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Đã xác nhận không cần cập nhật thông tin!' })
        setNeedsConfirmation(false)
        setNextUpdateDate(addDays(new Date(), 30))
      } else {
        setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
    <Header />
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-border bg-card shadow-lg dark:bg-dark-card dark:border-neutral-700 dark:shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2 dark:text-white">
              <UserIcon className="h-6 w-6 text-primary dark:text-white" />
              Hồ sơ cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary dark:border-orange-primary">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <UserIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 flex gap-2">
                  <label
                    htmlFor="avatar-upload"
                    className="bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors dark:bg-orange-primary dark:hover:bg-orange-primary/90"
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
                      className="bg-red-500 text-white p-2 rounded-full cursor-pointer hover:bg-red-600 transition-colors"
                    >
                      <Trash2Icon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground dark:text-white">
                {uploading ? 'Đang xử lý...' : avatarUrl ? 'Nhấn vào biểu tượng camera để thay đổi ảnh đại diện' : 'Nhấn vào biểu tượng camera để thêm ảnh đại diện'}
              </p>
            </div>

            {needsConfirmation && (
              <Alert className="mb-6 bg-yellow-50/50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 dark:text-white">
                <AlertDescription className="text-yellow-800 dark:text-yellow-100 dark:text-white">
                  Thông tin của bạn đã quá 30 ngày chưa được xác nhận. Vui lòng xác nhận xem bạn có cần cập nhật thông tin không.
                </AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className={`mb-6 ${
                message.type === 'success' 
                  ? 'bg-green-50/50 dark:bg-green-900/30 border-green-200 dark:border-green-800' 
                  : 'bg-red-50/50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
              }`}>
                <AlertDescription className={
                  message.type === 'success'
                    ? 'text-green-800 dark:text-green-100'
                    : 'text-red-800 dark:text-red-100'
                }>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium dark:text-white">Họ và tên</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="pl-10 bg-background text-foreground border-input dark:bg-[#23272f] dark:text-neutral-100 dark:border-neutral-700 dark:placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium dark:text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted/50 text-muted-foreground border-input dark:bg-[#23272f] dark:text-neutral-100 dark:border-neutral-700 dark:placeholder:text-neutral-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground font-medium dark:text-white">Số điện thoại</Label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 bg-background text-foreground border-input dark:bg-[#23272f] dark:text-neutral-100 dark:border-neutral-700 dark:placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-foreground font-medium dark:text-white">Ngày sinh</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      required
                      className="pl-10 bg-background text-foreground border-input dark:bg-[#23272f] dark:text-neutral-100 dark:border-neutral-700 dark:placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-foreground font-medium dark:text-white">Giới tính</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger className=" bg-white  text-foreground border-input dark:bg-[#23272f] dark:text-neutral-100 dark:border-neutral-700">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#23272f] bg-white dark:text-neutral-100 dark:border-neutral-700 dark:placeholder:text-neutral-400">
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-foreground font-medium dark:text-white">Cân nặng (kg)</Label>
                  <div className="relative">
                    <ScaleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white" />
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      required
                      className="pl-10 bg-background text-foreground border-input dark:bg-[#23272f] dark:text-neutral-100 dark:border-neutral-700 dark:placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-foreground font-medium dark:text-white">Chiều cao (cm)</Label>
                  <div className="relative">
                    <RulerIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white" />
                    <Input
                      id="height"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      required
                      className="pl-10 bg-background text-foreground border-input dark:bg-[#23272f] dark:text-neutral-100 dark:border-neutral-700 dark:placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityLevel" className="text-foreground font-medium dark:text-white">Mức độ hoạt động</Label>
                  <div className="relative">
                    <ActivityIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white" />
                    <Select
                      value={formData.activityLevel}
                      onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
                    >
                      <SelectTrigger className="pl-10 bg-white text-foreground border-input dark:bg-[#23272f] dark:text-neutral-100 dark:border-neutral-700">
                        <SelectValue placeholder="Chọn mức độ hoạt động" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-[#23272f] bg-white dark:text-neutral-100 dark:border-neutral-700 dark:placeholder:text-neutral-400">
                        <SelectItem value="sedentary">Ít vận động (ngồi nhiều)</SelectItem>
                        <SelectItem value="light">Vận động nhẹ (1-3 lần/tuần)</SelectItem>
                        <SelectItem value="moderate">Vận động vừa (3-5 lần/tuần)</SelectItem>
                        <SelectItem value="active">Vận động nhiều (6-7 lần/tuần)</SelectItem>
                        <SelectItem value="very_active">Vận động rất nhiều (2 lần/ngày)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="my-6 bg-border" />

              <div className="space-y-2">
                <Label htmlFor="medicalConditions" className="text-foreground font-medium dark:text-white">Tình trạng sức khỏe</Label>
                <div className="relative">
                  <HeartIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white" />
                  <Input
                    id="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                    placeholder="Ví dụ: Tiểu đường, Huyết áp cao"
                    className="pl-10 bg-background text-foreground border-input dark:bg-[#23272f] dark:text-neutral-100 dark:border-neutral-700 dark:placeholder:text-neutral-400"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1 dark:text-white  ">
                  Nhập các tình trạng sức khỏe của bạn, phân cách bằng dấu phẩy
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                {needsConfirmation && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkipUpdate}
                    disabled={loading}
                    className="border-border hover:bg-muted text-foreground dark:bg-primary/90 dark:text-white"
                  >
                    Không cần cập nhật
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary text-lg dark:bg-orange-primary dark:hover:bg-orange-primary/90"
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
} 