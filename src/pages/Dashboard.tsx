import { useAuthStore } from '../store/authStore';
import { User, Building, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();

  const getRoleName = (role: string) => {
    switch (role) {
      case 'user': return '普通用户';
      case 'admin': return '企业管理员';
      case 'super_admin': return '系统管理员';
      default: return role;
    }
  };

  const cards = [
    {
      title: '用户信息',
      description: '查看和管理您的个人信息',
      icon: User,
      href: '/profile',
      color: 'bg-blue-500',
    },
    {
      title: '公司信息',
      description: '查看和管理公司信息',
      icon: Building,
      href: '/company',
      color: 'bg-green-500',
    },
    {
      title: '角色信息',
      description: '查看角色权限配置',
      icon: Shield,
      href: '/roles',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎回来，{user?.real_name}</h2>
        <p className="text-gray-600">角色：{getRoleName(user?.role || '')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.href}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-600">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
