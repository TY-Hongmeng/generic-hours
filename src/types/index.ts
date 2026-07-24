// 用户数据模型
export interface User {
  id: string;
  phone: string;
  id_card: string;
  real_name: string;
  company_id: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

// 公司数据模型
export interface Company {
  id: string;
  name: string;
  credit_code: string;
  legal_person: string;
  address: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

// 角色数据模型
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
}

// 认证相关接口
export interface RegisterRequest {
  phone: string;
  idCard: string;
  realName: string;
  companyName: string;
  role: string;
  password: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface ResetPasswordRequest {
  idCard: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}
