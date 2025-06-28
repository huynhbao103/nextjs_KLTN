'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Navigation, AlertCircle } from 'lucide-react';

interface LocationDisplayProps {
  address: string | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSearchAddress?: (address: string) => void;
  showSearch?: boolean;
}

export function LocationDisplay({
  address,
  loading,
  error,
  onRefresh,
  onSearchAddress,
  showSearch = false
}: LocationDisplayProps) {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim() && onSearchAddress) {
      onSearchAddress(searchValue.trim());
    }
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Navigation className="h-4 w-4 text-green-500 flex-shrink-0" />
          Vị trí hiện tại
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
              Đang xác định vị trí...
            </span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-red-800">Lỗi xác định vị trí</p>
              <p className="text-xs text-red-600 break-words">{error}</p>
            </div>
          </div>
        ) : address ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-blue-800">Địa chỉ hiện tại</p>
                <p className="text-xs text-blue-600 break-words">{address}</p>
              </div>
            </div>
            
            <Button
              onClick={onRefresh}
              disabled={loading}
              className="w-full text-xs sm:text-sm py-2 sm:py-2.5"
              variant="outline"
            >
              <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Cập nhật vị trí
            </Button>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Chưa có thông tin vị trí
            </p>
            <Button
              onClick={onRefresh}
              disabled={loading}
              className="mt-2 text-xs sm:text-sm py-2 sm:py-2.5"
              variant="outline"
            >
              Lấy vị trí hiện tại
            </Button>
          </div>
        )}

        {/* Search by Address */}
        {showSearch && onSearchAddress && (
          <div className="pt-3 sm:pt-4 border-t">
            <form onSubmit={handleSearch} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nhập địa chỉ để tìm kiếm..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="flex-1 text-xs sm:text-sm"
                />
                <Button
                  type="submit"
                  disabled={!searchValue.trim() || loading}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Hoặc tìm kiếm thời tiết theo địa chỉ
              </p>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 