import { supabase } from './supabase';
import type { User, RegisterRequest, AuthResponse } from '../types';

// 用户注册
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  try {
    // 使用手机号作为邮箱格式
    const email = `${data.phone}@generic-hours.com`;

    // 创建 Supabase Auth 用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: data.password,
    });

    if (authError) {
      return { success: false, message: authError.message };
    }

    if (!authData.user) {
      return { success: false, message: '注册失败' };
    }

    let companyId: string | null = null;
    let subCompanyId: string | null = null;

    // 系统管理员不需要所属公司
    if (data.role === 'system_admin') {
      if (!data.companyName) {
        // 系统管理员无公司，直接创建用户记录
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            phone: data.phone,
            id_card: data.idCard,
            real_name: data.realName,
            company_id: null,
            sub_company_id: null,
            role: data.role,
          });

        if (userError) {
          return { success: false, message: '创建用户记录失败：' + userError.message };
        }

        return { success: true, message: '注册成功，请登录' };
      }
    }

    // 非系统管理员，必须有公司
    if (!data.companyName) {
      return { success: false, message: '请选择公司' };
    }

    // 查询公司
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', data.companyName)
      .single();

    if (companyError || !company) {
      return { success: false, message: '公司不存在，请联系管理员添加' };
    }
    companyId = company.id;

    // 如果有分公司，查询分公司
    if (data.subCompanyName) {
      const { data: subCompany, error: subCompanyError } = await supabase
        .from('sub_companies')
        .select('id')
        .eq('company_id', company.id)
        .eq('name', data.subCompanyName)
        .single();

      if (subCompanyError || !subCompany) {
        return { success: false, message: '分公司不存在' };
      }
      subCompanyId = subCompany.id;
    }

    // 创建用户记录
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        phone: data.phone,
        id_card: data.idCard,
        real_name: data.realName,
        company_id: companyId,
        sub_company_id: subCompanyId,
        role: data.role,
      });

    if (userError) {
      return { success: false, message: '创建用户记录失败：' + userError.message };
    }

    return { success: true, message: '注册成功，请登录' };
  } catch (error) {
    return { success: false, message: '注册失败，请稍后重试' };
  }
}

// 用户登录
export async function login(phone: string, password: string): Promise<AuthResponse> {
  try {
    const email = `${phone}@example.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: '手机号或密码错误' };
    }

    if (!data.user) {
      return { success: false, message: '登录失败' };
    }

    // 获取用户详细信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      return { success: false, message: '获取用户信息失败' };
    }

    return { success: true, message: '登录成功', user: userData };
  } catch (error) {
    return { success: false, message: '登录失败，请稍后重试' };
  }
}

// 通过身份证号重置密码
export async function resetPassword(idCard: string, _newPassword: string): Promise<AuthResponse> {
  try {
    // 查找用户
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone')
      .eq('id_card', idCard)
      .single();

    if (userError || !user) {
      return { success: false, message: '身份证号不存在' };
    }

    // 重置密码需要 admin 权限，这里返回提示
    return {
      success: false,
      message: '密码重置功能需要联系系统管理员处理（安全原因暂不支持自助重置）',
    };
  } catch (error) {
    return { success: false, message: '重置密码失败，请稍后重试' };
  }
}

// 获取当前用户
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !userData) {
    return null;
  }

  return userData;
}

// 登出
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
