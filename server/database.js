const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.db');

let db;

function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
    seedData();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS manager (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      password TEXT NOT NULL DEFAULT '920101'
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      project_name TEXT NOT NULL,
      ddl TEXT NOT NULL,
      FOREIGN KEY (student_name) REFERENCES students(name) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('PS', 'RL', 'CV')),
      type_name TEXT NOT NULL,
      teacher TEXT DEFAULT '',
      file_url TEXT DEFAULT '',
      file_name TEXT DEFAULT '',
      settlement REAL DEFAULT 0,
      is_settled INTEGER DEFAULT 0,
      voucher_url TEXT DEFAULT '',
      voucher_name TEXT DEFAULT '',
      is_real_file INTEGER DEFAULT 0,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );
  `);
}

function seedData() {
  // 检查是否已有数据
  const managerCount = db.prepare('SELECT COUNT(*) as count FROM manager').get();
  if (managerCount.count > 0) return;

  console.log('🌱 初始化种子数据...');

  // 管理人
  db.prepare('INSERT INTO manager (id, password) VALUES (1, ?)').run('920101');

  // 老师
  const insertTeacher = db.prepare('INSERT INTO teachers (name, password) VALUES (?, ?)');
  insertTeacher.run('王老师', '111111');
  insertTeacher.run('李老师', '222222');
  insertTeacher.run('张老师', '333333');

  // 学生
  const insertStudent = db.prepare('INSERT INTO students (name, password) VALUES (?, ?)');
  insertStudent.run('张伟', '888888');
  insertStudent.run('李娜', '999999');
  insertStudent.run('陈静', '777777');

  // 申请项目
  const insertApp = db.prepare('INSERT INTO applications (student_name, project_name, ddl) VALUES (?, ?, ?)');
  const insertTask = db.prepare('INSERT INTO tasks (application_id, type, type_name, teacher, file_url, file_name, settlement, is_settled, voucher_url, voucher_name, is_real_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

  // 项目1: 张伟 - 香港大学
  const app1 = insertApp.run('张伟', '香港大学 - 金融学硕士 (MSc Finance)', '2026-05-22');
  insertTask.run(app1.lastInsertRowid, 'PS', '个人陈述文书', '王老师', 'mock_ps.pdf', 'Zhang_Wei_HKU_PS_v2.pdf', 1200, 1, 'https://placehold.co/600x800/e0f2fe/0369a1?text=Payment+Voucher+¥1200', 'hk_univ_ps_voucher.png', 0);
  insertTask.run(app1.lastInsertRowid, 'RL', '推荐信', '李老师', '', '', 500, 0, '', '', 0);
  insertTask.run(app1.lastInsertRowid, 'CV', '简历CV', '王老师', 'mock_cv.pdf', 'Zhang_Wei_HKU_CV_v1.pdf', 400, 0, '', '', 0);

  // 项目2: 李娜 - 新加坡国立大学
  const app2 = insertApp.run('李娜', '新加坡国立大学 - 计算机硕士 (MSc CS)', '2026-06-15');
  insertTask.run(app2.lastInsertRowid, 'PS', '个人陈述文书', '张老师', 'mock_ps.pdf', 'Li_Na_NUS_PS_Draft.pdf', 1500, 0, '', '', 0);
  insertTask.run(app2.lastInsertRowid, 'RL', '推荐信', '王老师', '', '', 600, 0, '', '', 0);
  insertTask.run(app2.lastInsertRowid, 'CV', '简历CV', '张老师', 'mock_cv.pdf', 'Li_Na_NUS_CV_Final.pdf', 400, 0, '', '', 0);

  // 项目3: 陈静 - 南洋理工大学
  const app3 = insertApp.run('陈静', '南洋理工大学 - 商业分析硕士 (MSc BA)', '2026-05-20');
  insertTask.run(app3.lastInsertRowid, 'PS', '个人陈述文书', '王老师', '', '', 1200, 0, '', '', 0);
  insertTask.run(app3.lastInsertRowid, 'RL', '推荐信', '李老师', 'mock_rl.pdf', 'Chen_Jing_NTU_RL_Draft.pdf', 500, 0, '', '', 0);
  insertTask.run(app3.lastInsertRowid, 'CV', '简历CV', '王老师', '', '', 400, 0, '', '', 0);
}

module.exports = { getDatabase };
