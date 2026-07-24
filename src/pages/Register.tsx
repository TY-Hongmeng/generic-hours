import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, CreditCard, User, Building, Shield, Lock, Loader2 } from 'lucide-react';
import { register } from '../services/auth';

const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  idCard: z.string().regex(/^\d{17}[\dXx]$/, '请输入正确的身份证号'),
  realName: z.string().min(2, '请输入真实姓名'),
  companyName: z.string().min(2, '请输入公司名称'),
  role: z.enum(['user', 'admin', 'super_admin'], { required_error: '请选择角色' }),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码输入不一致',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const inputClass = "block w-full pl-10 pr-3 py-2 border-2 border-primary-600 bg-white text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
const iconClass = "h-5 w-5 text-primary-600";
const labelClass = "block text-sm font-medium text-primary-700 mb-1";

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register: registerField, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setLoading(true);
    
    const result = await register({
      phone: data.phone,
      idCard: data.idCard,
      realName: data.realName,
      companyName: data.companyName,
      role: data.role,
      password: data.password,
    });
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-700 mb-2">通用工时管理系统</h1>
          <p className="text-primary-600">创建新账号</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl border-2 border-primary-600 p-8">
          <h2 className="text-2xl font-bold text-center text-primary-700 mb-6">注册</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={labelClass}>手机号</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className={iconClass} />
                </div>
                <input
                  {...registerField('phone')}
                  type="tel"
                  placeholder="请输入手机号"
                  className={inputClass}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className={labelClass}>身份证号</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className={iconClass} />
                </div>
                <input
                  {...registerField('idCard')}
                  type="text"
                  placeholder="请输入身份证号"
                  className={inputClass}
                />
              </div>
              {errors.idCard && <p className="mt-1 text-sm text-red-600">{errors.idCard.message}</p>}
            </div>

            <div>
              <label className={labelClass}>真实姓名</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={iconClass} />
                </div>
                <input
                  {...registerField('realName')}
                  type="text"
                  placeholder="请输入真实姓名"
                  className={inputClass}
                />
              </div>
              {errors.realName && <p className="mt-1 text-sm text-red-600">{errors.realName.message}</p>}
            </div>

            <div>
              <label className={labelClass}>公司名称</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className={iconClass} />
                </div>
                <input
                  {...registerField('companyName')}
                  type="text"
                  placeholder="请输入公司名称"
                  className={inputClass}
                />
              </div>
              {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>}
            </div>

            <div>
              <label className={labelClass}>角色</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className={iconClass} />
                </div>
                <select
                  {...registerField('role')}
                  className={inputClass}
                >
                  <option value="">请选择角色</option>
                  <option value="user">普通用户</option>
                  <option value="admin">企业管理员</option>
                  <option value="super_admin">系统管理员</option>
                </select>
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>

            <div>
              <label className={labelClass}>密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={iconClass} />
                </div>
                <input
                  {...registerField('password')}
                  type="password"
                  placeholder="请输入密码（至少6位）"
                  className={inputClass}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className={labelClass}>确认密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={iconClass} />
                </div>
                <input
                  {...registerField('confirmPassword')}
                  type="password"
                  placeholder="请再次输入密码"
                  className={inputClass}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '注册'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-primary-600">已有账号？</span>
            <Link to="/" className="ml-1 text-primary-600 hover:text-primary-700">
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
