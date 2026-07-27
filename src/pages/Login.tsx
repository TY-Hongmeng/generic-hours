import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Lock, Loader2 } from 'lucide-react';
import { login } from '../services/auth';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  password: z.string().min(6, '密码至少6位'),
});

type LoginForm = z.infer<typeof loginSchema>;

const inputClass = "block w-full pl-10 pr-3 py-2 border-2 border-primary-600 bg-white text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
const iconClass = "h-5 w-5 text-primary-600";
const labelClass = "block text-sm font-medium text-primary-700 mb-1";

export default function Login() {
  const navigate = useNavigate();
  const { login: loginUser } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setLoading(true);
    
    const result = await login(data.phone, data.password);
    
    if (result.success && result.user) {
      loginUser(result.user);
      navigate('/dashboard');
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
          <p className="text-primary-600">企业工时记录与管理平台</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl border-2 border-primary-600 p-8">
          <h2 className="text-2xl font-bold text-center text-primary-700 mb-6">登录</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className={labelClass}>手机号</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className={iconClass} />
                </div>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="请输入手机号"
                  className={inputClass}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className={labelClass}>密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={iconClass} />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="请输入密码"
                  className={inputClass}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '登录'}
            </button>
          </form>

          <div className="mt-6 flex justify-between text-sm">
            <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700">
              忘记密码？
            </Link>
            <Link to="/register" className="text-primary-600 hover:text-primary-700">
              注册账号
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-primary-500 mt-4">v260727.11</p>
      </div>
    </div>
  );
}
