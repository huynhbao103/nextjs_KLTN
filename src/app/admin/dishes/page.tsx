"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChefHat,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import DishModal from '@/components/admin/DishModal';
import dynamic from 'next/dynamic';

// Lazy load Header component
const Header = dynamic(() => import('@/components/header/page'), {
  loading: () => <div className="h-20 bg-white-primary dark:bg-dark-card animate-pulse" />,
  ssr: false
});

interface Dish {
  _id?: string;
  neo4j_id?: string;
  name: string;
  ingredients: string[];
  instructions?: string[];
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminDishesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
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

  // Fetch dishes
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
          search: searchTerm
        });
        
        const response = await fetch(`/api/dishes?${params}`);
        const data = await response.json();
        
        if (data.success) {
          
          setDishes(data.data || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalItems(data.pagination?.total || 0);
        } else {

        }
      } catch (error) {
        console.error('Error fetching dishes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchDishes();
    }
  }, [session, currentPage, searchTerm]);

  // Debug log khi searchTerm thay đổi
  useEffect(() => {
    
  }, [searchTerm]);

  // Debug log khi dishes state thay đổi
  useEffect(() => {

  }, [dishes]);

  // Delete dish
  const handleDeleteDish = async (dishId: string) => {
    if (!confirm('Bạn có chắc muốn xóa món ăn này?')) return;
    
    try {
      const response = await fetch(`/api/dishes/${dishId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        // Refresh dishes list
        const updatedDishes = dishes.filter(dish => dish._id !== dishId);
        setDishes(updatedDishes);
        setTotalItems(prev => prev - 1);
      } else {
        alert('Lỗi khi xóa món ăn');
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('Lỗi khi xóa món ăn');
    }
  };

  // Add/Edit dish
  const handleSaveDish = async (dishData: Dish) => {
    try {
      const url = selectedDish ? `/api/dishes/${selectedDish._id}` : '/api/dishes';
      const method = selectedDish ? 'PUT' : 'POST';
      
      
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dishData),
      });
      
      const data = await response.json();
      
      
      if (data.success) {
        if (selectedDish) {
          // Update existing dish
          setDishes(prev => prev.map(dish => 
            dish._id === selectedDish._id ? data.data : dish
          ));
        } else {
          // Add new dish
          setDishes(prev => [data.data, ...prev]);
          setTotalItems(prev => prev + 1);
        }
        setIsModalOpen(false);
        setSelectedDish(null);
        setIsViewMode(false);
      } else {
        alert('Lỗi khi lưu món ăn');
      }
    } catch (error) {
      console.error('Error saving dish:', error);
      alert('Lỗi khi lưu món ăn');
    }
  };

  // Open modal for add
  const handleAddDish = () => {
    setSelectedDish(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleEditDish = (dish: Dish) => {
    setSelectedDish(dish);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  // Open modal for view
  const handleViewDish = (dish: Dish) => {
    setSelectedDish(dish);
    setIsViewMode(true);
    setIsModalOpen(true);
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
              <div className="w-16 h-16 bg-gradient-to-br from-orange-primary to-red-500 rounded-full flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-white-primary" />
              </div>
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-brown-primary dark:text-dark-text mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Quản Lý Món Ăn
            </motion.h1>
            <motion.p 
              className="text-lg text-brown-primary/70 dark:text-dark-text-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Quản lý danh sách món ăn trong hệ thống
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 <div className="text-center p-4 bg-gradient-to-br from-orange-primary/10 to-red-500/10 rounded-xl">
                   <div className="text-3xl font-bold text-orange-primary mb-2">{totalItems}</div>
                   <div className="text-brown-primary/70 dark:text-dark-text-secondary">Tổng món ăn</div>
                 </div>
                                 <div className="text-center p-4 bg-gradient-to-br from-green-primary/10 to-emerald-500/10 rounded-xl">
                   <div className="text-3xl font-bold text-green-primary mb-2">{dishes.length}</div>
                   <div className="text-brown-primary/70 dark:text-dark-text-secondary">Đang hiển thị</div>
                 </div>
                                 <div className="text-center p-4 bg-gradient-to-br from-blue-primary/10 to-cyan-500/10 rounded-xl">
                   <div className="text-3xl font-bold text-blue-primary mb-2">{dishes.length > 0 ? dishes[0]?.source || 'N/A' : 'N/A'}</div>
                   <div className="text-brown-primary/70 dark:text-dark-text-secondary">Nguồn dữ liệu</div>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter */}
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
                      placeholder="Tìm kiếm món ăn..."
                      value={searchTerm}
                      onChange={(e) => {
                
                        setSearchTerm(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-brown-primary/20 rounded-lg bg-white-primary dark:bg-dark-card text-brown-primary dark:text-dark-text placeholder-brown-primary/50 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                                 <button 
                   onClick={handleAddDish}
                   className="px-6 py-3 bg-gradient-to-r from-orange-primary to-red-500 text-white-primary rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 justify-center"
                 >
                   <Plus className="w-5 h-5" />
                   Thêm món ăn
                 </button>
              </div>
            </div>
          </motion.div>

          {/* Dishes List */}
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
                                           ) : dishes.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="w-16 h-16 text-brown-primary/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-brown-primary dark:text-dark-text mb-2">
                    Không tìm thấy món ăn
                  </h3>
                  <p className="text-brown-primary/70 dark:text-dark-text-secondary">
                    {searchTerm 
                      ? `Thử thay đổi từ khóa tìm kiếm (đang tìm: "${searchTerm}")` 
                      : 'Chưa có món ăn nào trong hệ thống'}
                  </p>
                  <p className="text-sm text-brown-primary/50 mt-2">
                    Debug: Total items: {totalItems}, Current page: {currentPage}, Search term: "{searchTerm}"
                  </p>
                </div>
              ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {dishes.map((dish, index) => (
                    <motion.div
                      key={dish._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="bg-white-primary dark:bg-dark-card rounded-xl p-6 border border-brown-primary/10 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-brown-primary dark:text-dark-text mb-2">
                            {dish.name}
                          </h3>
                          <span className="inline-block px-2 py-1 bg-orange-primary/10 text-orange-primary text-xs rounded-full mb-2">
                            {dish.source}
                          </span>
                          
                          {/* Nguyên liệu */}
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-brown-primary dark:text-dark-text mb-1">Nguyên liệu:</h4>
                            <p className="text-brown-primary/70 dark:text-dark-text-secondary text-xs line-clamp-2">
                              {dish.ingredients.join(', ')}
                            </p>
                          </div>
                          
                          {/* Hướng dẫn nấu */}
                          {dish.instructions && dish.instructions.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-brown-primary dark:text-dark-text mb-1">Hướng dẫn nấu:</h4>
                              <div className="text-xs text-brown-primary/70 dark:text-dark-text-secondary space-y-1">
                                {dish.instructions.slice(0, 3).map((instruction, idx) => (
                                  <div key={idx} className="line-clamp-1">
                                    <span className="font-medium text-orange-primary">{idx + 1}.</span> {instruction}
                                  </div>
                                ))}
                                {dish.instructions.length > 3 && (
                                  <div className="text-orange-primary font-medium">
                                    +{dish.instructions.length - 3} bước nữa...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                                                 <div className="flex gap-2">
                           <button 
                             onClick={() => handleViewDish(dish)}
                             className="p-2 text-blue-primary hover:bg-blue-primary/10 rounded-lg transition-colors"
                             title="Xem chi tiết"
                           >
                             <Eye className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleEditDish(dish)}
                             className="p-2 text-orange-primary hover:bg-orange-primary/10 rounded-lg transition-colors"
                             title="Chỉnh sửa"
                           >
                             <Edit className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => dish._id && handleDeleteDish(dish._id)}
                             className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                             title="Xóa"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                      </div>
                                             <div className="flex items-center justify-between text-sm text-brown-primary/60 dark:text-dark-text-secondary">
                         <span>ID: {dish.neo4j_id}</span>
                         <span>{dish.instructions?.length || 0} bước</span>
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
                     Hiển thị {((currentPage - 1) * 12) + 1} - {Math.min(currentPage * 12, totalItems)} của {totalItems} món ăn
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
                                     ? 'bg-orange-primary text-white-primary'
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

       {/* Dish Modal */}
       <DishModal
         isOpen={isModalOpen}
         onClose={() => {
           setIsModalOpen(false);
           setSelectedDish(null);
           setIsViewMode(false);
         }}
         dish={selectedDish}
         onSave={handleSaveDish}
         ingredients={[]}
         isViewMode={isViewMode}
       />
     </div>
   );
} 