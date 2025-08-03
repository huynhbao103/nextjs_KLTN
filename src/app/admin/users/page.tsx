"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Shield,
  User
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load Header component
const Header = dynamic(() => import('@/components/header/page'), {
  loading: () => <div className="h-20 bg-white-primary dark:bg-dark-card animate-pulse" />,
  ssr: false
});

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  allergies: string[];
  providers: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

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

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        if (data.success) {
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchUsers();
    }
  }, [session]);

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

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Get role statistics
  const adminCount = users.filter(user => user.role === 'admin').length;
  const userCount = users.filter(user => user.role === 'user').length;

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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-primary to-pink-500 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white-primary" />
              </div>
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-brown-primary dark:text-dark-text mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Quản Lý Người Dùng
            </motion.h1>
            <motion.p 
              className="text-lg text-brown-primary/70 dark:text-dark-text-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Quản lý danh sách người dùng và phân quyền trong hệ thống
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
                  <div className="text-3xl font-bold text-purple-primary mb-2">{users.length}</div>
                  <div className="text-brown-primary/70 dark:text-dark-text-secondary">Tổng người dùng</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-primary/10 to-cyan-500/10 rounded-xl">
                  <div className="text-3xl font-bold text-blue-primary mb-2">{filteredUsers.length}</div>
                  <div className="text-brown-primary/70 dark:text-dark-text-secondary">Đang hiển thị</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-primary/10 to-red-500/10 rounded-xl">
                  <div className="text-3xl font-bold text-orange-primary mb-2">{adminCount}</div>
                  <div className="text-brown-primary/70 dark:text-dark-text-secondary">Admin</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-primary/10 to-emerald-500/10 rounded-xl">
                  <div className="text-3xl font-bold text-green-primary mb-2">{userCount}</div>
                  <div className="text-brown-primary/70 dark:text-dark-text-secondary">User</div>
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
                      placeholder="Tìm kiếm người dùng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-brown-primary/20 rounded-lg bg-white-primary dark:bg-dark-card text-brown-primary dark:text-dark-text placeholder-brown-primary/50 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-primary/50 w-5 h-5" />
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-brown-primary/20 rounded-lg bg-white-primary dark:bg-dark-card text-brown-primary dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent appearance-none"
                    >
                      <option value="all">Tất cả vai trò</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-primary to-pink-500 text-white-primary rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 justify-center">
                  <Plus className="w-5 h-5" />
                  Thêm người dùng
                </button>
              </div>
            </div>
          </motion.div>

          {/* Users List */}
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
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-brown-primary/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-brown-primary dark:text-dark-text mb-2">
                    Không tìm thấy người dùng
                  </h3>
                  <p className="text-brown-primary/70 dark:text-dark-text-secondary">
                    {searchTerm || filterRole !== 'all' 
                      ? 'Thử thay đổi bộ lọc tìm kiếm' 
                      : 'Chưa có người dùng nào trong hệ thống'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="bg-white-primary dark:bg-dark-card rounded-xl p-6 border border-brown-primary/10 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-brown-primary dark:text-dark-text">
                              {user.name}
                            </h3>
                            {user.role === 'admin' ? (
                              <Shield className="w-4 h-4 text-orange-primary" />
                            ) : (
                              <User className="w-4 h-4 text-blue-primary" />
                            )}
                          </div>
                          <p className="text-brown-primary/70 dark:text-dark-text-secondary text-sm mb-2">
                            {user.email}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-orange-primary/10 text-orange-primary' 
                              : 'bg-blue-primary/10 text-blue-primary'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-blue-primary hover:bg-blue-primary/10 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-orange-primary hover:bg-orange-primary/10 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {user.allergies && user.allergies.length > 0 && (
                          <div>
                            <p className="text-xs text-brown-primary/60 dark:text-dark-text-secondary">
                              Dị ứng: {user.allergies.join(', ')}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-brown-primary/50 dark:text-dark-text-secondary">
                          <span>Đăng ký: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span>{user.providers.join(', ')}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 