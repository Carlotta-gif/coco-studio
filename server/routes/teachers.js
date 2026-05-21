const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// 获取所有老师
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 新增老师
router.post('/', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password || password.length !== 6) {
    return res.json({ success: false, message: '请填写完整信息，密码为6位' });
  }

  try {
    const { data: existing } = await supabase
      .from('teachers')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      return res.json({ success: false, message: '老师已存在' });
    }

    const { data, error } = await supabase
      .from('teachers')
      .insert({ name, password })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: '老师添加成功', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 更新老师
router.put('/:id', async (req, res) => {
  const { name, password } = req.body;
  const { id } = req.params;

  try {
    const { data: old, error: fetchError } = await supabase
      .from('teachers')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!old) return res.json({ success: false, message: '老师不存在' });

    const { error: updateError } = await supabase
      .from('teachers')
      .update({ name, password })
      .eq('id', id);

    if (updateError) throw updateError;

    // 如果老师改名，同步更新 tasks
    if (old.name !== name) {
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ teacher: name })
        .eq('teacher', old.name);

      if (taskError) throw taskError;
    }

    res.json({ success: true, message: '老师信息已更新' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 删除老师
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: teacher, error: fetchError } = await supabase
      .from('teachers')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!teacher) return res.json({ success: false, message: '老师不存在' });

    // 将该老师的任务置为未分配
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ teacher: '' })
      .eq('teacher', teacher.name);

    if (taskError) throw taskError;

    const { error: delError } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (delError) throw delError;

    res.json({ success: true, message: '老师已删除' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
