const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// 获取所有申请项目（含任务）
router.get('/', async (req, res) => {
  try {
    const { data: apps, error: appError } = await supabase
      .from('applications')
      .select('*')
      .order('ddl');

    if (appError) throw appError;

    // 获取所有任务
    const appIds = apps.map(a => a.id);
    let tasks = [];
    if (appIds.length > 0) {
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .in('application_id', appIds)
        .order('id');

      if (taskError) throw taskError;
      tasks = taskData || [];
    }

    // 组装数据
    const result = apps.map(app => ({
      id: app.id,
      studentName: app.student_name,
      projectName: app.project_name,
      ddl: app.ddl,
      tasks: tasks
        .filter(t => t.application_id === app.id)
        .map(t => ({
          id: t.id,
          type: t.type,
          typeName: t.type_name,
          teacher: t.teacher,
          fileUrl: t.file_url,
          fileName: t.file_name,
          settlement: t.settlement,
          isSettled: t.is_settled === 1,
          voucherUrl: t.voucher_url,
          voucherName: t.voucher_name,
          isRealFile: t.is_real_file === 1
        }))
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('获取申请列表错误:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 新增申请项目
router.post('/', async (req, res) => {
  const { studentName, projectName, ddl } = req.body;

  if (!studentName || !projectName || !ddl) {
    return res.json({ success: false, message: '请填写完整信息' });
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .insert({ student_name: studentName, project_name: projectName, ddl })
      .select()
      .single();

    if (error) throw error;

    // 自动创建三个任务
    const taskTypes = [
      { type: 'PS', typeName: '个人陈述文书' },
      { type: 'RL', typeName: '推荐信' },
      { type: 'CV', typeName: '简历CV' }
    ];

    const taskInserts = taskTypes.map(t => ({
      application_id: data.id,
      type: t.type,
      type_name: t.typeName
    }));

    const { error: taskError } = await supabase
      .from('tasks')
      .insert(taskInserts);

    if (taskError) throw taskError;

    res.json({ success: true, message: '申请项目添加成功', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 更新申请项目
router.put('/:id', async (req, res) => {
  const { studentName, projectName, ddl } = req.body;
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('applications')
      .update({ student_name: studentName, project_name: projectName, ddl })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: '申请项目已更新' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 删除申请项目
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: '申请项目已删除' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 分配老师
router.put('/:appId/tasks/:taskId/teacher', async (req, res) => {
  const { teacher } = req.body;
  const { taskId } = req.params;

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ teacher })
      .eq('id', taskId);

    if (error) throw error;
    res.json({ success: true, message: '老师已分配' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 设置结算金额
router.put('/:appId/tasks/:taskId/settlement', async (req, res) => {
  const { settlement } = req.body;
  const { taskId } = req.params;

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ settlement })
      .eq('id', taskId);

    if (error) throw error;
    res.json({ success: true, message: '结算金额已设置' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 标记结算状态
router.put('/:appId/tasks/:taskId/settle', async (req, res) => {
  const { isSettled } = req.body;
  const { taskId } = req.params;

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ is_settled: isSettled ? 1 : 0 })
      .eq('id', taskId);

    if (error) throw error;
    res.json({ success: true, message: isSettled ? '已标记为已结算' : '已取消结算' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 上传 PDF 文书（存储为 Supabase Storage 链接）
router.post('/:appId/tasks/:taskId/upload-pdf', async (req, res) => {
  const { taskId } = req.params;
  const { fileUrl, fileName } = req.body;

  if (!fileUrl || !fileName) {
    return res.json({ success: false, message: '缺少文件信息' });
  }

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ file_url: fileUrl, file_name: fileName, is_real_file: 1 })
      .eq('id', taskId);

    if (error) throw error;
    res.json({ success: true, message: '文书已上传' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 上传付款凭证（存储为 Supabase Storage 链接）
router.post('/:appId/tasks/:taskId/upload-voucher', async (req, res) => {
  const { taskId } = req.params;
  const { voucherUrl, voucherName } = req.body;

  if (!voucherUrl || !voucherName) {
    return res.json({ success: false, message: '缺少凭证信息' });
  }

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ voucher_url: voucherUrl, voucher_name: voucherName })
      .eq('id', taskId);

    if (error) throw error;
    res.json({ success: true, message: '付款凭证已上传' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 清除凭证
router.delete('/:appId/tasks/:taskId/voucher', async (req, res) => {
  const { taskId } = req.params;

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ voucher_url: '', voucher_name: '' })
      .eq('id', taskId);

    if (error) throw error;
    res.json({ success: true, message: '付款凭证已清除' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
