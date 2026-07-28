import { useState, useEffect } from 'react';
import { getRoles } from '../services/role';
import type { Role } from '../types';
import { Shield, X } from 'lucide-react';

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const rolesData = await getRoles();
    setRoles(rolesData);
    setLoading(false);
  };

  const getRoleName = (roleName: string) => {
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
    return map[roleName] || roleName;
  };

  const getPermissionName = (permission: string) => {
    const permissionMap: Record<string, string> = {
      view_profile: '查看个人信息',
      view_company: '查看公司信息',
      edit_company: '编辑公司信息',
      view_users: '查看用户信息',
      edit_users: '编辑用户信息',
      manage_roles: '管理角色',
      view_own_hours: '查看个人工时',
      submit_own_hours: '提交个人工时',
      view_team_hours: '查看班组工时',
      approve_team_hours: '审批班组工时',
      view_section_hours: '查看段组工时',
      approve_section_hours: '审批段组工时',
      view_all_hours: '查看全部工时',
      export_hours: '导出工时',
      approve_all_hours: '审批全部工时',
      approve_final_hours: '终审工时',
    };
    return permissionMap[permission] || permission;
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">角色信息</h2>
          <p className="text-sm text-gray-500 mt-1">点击角色行可查看详细权限</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">权限数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr
                  key={role.id}
                  onClick={() => setSelectedRole(selectedRole?.id === role.id ? null : role)}
                  className={`cursor-pointer transition-colors ${
                    selectedRole?.id === role.id ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <Shield className="h-4 w-4 text-primary-600" />
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900">{getRoleName(role.name)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{role.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                      {role.permissions.length} 项
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-primary-600 hover:text-primary-700">
                      {selectedRole?.id === role.id ? '收起' : '查看权限'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRole && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {getRoleName(selectedRole.name)} - 权限列表
            </h3>
            <button
              onClick={() => setSelectedRole(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">权限标识</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">权限说明</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedRole.permissions.map((permission) => (
                  <tr key={permission} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-mono text-gray-700">{permission}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center">
                        <Shield className="h-3 w-3 text-primary-600 mr-2" />
                        {getPermissionName(permission)}
                      </span>
                    </td>
                  </tr>
                ))}
                {selectedRole.permissions.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">该角色暂无权限</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
