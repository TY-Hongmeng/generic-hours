import { supabase } from './supabase';
import type { User } from '../types';

// 获取用户信息
export async function getUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// 更新用户信息
export async function updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  return !error;
}
