import { supabase } from './supabase';
import type { Company, SubCompany } from '../types';

// 获取公司信息
export async function getCompany(companyId: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// 获取分公司信息
export async function getSubCompany(subCompanyId: string): Promise<SubCompany | null> {
  const { data, error } = await supabase
    .from('sub_companies')
    .select('*')
    .eq('id', subCompanyId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// 更新公司信息
export async function updateCompany(companyId: string, updates: Partial<Company>): Promise<boolean> {
  const { error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId);

  return !error;
}
