const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// POST /api/meetings
router.post('/', async (req, res) => {
  try {
    const { title, date, type, participants } = req.body;
    const { data, error } = await supabase
      .from('meetings')
      .insert([{ title, date, type, participants }])
      .select();
      
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Create meeting error:', err.message);
    res.status(500).json({ error: 'Gagal menjadwalkan meeting' });
  }
});

// GET /api/meetings
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: true });
      
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Fetch meetings error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data meeting' });
  }
});

module.exports = router;
