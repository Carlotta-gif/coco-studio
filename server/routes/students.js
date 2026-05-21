const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// 获取所有学生
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 新增学生
router.post('/', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password || password.length !== 6) {
    return res.json({ success: false, message: '请填写完整信息，密码为6位' });
  }

  try {
    // 检查是否已存在
    const { data: existing } = await supabase
      .from('students')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      return res.json({ success: false, message: '学生已存在' });
    }

    const { data, error } = await supabase
      .from('students')
      .insert({ name, password })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: '学生添加成功', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 更新学生
router.put('/:id', async (req, res) => {
  const { name, password } = req.body;
  const { id } = req.params;

  try {
    const { data: old, error: fetchError } = await supabase
      .from('students')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!old) return res.json({ success: false, message: '学生不存在' });

    const { error: updateError } = await supabase
      .from('students')
      .update({ name, password })
      .eq('id', id);

    if (updateError) throw updateError;

    // 如果学生改名，同步更新 applications
    if (old.name !== name) {
      const { error: appError } = await supabase
        .from('applications')
        .update({ student_name: name })
        .eq('student_name', old.name);

      if (appError) throw appError;
    }

    res.json({ success: true, message: '学生信息已更新' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 删除学生
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!student) return res.json({ success: false, message: '学生不存在' });

    // 删除关联的申请（外键 CASCADE 会自动删除 tasks）
    const { error: delAppError } = await supabase
      .from('applications')
      .delete()
      .eq('student_name', student.name);

    if (delAppError) throw delAppError;

    const { error: delError } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (delError) throw delError;

    res.json({ success: true, message: '学生已删除' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
