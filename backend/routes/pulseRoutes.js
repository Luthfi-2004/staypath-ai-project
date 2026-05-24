const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');

// POST /api/pulse — simpan check-in harian
router.post('/', async (req, res) => {
  const { employee_id, mood_score, workload_score, note } = req.body;

  if (!employee_id || mood_score == null) {
    return res.status(400).json({ error: 'employee_id dan mood_score wajib diisi' });
  }

  // Cek apakah sudah submit hari ini
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('daily_pulse')
    .select('id')
    .eq('employee_id', employee_id)
    .gte('submitted_at', `${today}T00:00:00`)
    .limit(1);

  if (existing && existing.length > 0) {
    return res.status(409).json({ error: 'Sudah submit hari ini', alreadySubmitted: true });
  }

  try {
    const { data, error } = await supabase
      .from('daily_pulse')
      .insert([{ employee_id, mood_score, workload_score, note }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Pulse insert error:', err.message);
    res.status(500).json({ error: 'Gagal menyimpan check-in' });
  }
});

// GET /api/pulse/:employee_id — riwayat 30 hari terakhir
router.get('/:employee_id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('daily_pulse')
      .select('*')
      .eq('employee_id', req.params.employee_id)
      .order('submitted_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Pulse fetch error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil riwayat pulse' });
  }
});

// GET /api/pulse — semua pulse hari ini (untuk HRD)
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_pulse')
      .select('*, employees(name, department, role)')
      .gte('submitted_at', `${today}T00:00:00`)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Pulse today error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data pulse hari ini' });
  }
});

module.exports = router;