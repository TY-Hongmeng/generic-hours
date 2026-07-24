import { supabase } from './supabase';
import type { Role } from '../types';

// 获取所有角色
export async function getRoles(): Promise<Role[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('*');

  if (error || !data) {
    return [];
  }

  return data;
}

// 获取角色详情
export async function getRole(roleId: string): Promise<Role | null> {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', roleId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
