const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// 登录
router.post('/login', async (req, res) => {
  const { role, username, password } = req.body;

  try {
    if (role === 'manager') {
      const { data, error } = await supabase
        .from('manager')
        .select('password')
        .eq('id', 1)
        .single();

      if (error) throw error;
      if (data && data.password === password) {
        return res.json({ success: true, role: 'manager', user: { name: '工作室管理人' } });
      }
    } else if (role === 'teacher') {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, name')
        .eq('name', username)
        .eq('password', password)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        return res.json({ success: true, role: 'teacher', user: { id: data.id, name: data.name } });
      }
    } else if (role === 'student') {
      const { data, error } = await supabase
        .from('students')
        .select('id, name')
        .eq('name', username)
        .eq('password', password)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        return res.json({ success: true, role: 'student', user: { id: data.id, name: data.name } });
      }
    }
    res.json({ success: false, message: '账号或密码错误' });
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 修改管理人密码
router.put('/manager/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const { data, error } = await supabase
      .from('manager')
      .select('password')
      .eq('id', 1)
      .single();

    if (error) throw error;
    if (data.password !== currentPassword) {
      return res.json({ success: false, message: '当前密码不正确' });
    }

    const { error: updateError } = await supabase
      .from('manager')
      .update({ password: newPassword })
      .eq('id', 1);

    if (updateError) throw updateError;
    res.json({ success: true, message: '密码已更新' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
