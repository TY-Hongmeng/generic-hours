import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getCompany, updateCompany } from '../services/company';
import type { Company } from '../types';
import { Edit2, Save, X } from 'lucide-react';

export default function CompanyPage() {
  const { user } = useAuthStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    credit_code: '',
    legal_person: '',
    address: '',
    contact_phone: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.company_id) {
      loadCompanyData();
    }
  }, [user]);

  const loadCompanyData = async () => {
    if (!user?.company_id) return;
    
    const companyData = await getCompany(user.company_id);
    if (companyData) {
      setCompany(companyData);
      setEditForm({
        name: companyData.name,
        credit_code: companyData.credit_code,
        legal_person: companyData.legal_person,
        address: companyData.address,
        contact_phone: companyData.contact_phone,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user?.company_id) return;
    
    const success = await updateCompany(user.company_id, editForm);
    if (success) {
      setCompany({ ...company!, ...editForm });
      setIsEditing(false);
    }
  };

  const canEdit = user?.role === 'system_admin' || user?.role === 'finance_director' || user?.role === 'production_manager';

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!company) {
    return <div className="text-center py-8">未找到公司信息</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">公司信息</h2>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            编辑
          </button>
        )}
        {isEditing && (
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
                setEditForm({
                  name: company.name,
                  credit_code: company.credit_code,
                  legal_person: company.legal_person,
                  address: company.address,
                  contact_phone: company.contact_phone,
                });
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
            <label className="block text-sm font-medium text-gray-500 mb-1">公司名称</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900">{company.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">统一社会信用代码</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.credit_code}
                onChange={(e) => setEditForm({ ...editForm, credit_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900">{company.credit_code || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">法人代表</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.legal_person}
                onChange={(e) => setEditForm({ ...editForm, legal_person: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900">{company.legal_person || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">联系电话</label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.contact_phone}
                onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900">{company.contact_phone || '-'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">公司地址</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900">{company.address || '-'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
