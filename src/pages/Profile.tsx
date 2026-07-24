import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getUser, updateUser } from '../services/user';
import { getCompany } from '../services/company';
import type { User, Company } from '../types';
import { Edit2, Save, X } from 'lucide-react';

export default function Profile() {
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', real_name: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;
    
    const userData = await getUser(currentUser.id);
    if (userData) {
      setUser(userData);
      setEditForm({ phone: userData.phone, real_name: userData.real_name });
      
      const companyData = await getCompany(userData.company_id);
      setCompany(companyData);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    const success = await updateUser(currentUser.id, editForm);
    if (success) {
      setUser({ ...user!, ...editForm });
      setIsEditing(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'user': return '普通用户';
      case 'admin': return '企业管理员';
      case 'super_admin': return '系统管理员';
      default: return role;
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">未找到用户信息</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">用户信息</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            编辑
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors"
            >
              <Save className="h-4 w-4 mr-1" />
              保存
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditForm({ phone: user.phone, real_name: user.real_name });
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-700 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              取消
            </button>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">手机号</label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900">{user.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">身份证号</label>
            <p className="text-gray-900">{user.id_card}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">真实姓名</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.real_name}
                onChange={(e) => setEditForm({ ...editForm, real_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900">{user.real_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">公司名称</label>
            <p className="text-gray-900">{company?.name || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">角色</label>
            <p className="text-gray-900">{getRoleName(user.role)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
