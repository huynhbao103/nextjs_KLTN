"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Carrot,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load Header component
const Header = dynamic(() => import('@/components/header/page'), {
  loading: () => <div className="h-20 bg-white-primary dark:bg-dark-card animate-pulse" />,
  ssr: false
});

// Lazy load IngredientModal component
const IngredientModal = dynamic(() => import('@/components/admin/IngredientModal'), {
  loading: () => <div />,
  ssr: false
});

interface Ingredient {
  _id?: string;
  id?: number;          // Giữ nguyên là number để tương thích với database
  name: string;
  category?: string;    // Thêm field category
  description?: string; // Thêm field description
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;  // Thêm field created_at
  updated_at?: string;  // Thêm field updated_at
}

export default function AdminIngredientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Check if user is admin
  React.useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [status, session, router]);

  // Fetch ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '20',
          search: searchTerm
        });
        
        const response = await fetch(`/api/ingredients?${params}`);
        const data = await response.json();

        if (data.success) {
          
          setIngredients(data.data || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalItems(data.pagination?.total || 0);
        } else {
          console.error('API returned error:', data);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchIngredients();
    }
  }, [session, currentPage, searchTerm]);

  // Debug log khi searchTerm thay đổi
  useEffect(() => {
    
  }, [searchTerm]);

  // Debug log khi ingredients state thay đổi
  useEffect(() => {
    
  }, [ingredients]);

  // Modal handlers
  const handleAddIngredient = () => {
    setSelectedIngredient(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleSaveIngredient = async (ingredientData: Ingredient) => {
    try {
      const url = ingredientData._id 
        ? `/api/ingredients/${ingredientData._id}` 
        : '/api/ingredients';
      
      const method = ingredientData._id ? 'PUT' : 'POST';
      
      
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredientData),
      });

      const data = await response.json();
      
      
      if (data.success) {
        setIsModalOpen(false);
        // Refresh ingredients list
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '20',
          search: searchTerm
        });
        const refreshResponse = await fetch(`/api/ingredients?${params}`);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setIngredients(refreshData.data || []);
          setTotalItems(prev => ingredientData._id ? prev : prev + 1);
        }
      } else {
        alert('Lỗi khi lưu nguyên liệu: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving ingredient:', error);
      alert('Lỗi khi lưu nguyên liệu');
    }
  };

  // Delete ingredient
  const handleDeleteIngredient = async (ingredientId: string) => {
    if (!confirm('Bạn có chắc muốn xóa nguyên liệu này?')) return;
    
    try {
      const response = await fetch(`/api/ingredients/${ingredientId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        // Refresh ingredients list
        const updatedIngredients = ingredients.filter(ingredient => ingredient._id !== ingredientId);
        setIngredients(updatedIngredients);
        setTotalItems(prev => prev - 1);
      } else {
        alert('Lỗi khi xóa nguyên liệu');
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Lỗi khi xóa nguyên liệu');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-primary via-white-primary to-orange-primary/10 dark:from-dark-bg dark:via-dark-card dark:to-orange-primary/5">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="loading-spinner w-12 h-12"></div>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return null; // Will redirect
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-primary via-white-primary to-orange-primary/10 dark:from-dark-bg dark:via-dark-card dark:to-orange-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-primary to-emerald-500 rounded-full flex items-center justify-center">
                <Carrot className="w-8 h-8 text-white-primary" />
              </div>
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-brown-primary dark:text-dark-text mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Quản Lý Nguyên Liệu
            </motion.h1>
            <motion.p 
              className="text-lg text-brown-primary/70 dark:text-dark-text-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Quản lý danh sách nguyên liệu trong hệ thống
            </motion.p>
          </div>

          {/* Back to Manage */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/admin/manage"
              className="inline-flex items-center gap-2 text-brown-primary dark:text-dark-text hover:text-orange-primary dark:hover:text-orange-primary transition-all duration-300 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay về Quản Lý Hệ Thống
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="card-glass p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="text-center p-4 bg-gradient-to-br from-green-primary/10 to-emerald-500/10 rounded-xl">
                   <div className="text-3xl font-bold text-green-primary mb-2">{totalItems}</div>
                   <div className="text-brown-primary/70 dark:text-dark-text-secondary">Tổng nguyên liệu</div>
                 </div>
                                 <div className="text-center p-4 bg-gradient-to-br from-blue-primary/10 to-cyan-500/10 rounded-xl">
                   <div className="text-3xl font-bold text-blue-primary mb-2">{ingredients.length}</div>
                   <div className="text-brown-primary/70 dark:text-dark-text-secondary">Đang hiển thị</div>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Add */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <div className="card-glass p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-primary/50 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm nguyên liệu..."
                      value={searchTerm}
                      onChange={(e) => {

                        setSearchTerm(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-brown-primary/20 rounded-lg bg-white-primary dark:bg-dark-card text-brown-primary dark:text-dark-text placeholder-brown-primary/50 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddIngredient}
                  className="px-6 py-3 bg-gradient-to-r from-green-primary to-emerald-500 text-white-primary rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <Plus className="w-5 h-5" />
                  Thêm nguyên liệu
                </button>
              </div>
            </div>
          </motion.div>

          {/* Ingredients List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="card-glass p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="loading-spinner w-12 h-12"></div>
                </div>
                             ) : ingredients.length === 0 ? (
                <div className="text-center py-12">
                  <Carrot className="w-16 h-16 text-brown-primary/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-brown-primary dark:text-dark-text mb-2">
                    Không tìm thấy nguyên liệu
                  </h3>
                  <p className="text-brown-primary/70 dark:text-dark-text-secondary">
                    {searchTerm 
                      ? 'Thử thay đổi từ khóa tìm kiếm' 
                      : 'Chưa có nguyên liệu nào trong hệ thống'}
                  </p>
                </div>
              ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                   {ingredients.map((ingredient, index) => (
                    <motion.div
                      key={ingredient._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                      className="bg-white-primary dark:bg-dark-card rounded-xl p-4 border border-brown-primary/10 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-brown-primary dark:text-dark-text mb-1">
                            {ingredient.name}
                          </h3>
                          {ingredient.id && (
                            <p className="text-sm text-brown-primary/60 dark:text-dark-text-secondary mb-1">
                              ID: {ingredient.id}
                            </p>
                          )}
                          {ingredient.category && ingredient.category.trim() && (
                            <p className="text-xs text-green-primary bg-green-primary/10 px-2 py-1 rounded-full inline-block mb-1">
                              {ingredient.category}
                            </p>
                          )}
                          {ingredient.description && ingredient.description.trim() && (
                            <p className="text-xs text-brown-primary/70 dark:text-dark-text-secondary overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {ingredient.description}
                            </p>
                          )}
                          {(!ingredient.category || !ingredient.category.trim()) && (!ingredient.description || !ingredient.description.trim()) && (
                            <p className="text-xs text-brown-primary/40 dark:text-dark-text-secondary/40 italic">
                              Chưa có thông tin bổ sung
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleViewIngredient(ingredient)}
                            className="p-1.5 text-blue-primary hover:bg-blue-primary/10 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditIngredient(ingredient)}
                            className="p-1.5 text-orange-primary hover:bg-orange-primary/10 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => ingredient._id && handleDeleteIngredient(ingredient._id)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-brown-primary/50 dark:text-dark-text-secondary">
                        <p>Cập nhật: {new Date(ingredient.updated_at || ingredient.created_at || ingredient.updatedAt || ingredient.createdAt || Date.now()).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-8"
            >
              <div className="card-glass p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-brown-primary/70 dark:text-dark-text-secondary">
                    Hiển thị {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalItems)} của {totalItems} nguyên liệu
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-brown-primary dark:text-dark-text hover:bg-brown-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      Trước
                    </button>
                    {/* Compact page numbers with ellipses; nowrap + horizontal scroll if long */}
                    <div className="max-w-full overflow-x-auto no-scrollbar">
                      <div className="flex items-center gap-2 whitespace-nowrap px-1">
                        {(() => {
                          const items: (number | string)[] = [];
                          if (totalPages <= 7) {
                            for (let i = 1; i <= totalPages; i++) items.push(i);
                          } else {
                            items.push(1);
                            if (currentPage > 4) items.push('left-ellipsis');
                            const start = Math.max(2, currentPage - 1);
                            const end = Math.min(totalPages - 1, currentPage + 1);
                            for (let i = start; i <= end; i++) items.push(i);
                            if (currentPage < totalPages - 3) items.push('right-ellipsis');
                            items.push(totalPages);
                          }
                          return items.map((item, idx) => {
                            if (typeof item === 'string') {
                              return <span key={`${item}-${idx}`} className="px-2 text-sm text-brown-primary/50">…</span>;
                            }
                            const page = item as number;
                            const isActive = currentPage === page;
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-green-primary text-white-primary'
                                    : 'text-brown-primary dark:text-dark-text hover:bg-brown-primary/10'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-brown-primary dark:text-dark-text hover:bg-brown-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Ingredient Modal */}
      <IngredientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ingredient={selectedIngredient}
        onSave={handleSaveIngredient}
        isViewMode={isViewMode}
      />
    </div>
  );
} 