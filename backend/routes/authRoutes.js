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
      .select('id, name, email, auth_role, department, role')
      .eq('email', email.toLowerCase().trim())
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    res.json({
      id:        data.id,
      name:      data.name,
      email:     data.email,
      auth_role: data.auth_role,
      department:data.department,
      job_title: data.role,
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Gagal login' });
  }
});

module.exports = router;