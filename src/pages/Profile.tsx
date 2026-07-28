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

      if (userData.company_id) {
        const companyData = await getCompany(userData.company_id);
        setCompany(companyData);
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

  const getRoleName = (role: string) => {
    const map: Record<string, string> = {
      user: '普通用户',
      admin: '企业管理员',
      super_admin: '系统管理员',
      employee: '员工',
      team_leader: '班长',
      section_leader: '段长',
      accountant: '财会',
      production_manager: '生产经理',
      finance_director: '财务总监',
      system_admin: '系统管理员',
    };
    return map[role] || role;
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">未找到用户信息</div>;
  }

  const rows: Array<{ label: string; key: string; editable?: boolean; type?: string; value: string }> = [
    { label: '手机号',     key: 'phone',     editable: true, type: 'tel',   value: user.phone },
    { label: '身份证号',   key: 'id_card',   value: user.id_card },
    { label: '真实姓名',   key: 'real_name', editable: true,             value: user.real_name },
    { label: '所属公司',   key: 'company',   value: company?.name || '-' },
    { label: '角色',       key: 'role',      value: getRoleName(user.role) },
  ];

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

      <div className="px-6 py-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">字段</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">值</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{row.label}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {isEditing && row.editable ? (
                    <input
                      type={row.type || 'text'}
                      value={editForm[row.key as keyof typeof editForm] ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, [row.key]: e.target.value })}
                      className="w-full max-w-md px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    row.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
