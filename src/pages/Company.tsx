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
    } else if (user) {
      setLoading(false);
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
    return <div className="text-center py-8 text-gray-500">您当前没有所属公司</div>;
  }

  const rows: Array<{ label: string; key: string; type?: string; value: string }> = [
    { label: '公司名称',         key: 'name',           value: company.name },
    { label: '统一社会信用代码', key: 'credit_code',    value: company.credit_code },
    { label: '法人代表',         key: 'legal_person',   value: company.legal_person },
    { label: '联系电话',         key: 'contact_phone',  type: 'tel', value: company.contact_phone },
    { label: '公司地址',         key: 'address',        value: company.address },
  ];

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
                <td className="px-6 py-4 text-sm text-gray-900">
                  {isEditing ? (
                    <input
                      type={row.type || 'text'}
                      value={editForm[row.key as keyof typeof editForm] || ''}
                      onChange={(e) => setEditForm({ ...editForm, [row.key]: e.target.value })}
                      className="w-full max-w-md px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <span className={row.value ? '' : 'text-gray-400'}>{row.value || '-'}</span>
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
