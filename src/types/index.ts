// 用户数据模型
export interface User {
  id: string;
  phone: string;
  id_card: string;
  real_name: string;
  company_id: string;
  sub_company_id: string | null;
  role: RoleType;
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

// 分公司数据模型
export interface SubCompany {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
}

// 角色类型
export type RoleType =
  | 'employee'        // 员工
  | 'team_leader'     // 班长
  | 'section_leader'  // 段长
  | 'accountant'      // 财会
  | 'production_manager' // 生产经理
  | 'finance_director'   // 财务总监
  | 'system_admin';   // 系统管理员

// 角色元数据
export const ROLE_LABELS: Record<RoleType, string> = {
  employee: '员工',
  team_leader: '班长',
  section_leader: '段长',
  accountant: '财会',
  production_manager: '生产经理',
  finance_director: '财务总监',
  system_admin: '系统管理员',
};

// 角色数据模型
export interface Role {
  id: string;
  name: RoleType;
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
  subCompanyName?: string;
  role: RoleType;
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
