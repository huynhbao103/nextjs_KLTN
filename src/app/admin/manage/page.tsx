"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChefHat,
  Carrot,
  Users,
  BarChart3,
  ArrowLeft,
  TrendingUp,
  UserCheck,
  Utensils
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load Header component
const Header = dynamic(() => import('@/components/header/page'), {
  loading: () => <div className="h-20 bg-white-primary dark:bg-dark-card animate-pulse" />,
  ssr: false
});

interface Stats {
  totalUsers: number;
  totalDishes: number;
  totalIngredients: number;
}

export default function AdminManagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDishes: 0,
    totalIngredients: 0
  });
  const [loading, setLoading] = useState(true);

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

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          console.error('Error fetching stats:', data.error);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchStats();
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

  const manageFeatures = [
    {
      title: 'Quản lý Món Ăn',
      description: 'Thêm, sửa, xóa món ăn và xem danh sách món ăn',
      icon: ChefHat,
      href: '/admin/dishes',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-primary/10 to-red-500/10'
    },
    {
      title: 'Quản lý Nguyên Liệu',
      description: 'Thêm, sửa, xóa nguyên liệu và xem danh sách nguyên liệu',
      icon: Carrot,
      href: '/admin/ingredients',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-primary/10 to-emerald-500/10'
    },
    {
      title: 'Quản lý Người Dùng',
      description: 'Xem danh sách người dùng, phân quyền và quản lý tài khoản',
      icon: Users,
      href: '/admin/users',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/10 to-pink-500/10'
    }
  ];

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
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-primary to-green-primary rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white-primary" />
              </div>
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-brown-primary dark:text-dark-text mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Quản Lý Hệ Thống
            </motion.h1>
            <motion.p 
              className="text-lg text-brown-primary/70 dark:text-dark-text-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Quản lý món ăn, nguyên liệu và người dùng - Chào mừng {session?.user?.name}
            </motion.p>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12 max-w-4xl mx-auto"
          >
            <div className="card-glass p-6">
              <h3 className="text-2xl font-semibold text-brown-primary dark:text-dark-text mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-primary" />
                Thống Kê Nhanh
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-200 dark:border-purple-800"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <UserCheck className="w-6 h-6 text-purple-500" />
                    <div className="text-3xl font-bold text-purple-500">
                      {loading ? '...' : stats.totalUsers}
                    </div>
                  </div>
                  <div className="text-brown-primary/70 dark:text-dark-text-secondary font-medium">
                    Tổng người dùng
                  </div>
                </motion.div>
                <motion.div 
                  className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border border-orange-200 dark:border-orange-800"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Utensils className="w-6 h-6 text-orange-500" />
                    <div className="text-3xl font-bold text-orange-500">
                      {loading ? '...' : stats.totalDishes}
                    </div>
                  </div>
                  <div className="text-brown-primary/70 dark:text-dark-text-secondary font-medium">
                    Tổng món ăn
                  </div>
                </motion.div>
                <motion.div 
                  className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-200 dark:border-green-800"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Carrot className="w-6 h-6 text-green-500" />
                    <div className="text-3xl font-bold text-green-500">
                      {loading ? '...' : stats.totalIngredients}
                    </div>
                  </div>
                  <div className="text-brown-primary/70 dark:text-dark-text-secondary font-medium">
                    Tổng nguyên liệu
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Manage Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {manageFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + index * 0.1 }}
              >
                <Link
                  href={feature.href}
                  className="block group"
                >
                  <div className={`card-glass p-6 h-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br ${feature.bgColor}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-6 h-6 text-white-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-brown-primary dark:text-dark-text mb-2 group-hover:text-orange-primary dark:group-hover:text-orange-primary transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-brown-primary/70 dark:text-dark-text-secondary text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 