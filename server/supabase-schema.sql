-- ============================================
-- COCO 留学管理后台 - Supabase 数据库初始化脚本
-- 在 Supabase Dashboard > SQL Editor 中运行此脚本
-- ============================================

-- 1. 管理人表
CREATE TABLE IF NOT EXISTS manager (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password TEXT NOT NULL DEFAULT '920101'
);

-- 插入默认管理人
INSERT INTO manager (id, password) VALUES (1, '920101')
ON CONFLICT (id) DO NOTHING;

-- 2. 老师表
CREATE TABLE IF NOT EXISTS teachers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- 3. 学生表
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- 4. 申请项目表
CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  student_name TEXT NOT NULL REFERENCES students(name) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  ddl TEXT NOT NULL
);

-- 5. 任务表
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('PS', 'RL', 'CV')),
  type_name TEXT NOT NULL,
  teacher TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  file_name TEXT DEFAULT '',
  settlement REAL DEFAULT 0,
  is_settled INTEGER DEFAULT 0,
  voucher_url TEXT DEFAULT '',
  voucher_name TEXT DEFAULT '',
  is_real_file INTEGER DEFAULT 0
);

-- ========== 种子数据 ==========

-- 老师
INSERT INTO teachers (name, password) VALUES
  ('王老师', '111111'),
  ('李老师', '222222'),
  ('张老师', '333333')
ON CONFLICT (name) DO NOTHING;

-- 学生
INSERT INTO students (name, password) VALUES
  ('张伟', '888888'),
  ('李娜', '999999'),
  ('陈静', '777777')
ON CONFLICT (name) DO NOTHING;

-- 申请项目 1: 张伟 - 香港大学
INSERT INTO applications (student_name, project_name, ddl)
SELECT '张伟', '香港大学 - 金融学硕士 (MSc Finance)', '2026-05-22'
WHERE NOT EXISTS (SELECT 1 FROM applications WHERE student_name = '张伟' AND project_name = '香港大学 - 金融学硕士 (MSc Finance)');

INSERT INTO tasks (application_id, type, type_name, teacher, file_url, file_name, settlement, is_settled, voucher_url, voucher_name, is_real_file)
SELECT a.id, 'PS', '个人陈述文书', '王老师', 'mock_ps.pdf', 'Zhang_Wei_HKU_PS_v2.pdf', 1200, 1, 'https://placehold.co/600x800/e0f2fe/0369a1?text=Payment+Voucher+¥1200', 'hk_univ_ps_voucher.png', 0
FROM applications a WHERE a.student_name = '张伟' AND a.project_name = '香港大学 - 金融学硕士 (MSc Finance)'
AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.application_id = a.id AND t.type = 'PS');

INSERT INTO tasks (application_id, type, type_name, teacher, file_url, file_name, settlement, is_settled, voucher_url, voucher_name, is_real_file)
SELECT a.id, 'RL', '推荐信', '李老师', '', '', 500, 0, '', '', 0
FROM applications a WHERE a.student_name = '张伟' AND a.project_name = '香港大学 - 金融学硕士 (MSc Finance)'
AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.application_id = a.id AND t.type = 'RL');

INSERT INTO tasks (application_id, type, type_name, teacher, file_url, file_name, settlement, is_settled, voucher_url, voucher_name, is_real_file)
SELECT a.id, 'CV', '简历CV', '王老师', 'mock_cv.pdf', 'Zhang_Wei_HKU_CV_v1.pdf', 400, 0, '', '', 0
FROM applications a WHERE a.student_name = '张伟' AND a.project_name = '香港大学 - 金融学硕士 (MSc Finance)'
AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.application_id = a.id AND t.type = 'CV');

-- 申请项目 2: 李娜 - 新加坡国立大学
INSERT INTO applications (student_name, project_name, ddl)
SELECT '李娜', '新加坡国立大学 - 计算机硕士 (MSc CS)', '2026-06-15'
WHERE NOT EXISTS (SELECT 1 FROM applications WHERE student_name = '李娜' AND project_name = '新加坡国立大学 - 计算机硕士 (MSc CS)');

INSERT INTO tasks (application_id, type, type_name, teacher, file_url, file_name, settlement, is_settled, voucher_url, voucher_name, is_real_file)
SELECT a.id, 'PS', '个人陈述文书', '张老师', 'mock_ps.pdf', 'Li_Na_NUS_PS_Draft.pdf', 1500, 0, '', '', 0
FROM applications a WHERE a.student_name = '李娜' AND a.project_name = '新加坡国立大学 - 计算机硕士 (MSc CS)'
AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.application_id = a.id AND t.type = 'PS');

INSERT INTO tasks (application_id, type, type_name, teacher, file_url, file_name, settlement, is_settled, voucher_url, voucher_name, is_real_file)
SELECT a.id, 'RL', '推荐信', '王老师', '', '', 600, 0, '', '', 0
FROM applications a WHERE a.student_name = '李娜' AND a.project_name = '新加坡国立大学 - 计算机硕士 (MSc CS)'
AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.application_id = a.id AND t.type = 'RL');

INSERT INTO tasks (application_id, type, type_name, teacher, file_url, file_name, settlement, is_settled, voucher_url, voucher_name, is_real_file)
SELECT a.id, 'CV', '简历CV', '张老师', 'mock_cv.pdf', 'Li_Na_NUS_CV_Final.pdf', 400, 0, '', '', 0
FROM applications a WHERE a.student_name = '李娜' AND a.project_name = '新加坡国立大学 - 计算机硕士 (MSc CS)'
AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.application_id = a.id AND t.type = 'CV');

-- 申请项目 3: 陈静 - 南洋理工大学
INSERT INTO applications (student_name, project_name, ddl)
SELECT '陈静', '南洋理工大学 - 商业分析硕士 (MSc BA)', '2026-05-20'
WHERE NOT EXISTS (SELECT 1 FROM applications WHERE student_name = '陈静' AND project_name = '南洋理工大学 - 商业分析硕士 (MSc BA)');

INSERT INTO tasks (application_id, type, type_name, teacher, file_url, file_name, settlement, is_settled, voucher_url, voucher_name, is_real_file)
SELECT a.id, 'PS', '个人陈述文书', '王老师', '', '', 1200, 0, '', '', 0
FROM applications a WHERE a.student_name = '陈静' AND a.project_name = '南洋理工大学 - 商业分析硕士 (MSc CS)'
AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.application_id = a.id AND t.type = 'PS');

INSERT INTO tasks (application_id, type, type_name, teacher, file_url, file_name, settlement, is_settled, voucher_url, voucher_name, is_real_file)
SELECT a.id, 'RL', '推荐信', '李老师', 'mock_rl.pdf', 'Chen_Jing_NTU_RL_Draft.pdf', 500, 0, '', '', 0
FROM applications a WHERE a.student_name = '陈静' AND a.project_name = '南洋理工大学 - 商业分析硕士 (MSc BA)'
AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.application_id = a.id AND t.type = 'RL');

INSERT INTO tasks (application_id, type, type_name, teacher, file_url, file_name, settlement, is_settled, voucher_url, voucher_name, is_real_file)
SELECT a.id, 'CV', '简历CV', '王老师', '', '', 400, 0, '', '', 0
FROM applications a WHERE a.student_name = '陈静' AND a.project_name = '南洋理工大学 - 商业分析硕士 (MSc BA)'
AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.application_id = a.id AND t.type = 'CV');
