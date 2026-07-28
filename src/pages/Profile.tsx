import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getUser, updateUser } from '../services/user';
import { getCompany, getSubCompany } from '../services/company';
import type { User } from '../types';
import { ROLE_LABELS } from '../types';
import { Edit2, Save, X } from 'lucide-react';

export default function Profile() {
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [companyName, setCompanyName] = useState<string>('-');
  const [subCompanyName, setSubCompanyName] = useState<string>('-');
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

      if (userData.company_id) {
        const company = await getCompany(userData.company_id);
        setCompanyName(company?.name || '-');
      } else {
        setCompanyName('-');
      }

      if (userData.sub_company_id) {
        const subCompany = await getSubCompany(userData.sub_company_id);
        setSubCompanyName(subCompany?.name || '-');
      } else {
        setSubCompanyName('-');
      }
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

      <div className="px-6 py-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">真实姓名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">所属公司</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">所属分公司</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">手机号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">身份证号</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.real_name}
                    onChange={(e) => setEditForm({ ...editForm, real_name: e.target.value })}
                    className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  user.real_name
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{companyName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subCompanyName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-36 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  user.phone
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{user.id_card}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
