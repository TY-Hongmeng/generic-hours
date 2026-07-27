import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, CreditCard, User, Building, Shield, Lock, Loader2, ChevronDown } from 'lucide-react';
import { register } from '../services/auth';
import { supabase } from '../services/supabase';
import { ROLE_LABELS, type RoleType } from '../types';

const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  idCard: z.string().regex(/^\d{17}[\dXx]$/, '请输入正确的身份证号'),
  realName: z.string().min(2, '请输入真实姓名'),
  companyName: z.string().optional(),
  subCompanyName: z.string().optional(),
  role: z.enum(['employee', 'team_leader', 'section_leader', 'accountant', 'production_manager', 'finance_director', 'system_admin'], { required_error: '请选择角色' }),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码输入不一致',
  path: ['confirmPassword'],
}).refine((data) => {
  // 非系统管理员必须选择公司
  if (data.role !== 'system_admin' && (!data.companyName || data.companyName.length === 0)) {
    return false;
  }
  return true;
}, {
  message: '请选择公司',
  path: ['companyName'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const inputClass = "block w-full pl-10 pr-3 py-2 border-2 border-primary-600 bg-white text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
const iconClass = "h-5 w-5 text-primary-600";
const labelClass = "block text-sm font-medium text-primary-700 mb-1";

const COMPANIES_WITH_SUB = ['吉通喜福地'];
const ROLES: RoleType[] = ['employee', 'team_leader', 'section_leader', 'accountant', 'production_manager', 'finance_director', 'system_admin'];

// 硬编码公司列表（同时从Supabase获取以保证数据一致）
const HARDCODED_COMPANIES = ['吉通凯撒', '吉通喜福地'];
const HARDCODED_SUBCOMPANIES: Record<string, string[]> = {
  '吉通喜福地': ['挤压铝棒分公司', 'CPC铸造分公司', '重力铸造分公司'],
};

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<string[]>(HARDCODED_COMPANIES);
  const [subCompanies, setSubCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedSubCompany, setSelectedSubCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const { register: registerField, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // 从Supabase加载公司列表（失败则使用硬编码）
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('name')
          .order('name');
        if (!error && data && data.length > 0) {
          setCompanies(data.map(c => c.name));
        }
      } catch (e) {
        // 静默失败，使用硬编码数据
      }
    };
    loadCompanies();
  }, []);

  // 当公司变化时加载分公司
  useEffect(() => {
    if (!selectedCompany) {
      setSubCompanies([]);
      return;
    }
    // 先用硬编码数据填充
    setSubCompanies(HARDCODED_SUBCOMPANIES[selectedCompany] || []);

    const loadSubCompanies = async () => {
      try {
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('name', selectedCompany)
          .single();

        if (company) {
          const { data, error } = await supabase
            .from('sub_companies')
            .select('name')
            .eq('company_id', company.id)
            .order('name');
          if (!error && data && data.length > 0) {
            setSubCompanies(data.map(s => s.name));
          }
        }
      } catch (e) {
        // 静默失败，使用硬编码数据
      }
    };
    loadSubCompanies();
  }, [selectedCompany]);

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setLoading(true);

    // 如果选了没有分公司的公司，清空 subCompanyName
    const subCompanyName = data.companyName && COMPANIES_WITH_SUB.includes(data.companyName) && data.subCompanyName
      ? data.subCompanyName
      : undefined;

    const result = await register({
      phone: data.phone,
      idCard: data.idCard,
      realName: data.realName,
      companyName: data.companyName ?? '',
      subCompanyName,
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
              <label className={labelClass}>角色</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className={iconClass} />
                </div>
                <select
                  {...registerField('role', {
                    onChange: (e) => setSelectedRole(e.target.value),
                  })}
                  className={`block w-full pl-10 pr-10 py-2 border-2 border-primary-600 bg-white ${selectedRole ? 'text-primary-600' : 'text-gray-400'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer`}
                >
                  <option value="">请选择角色</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="text-gray-900">{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-6 w-6 text-primary-600 stroke-2" />
                </div>
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>

            {selectedRole !== 'system_admin' && (
            <div>
              <label className={labelClass}>公司</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className={iconClass} />
                </div>
                <select
                  {...registerField('companyName', {
                    onChange: (e) => setSelectedCompany(e.target.value),
                  })}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border-2 border-primary-600 bg-white ${selectedCompany ? 'text-primary-600' : 'text-gray-400'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer`}
                >
                  <option value="">请选择公司</option>
                  {companies.map((c) => (
                    <option key={c} value={c} className="text-gray-900">{c}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-6 w-6 text-primary-600 stroke-2" />
                </div>
              </div>
              {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>}
            </div>
            )}

            {COMPANIES_WITH_SUB.includes(selectedCompany) && (
              <div>
                <label className={labelClass}>分公司（吉通喜福地）</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className={iconClass} />
                  </div>
                  <select
                  {...registerField('subCompanyName', {
                    onChange: (e) => setSelectedSubCompany(e.target.value),
                  })}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border-2 border-primary-600 bg-white ${selectedSubCompany ? 'text-primary-600' : 'text-gray-400'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer`}
                >
                  <option value="">请选择分公司（可选）</option>
                  {subCompanies.map((s) => (
                    <option key={s} value={s} className="text-gray-900">{s}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-6 w-6 text-primary-600 stroke-2" />
                </div>
                </div>
              </div>
            )}

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
        <p className="text-center text-xs text-primary-500 mt-4">v260727.12</p>
      </div>
    </div>
  );
}
