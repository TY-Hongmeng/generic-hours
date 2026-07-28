import { useState, useEffect } from 'react';
import { getRoles } from '../services/role';
import type { Role } from '../types';
import { Shield } from 'lucide-react';

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
    switch (roleName) {
      case 'user': return '普通用户';
      case 'admin': return '企业管理员';
      case 'super_admin': return '系统管理员';
      default: return roleName;
    }
  };

  const getPermissionName = (permission: string) => {
    const permissionMap: Record<string, string> = {
      view_profile: '查看个人信息',
      view_company: '查看公司信息',
      edit_company: '编辑公司信息',
      view_users: '查看用户信息',
      edit_users: '编辑用户信息',
      manage_roles: '管理角色',
    };
    return permissionMap[permission] || permission;
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">角色信息</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => setSelectedRole(selectedRole?.id === role.id ? null : role)}
            className={`bg-white shadow rounded-lg p-6 cursor-pointer transition-all ${
              selectedRole?.id === role.id ? 'ring-2 ring-primary-500' : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-center mb-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{getRoleName(role.name)}</h3>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">权限列表：</p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.slice(0, 3).map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-50 text-primary-700"
                  >
                    {getPermissionName(permission)}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700">
                    +{role.permissions.length - 3} 更多
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRole && (
        <div className="bg-white shadow rounded-lg px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {getRoleName(selectedRole.name)} - 详细权限
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedRole.permissions.map((permission) => (
              <div key={permission} className="flex items-center">
                <div className="flex-shrink-0 h-5 w-5 bg-primary-100 rounded flex items-center justify-center">
                  <Shield className="h-3 w-3 text-primary-600" />
                </div>
                <span className="ml-3 text-gray-700">{getPermissionName(permission)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
