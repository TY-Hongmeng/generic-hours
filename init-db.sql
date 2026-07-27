-- ============================================================
-- 通用工时管理系统 - 数据库初始化脚本
-- 在 Supabase 控制台 → SQL Editor → New query 中粘贴执行
-- ============================================================

-- 1. 建表（companies 已存在则跳过）
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  credit_code text DEFAULT '',
  legal_person text DEFAULT '',
  address text DEFAULT '',
  contact_phone text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sub_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text DEFAULT '',
  permissions text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,                           -- 关联 auth.users.id
  phone text NOT NULL UNIQUE,
  id_card text NOT NULL,
  real_name text NOT NULL,
  company_id uuid REFERENCES public.companies(id),
  sub_company_id uuid REFERENCES public.sub_companies(id),
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. 关闭 RLS（避免 401）
ALTER TABLE public.companies      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_companies  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users          DISABLE ROW LEVEL SECURITY;

-- 3. 灌入基础数据：2 个公司
INSERT INTO public.companies (name, credit_code, legal_person, address, contact_phone) VALUES
  ('吉通凯撒',     '91220101MA00000001', '张三', '长春市朝阳区', '0431-80000001'),
  ('吉通喜福地',   '91220101MA00000002', '李四', '长春市南关区', '0431-80000002')
ON CONFLICT (name) DO NOTHING;

-- 4. 灌入分公司（吉通喜福地下挂 3 个分公司）
INSERT INTO public.sub_companies (company_id, name)
SELECT c.id, s.name
FROM public.companies c
CROSS JOIN (VALUES
  ('挤压铝棒分公司'),
  ('CPC铸造分公司'),
  ('重力铸造分公司')
) AS s(name)
WHERE c.name = '吉通喜福地'
ON CONFLICT (company_id, name) DO NOTHING;

-- 5. 灌入 7 个角色
INSERT INTO public.roles (name, description, permissions) VALUES
  ('employee',           '员工',          ARRAY['view_own_hours','submit_own_hours']),
  ('team_leader',        '班长',          ARRAY['view_team_hours','approve_team_hours']),
  ('section_leader',     '段长',          ARRAY['view_section_hours','approve_section_hours']),
  ('accountant',         '财会',          ARRAY['view_all_hours','export_hours']),
  ('production_manager', '生产经理',      ARRAY['view_all_hours','approve_all_hours']),
  ('finance_director',   '财务总监',      ARRAY['view_all_hours','approve_final_hours','export_hours']),
  ('system_admin',       '系统管理员',    ARRAY['*'])
ON CONFLICT (name) DO NOTHING;

-- 6. 验证
SELECT 'companies'      AS table_name, COUNT(*) AS rows FROM public.companies
UNION ALL SELECT 'sub_companies',  COUNT(*) FROM public.sub_companies
UNION ALL SELECT 'roles',          COUNT(*) FROM public.roles
UNION ALL SELECT 'users',          COUNT(*) FROM public.users;
