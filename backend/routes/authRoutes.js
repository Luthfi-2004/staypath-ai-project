const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, email, auth_role, department, job_title, status')
      .eq('email', email.toLowerCase().trim())
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    if (data.status === 'Nonaktif') {
      return res.status(403).json({ error: 'Akun kamu dinonaktifkan. Hubungi HR.' });
    }

    res.json({
      id:         data.id,
      name:       data.name,
      email:      data.email,
      auth_role:  data.auth_role,
      department: data.department,
      job_title:  data.job_title,
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Gagal login' });
  }
});

// GET /api/auth/me/:id
router.get('/me/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('status')
      .eq('id', req.params.id)
      .single();

    if (error || !data) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil status' });
  }
});

module.exports = router;