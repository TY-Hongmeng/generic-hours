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

    // 查询或创建公司
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', data.companyName)
      .single();

    let companyId: string;
    
    if (companyError || !company) {
      // 创建新公司
      const { data: newCompany, error: newCompanyError } = await supabase
        .from('companies')
        .insert({ name: data.companyName })
        .select('id')
        .single();

      if (newCompanyError || !newCompany) {
        return { success: false, message: '创建公司信息失败' };
      }
      companyId = newCompany.id;
    } else {
      companyId = company.id;
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
        role: data.role,
      });

    if (userError) {
      return { success: false, message: '创建用户记录失败' };
    }

    return { success: true, message: '注册成功' };
  } catch (error) {
    return { success: false, message: '注册失败，请稍后重试' };
  }
}

// 用户登录
export async function login(phone: string, password: string): Promise<AuthResponse> {
  try {
    const email = `${phone}@generic-hours.com`;
    
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
export async function resetPassword(idCard: string, newPassword: string): Promise<AuthResponse> {
  try {
    // 查找用户
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id_card', idCard)
      .single();

    if (userError || !user) {
      return { success: false, message: '身份证号不存在' };
    }

    // 注意：Supabase Auth 不允许直接修改用户密码
    // 这里需要通过邮箱重置密码的流程
    const email = `${idCard}@generic-hours.com`;
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

    if (resetError) {
      return { success: false, message: '重置密码失败' };
    }

    return { success: true, message: '密码重置链接已发送' };
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
