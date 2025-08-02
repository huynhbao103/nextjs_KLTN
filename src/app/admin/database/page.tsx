"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Database, Users, MessageSquare, ChefHat, Carrot, BarChart3, ArrowLeft, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load Header component
const Header = dynamic(() => import('@/components/header/page'), {
  loading: () => <div className="h-20 bg-white-primary dark:bg-dark-card animate-pulse" />,
  ssr: false
});

interface TableInfo {
  name: string;
  description: string;
  fields: FieldInfo[];
  relationships: RelationshipInfo[];
}

interface FieldInfo {
  name: string;
  type: string;
  required: boolean;
  description: string;
  constraints: string[];
}

interface RelationshipInfo {
  type: string;
  targetTable: string;
  description: string;
}

export default function DatabasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

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

  const databaseTables: TableInfo[] = [
    {
      name: 'USERS',
      description: 'Bảng lưu trữ thông tin người dùng và tài khoản',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Khóa chính', constraints: ['PK'] },
        { name: 'name', type: 'String', required: true, description: 'Tên người dùng', constraints: [] },
        { name: 'email', type: 'String', required: true, description: 'Email đăng nhập', constraints: ['UK'] },
        { name: 'password', type: 'String', required: false, description: 'Mật khẩu (cho local auth)', constraints: [] },
        { name: 'image', type: 'String', required: false, description: 'URL ảnh đại diện', constraints: [] },
        { name: 'dateOfBirth', type: 'Date', required: false, description: 'Ngày sinh', constraints: [] },
        { name: 'gender', type: 'String', required: false, description: 'Giới tính', constraints: ['ENUM'] },
        { name: 'weight', type: 'Number', required: false, description: 'Cân nặng (kg)', constraints: [] },
        { name: 'height', type: 'Number', required: false, description: 'Chiều cao (cm)', constraints: [] },
        { name: 'allergies', type: '[String]', required: false, description: 'Danh sách dị ứng', constraints: [] },
        { name: 'medicalConditions', type: '[String]', required: false, description: 'Danh sách bệnh lý', constraints: [] },
        { name: 'role', type: 'String', required: false, description: 'Vai trò (user/admin)', constraints: ['ENUM'] },
        { name: 'providers', type: '[String]', required: false, description: 'Danh sách OAuth providers', constraints: [] },
        { name: 'lastUpdateDate', type: 'Date', required: false, description: 'Ngày cập nhật cuối', constraints: [] },
        { name: 'createdAt', type: 'Date', required: true, description: 'Ngày tạo', constraints: [] },
        { name: 'updatedAt', type: 'Date', required: true, description: 'Ngày cập nhật', constraints: [] }
      ],
      relationships: [
        { type: '1:N', targetTable: 'CHATS', description: 'Một user có nhiều chat' },
        { type: '1:N', targetTable: 'ACCOUNTS', description: 'Một user có nhiều account (NextAuth)' },
        { type: '1:N', targetTable: 'SESSIONS', description: 'Một user có nhiều session (NextAuth)' }
      ]
    },
    {
      name: 'DISHES',
      description: 'Bảng lưu trữ thông tin món ăn',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Khóa chính', constraints: ['PK'] },
        { name: 'id', type: 'Number', required: true, description: 'ID từ external system', constraints: ['UK'] },
        { name: 'name', type: 'String', required: true, description: 'Tên món ăn', constraints: [] },
        { name: 'description', type: 'String', required: false, description: 'Mô tả món ăn', constraints: [] },
        { name: 'ingredients', type: '[String]', required: false, description: 'Danh sách nguyên liệu', constraints: [] },
        { name: 'instructions', type: 'String', required: false, description: 'Hướng dẫn nấu', constraints: [] },
        { name: 'cookingTime', type: 'Number', required: false, description: 'Thời gian nấu (phút)', constraints: [] },
        { name: 'servings', type: 'Number', required: false, description: 'Số khẩu phần', constraints: [] },
        { name: 'difficulty', type: 'String', required: false, description: 'Độ khó', constraints: ['ENUM'] },
        { name: 'cuisine', type: 'String', required: false, description: 'Loại ẩm thực', constraints: [] },
        { name: 'tags', type: '[String]', required: false, description: 'Tags phân loại', constraints: [] },
        { name: 'nutritionInfo', type: 'Object', required: false, description: 'Thông tin dinh dưỡng', constraints: [] },
        { name: 'imageUrl', type: 'String', required: false, description: 'URL ảnh món ăn', constraints: [] },
        { name: 'created_at', type: 'Date', required: true, description: 'Ngày tạo', constraints: [] },
        { name: 'updated_at', type: 'Date', required: true, description: 'Ngày cập nhật', constraints: [] }
      ],
      relationships: [
        { type: 'N:M', targetTable: 'INGREDIENTS', description: 'Món ăn có nhiều nguyên liệu' },
        { type: '1:N', targetTable: 'CHATS', description: 'Món ăn được đề xuất trong chat' }
      ]
    },
    {
      name: 'INGREDIENTS',
      description: 'Bảng lưu trữ thông tin nguyên liệu',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Khóa chính', constraints: ['PK'] },
        { name: 'id', type: 'Number', required: true, description: 'ID từ external system', constraints: ['UK'] },
        { name: 'name', type: 'String', required: true, description: 'Tên nguyên liệu', constraints: [] },
        { name: 'created_at', type: 'Date', required: true, description: 'Ngày tạo', constraints: [] },
        { name: 'updated_at', type: 'Date', required: true, description: 'Ngày cập nhật', constraints: [] }
      ],
      relationships: [
        { type: 'N:M', targetTable: 'DISHES', description: 'Nguyên liệu được dùng trong nhiều món' },
        { type: '1:N', targetTable: 'USERS', description: 'Nguyên liệu trong allergies của user' }
      ]
    },
    {
      name: 'CHATS',
      description: 'Bảng lưu trữ lịch sử chat với AI',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Khóa chính', constraints: ['PK'] },
        { name: 'userId', type: 'ObjectId', required: true, description: 'ID người dùng', constraints: ['FK'] },
        { name: 'sessionId', type: 'String', required: true, description: 'ID phiên chat', constraints: [] },
        { name: 'messages', type: '[Object]', required: true, description: 'Danh sách tin nhắn', constraints: [] },
        { name: 'context', type: 'Object', required: false, description: 'Thông tin context', constraints: [] },
        { name: 'recommendations', type: '[String]', required: false, description: 'Danh sách món ăn được đề xuất', constraints: [] },
        { name: 'createdAt', type: 'Date', required: true, description: 'Ngày tạo', constraints: [] },
        { name: 'updatedAt', type: 'Date', required: true, description: 'Ngày cập nhật', constraints: [] }
      ],
      relationships: [
        { type: 'N:1', targetTable: 'USERS', description: 'Chat thuộc về một user' },
        { type: 'N:M', targetTable: 'DISHES', description: 'Chat có thể đề xuất nhiều món ăn' }
      ]
    },
    {
      name: 'ACCOUNTS',
      description: 'Bảng quản lý tài khoản OAuth (NextAuth)',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Khóa chính', constraints: ['PK'] },
        { name: 'userId', type: 'ObjectId', required: true, description: 'ID người dùng', constraints: ['FK'] },
        { name: 'type', type: 'String', required: true, description: 'Loại provider', constraints: [] },
        { name: 'provider', type: 'String', required: true, description: 'Tên provider', constraints: [] },
        { name: 'providerAccountId', type: 'String', required: true, description: 'ID từ provider', constraints: [] },
        { name: 'refresh_token', type: 'String', required: false, description: 'Refresh token', constraints: [] },
        { name: 'access_token', type: 'String', required: false, description: 'Access token', constraints: [] },
        { name: 'expires_at', type: 'Number', required: false, description: 'Thời gian hết hạn', constraints: [] },
        { name: 'token_type', type: 'String', required: false, description: 'Loại token', constraints: [] },
        { name: 'scope', type: 'String', required: false, description: 'Scope quyền', constraints: [] },
        { name: 'id_token', type: 'String', required: false, description: 'ID token', constraints: [] },
        { name: 'session_state', type: 'String', required: false, description: 'Trạng thái session', constraints: [] }
      ],
      relationships: [
        { type: 'N:1', targetTable: 'USERS', description: 'Account thuộc về một user' }
      ]
    },
    {
      name: 'SESSIONS',
      description: 'Bảng quản lý session (NextAuth)',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Khóa chính', constraints: ['PK'] },
        { name: 'sessionToken', type: 'String', required: true, description: 'Token session', constraints: ['UK'] },
        { name: 'userId', type: 'ObjectId', required: true, description: 'ID người dùng', constraints: ['FK'] },
        { name: 'expires', type: 'Date', required: true, description: 'Thời gian hết hạn', constraints: [] }
      ],
      relationships: [
        { type: 'N:1', targetTable: 'USERS', description: 'Session thuộc về một user' }
      ]
    },
    {
      name: 'VERIFICATION_TOKENS',
      description: 'Bảng quản lý token xác thực (NextAuth)',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Khóa chính', constraints: ['PK'] },
        { name: 'identifier', type: 'String', required: true, description: 'Email/phone', constraints: [] },
        { name: 'token', type: 'String', required: true, description: 'Token xác thực', constraints: ['UK'] },
        { name: 'expires', type: 'Date', required: true, description: 'Thời gian hết hạn', constraints: [] }
      ],
      relationships: []
    }
  ];

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
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Database className="w-8 h-8 text-white-primary" />
              </div>
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-brown-primary dark:text-dark-text mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Database Schema
            </motion.h1>
            <motion.p 
              className="text-lg text-brown-primary/70 dark:text-dark-text-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Cấu trúc cơ sở dữ liệu và mối quan hệ giữa các bảng
            </motion.p>
          </div>

          {/* Back to Admin */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-brown-primary dark:text-dark-text hover:text-orange-primary dark:hover:text-orange-primary transition-all duration-300 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại Admin Dashboard
            </button>
          </motion.div>

          {/* Database Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="card-glass p-6">
              <h3 className="text-2xl font-semibold text-brown-primary dark:text-dark-text mb-4">
                Tổng Quan Database
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-orange-primary/10 to-green-primary/10 rounded-xl">
                  <div className="text-3xl font-bold text-orange-primary mb-2">{databaseTables.length}</div>
                  <div className="text-brown-primary/70 dark:text-dark-text-secondary">Tổng số bảng</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-primary/10 to-blue-primary/10 rounded-xl">
                  <div className="text-3xl font-bold text-green-primary mb-2">7</div>
                  <div className="text-brown-primary/70 dark:text-dark-text-secondary">Bảng chính</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-primary/10 to-purple-primary/10 rounded-xl">
                  <div className="text-3xl font-bold text-blue-primary mb-2">3</div>
                  <div className="text-brown-primary/70 dark:text-dark-text-secondary">Bảng NextAuth</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {databaseTables.map((table, index) => (
              <motion.div
                key={table.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div 
                  className={`card-glass p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    selectedTable === table.name ? 'ring-2 ring-orange-primary' : ''
                  }`}
                  onClick={() => setSelectedTable(selectedTable === table.name ? null : table.name)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-primary to-green-primary rounded-lg flex items-center justify-center">
                      {table.name === 'USERS' && <Users className="w-6 h-6 text-white-primary" />}
                      {table.name === 'DISHES' && <ChefHat className="w-6 h-6 text-white-primary" />}
                      {table.name === 'INGREDIENTS' && <Carrot className="w-6 h-6 text-white-primary" />}
                      {table.name === 'CHATS' && <MessageSquare className="w-6 h-6 text-white-primary" />}
                      {table.name === 'ACCOUNTS' && <Shield className="w-6 h-6 text-white-primary" />}
                      {table.name === 'SESSIONS' && <Shield className="w-6 h-6 text-white-primary" />}
                      {table.name === 'VERIFICATION_TOKENS' && <Shield className="w-6 h-6 text-white-primary" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-brown-primary dark:text-dark-text mb-2">
                        {table.name}
                      </h3>
                      <p className="text-brown-primary/70 dark:text-dark-text-secondary text-sm">
                        {table.description}
                      </p>
                    </div>
                  </div>

                  {/* Fields Summary */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-brown-primary dark:text-dark-text mb-2">
                      Fields ({table.fields.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {table.fields.slice(0, 5).map((field) => (
                        <span 
                          key={field.name}
                          className="px-2 py-1 bg-orange-primary/10 text-orange-primary text-xs rounded-full"
                        >
                          {field.name}
                        </span>
                      ))}
                      {table.fields.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                          +{table.fields.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Relationships */}
                  {table.relationships.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-brown-primary dark:text-dark-text mb-2">
                        Relationships ({table.relationships.length})
                      </h4>
                      <div className="space-y-1">
                        {table.relationships.map((rel, idx) => (
                          <div key={idx} className="text-xs text-brown-primary/70 dark:text-dark-text-secondary">
                            {rel.type} → {rel.targetTable}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed View */}
                {selectedTable === table.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 card-glass p-6"
                  >
                    <h4 className="text-lg font-semibold text-brown-primary dark:text-dark-text mb-4">
                      Chi tiết bảng {table.name}
                    </h4>
                    
                    {/* Fields Table */}
                    <div className="mb-6">
                      <h5 className="text-md font-semibold text-brown-primary dark:text-dark-text mb-3">
                        Fields
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-orange-primary/20">
                              <th className="text-left py-2 text-brown-primary dark:text-dark-text">Field</th>
                              <th className="text-left py-2 text-brown-primary dark:text-dark-text">Type</th>
                              <th className="text-left py-2 text-brown-primary dark:text-dark-text">Required</th>
                              <th className="text-left py-2 text-brown-primary dark:text-dark-text">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {table.fields.map((field) => (
                              <tr key={field.name} className="border-b border-orange-primary/10">
                                <td className="py-2 font-mono text-sm">{field.name}</td>
                                <td className="py-2">{field.type}</td>
                                <td className="py-2">
                                  {field.required ? (
                                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">Yes</span>
                                  ) : (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">No</span>
                                  )}
                                </td>
                                <td className="py-2 text-brown-primary/70 dark:text-dark-text-secondary">
                                  {field.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Relationships */}
                    {table.relationships.length > 0 && (
                      <div>
                        <h5 className="text-md font-semibold text-brown-primary dark:text-dark-text mb-3">
                          Relationships
                        </h5>
                        <div className="space-y-2">
                          {table.relationships.map((rel, idx) => (
                            <div key={idx} className="p-3 bg-orange-primary/5 rounded-lg">
                              <div className="font-semibold text-brown-primary dark:text-dark-text">
                                {rel.type} → {rel.targetTable}
                              </div>
                              <div className="text-sm text-brown-primary/70 dark:text-dark-text-secondary">
                                {rel.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 