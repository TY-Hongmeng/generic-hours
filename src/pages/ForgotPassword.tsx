import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { resetPassword } from '../services/auth';

const forgotPasswordSchema = z.object({
  idCard: z.string().regex(/^\d{17}[\dXx]$/, '请输入正确的身份证号'),
  newPassword: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次密码输入不一致',
  path: ['confirmPassword'],
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const inputClass = "block w-full pl-10 pr-3 py-2 border-2 border-primary-600 bg-white text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
const iconClass = "h-5 w-5 text-primary-600";
const labelClass = "block text-sm font-medium text-primary-700 mb-1";

export default function ForgotPassword() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    const result = await resetPassword(data.idCard, data.newPassword);
    
    if (result.success) {
      setSuccess(result.message);
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
          <p className="text-primary-600">找回密码</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl border-2 border-primary-600 p-8">
          <h2 className="text-2xl font-bold text-center text-primary-700 mb-6">重置密码</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className={labelClass}>身份证号</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className={iconClass} />
                </div>
                <input
                  {...register('idCard')}
                  type="text"
                  placeholder="请输入身份证号"
                  className={inputClass}
                />
              </div>
              {errors.idCard && <p className="mt-1 text-sm text-red-600">{errors.idCard.message}</p>}
            </div>

            <div>
              <label className={labelClass}>新密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={iconClass} />
                </div>
                <input
                  {...register('newPassword')}
                  type="password"
                  placeholder="请输入新密码（至少6位）"
                  className={inputClass}
                />
              </div>
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className={labelClass}>确认新密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={iconClass} />
                </div>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="请再次输入新密码"
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
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '重置密码'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/" className="text-primary-600 hover:text-primary-700">
              返回登录
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-primary-500 mt-4">v260727.9</p>
      </div>
    </div>
  );
}
