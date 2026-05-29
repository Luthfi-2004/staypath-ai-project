const supabase = require('../config/supabase');

// 1. GET: Mengambil semua data karyawan
const getEmployees = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gagal mengambil data" });
  }
};

// 2. POST: Tambah karyawan baru
const addEmployee = async (req, res) => {
  const { 
    name, department, role, status, join_date, email, password, auth_role,
    education_level, country, industry, company_size, remote_work_type,
    primary_ai_tool, ai_adoption_stage, fear_of_ai_replacement,
    productivity_score, burnout_score, years_experience, team_size,
    salary_usd_k, ai_tools_used_per_day, hours_with_ai_assistance_daily,
    ai_replaces_my_tasks_pct, weekly_ai_upskilling_hrs, job_satisfaction_1_5
  } = req.body;

  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([{
        name, department, role, 
        status: status || 'Aktif',
        join_date: join_date || new Date().toISOString().split('T')[0],
        email: email || null,
        password: password || 'password123',
        auth_role: auth_role || 'karyawan',
        
        // Data AI yang diinput via UI Step 2 & Step 3
        education_level: education_level || 'Bachelor',
        country: country || 'Indonesia',
        industry: industry || 'Technology',
        company_size: company_size || 'Mid-size',
        remote_work_type: remote_work_type || 'Hybrid',
        primary_ai_tool: primary_ai_tool || 'ChatGPT',
        ai_adoption_stage: ai_adoption_stage || 'Intermediate',
        fear_of_ai_replacement: fear_of_ai_replacement || 'Low',
        productivity_score: parseFloat(productivity_score) || 7.5,
        burnout_score: parseFloat(burnout_score) || 50.0,
        years_experience: parseFloat(years_experience) || 2.0,
        team_size: parseFloat(team_size) || 10.0,
        salary_usd_k: parseFloat(salary_usd_k) || 50.0,
        ai_tools_used_per_day: parseFloat(ai_tools_used_per_day) || 1.0,
        hours_with_ai_assistance_daily: parseFloat(hours_with_ai_assistance_daily) || 2.0,
        ai_replaces_my_tasks_pct: parseFloat(ai_replaces_my_tasks_pct) || 15.0,
        weekly_ai_upskilling_hrs: parseFloat(weekly_ai_upskilling_hrs) || 1.0,
        job_satisfaction_1_5: parseFloat(job_satisfaction_1_5) || 3.0
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Insert Error:", err.message);
    res.status(500).json({ error: "Gagal menambahkan data" });
  }
};

// 3. PUT: Update data karyawan berdasarkan ID
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { 
    name, department, role, status, join_date, email, password, auth_role,
    // Harus ditangkap juga di fungsi Update!
    education_level, country, industry, company_size, remote_work_type,
    primary_ai_tool, ai_adoption_stage, fear_of_ai_replacement,
    productivity_score, burnout_score, years_experience, team_size,
    salary_usd_k, ai_tools_used_per_day, hours_with_ai_assistance_daily,
    ai_replaces_my_tasks_pct, weekly_ai_upskilling_hrs, job_satisfaction_1_5
  } = req.body;

  try {
    const updateData = {
      name,
      department,
      role,
      status:    status    || 'Aktif',
      join_date: join_date || new Date().toISOString().split('T')[0],
      auth_role: auth_role || 'karyawan',
      
      // Update data AI ke Database
      education_level,
      country,
      industry,
      company_size,
      remote_work_type,
      primary_ai_tool,
      ai_adoption_stage,
      fear_of_ai_replacement,
      productivity_score: parseFloat(productivity_score),
      burnout_score: parseFloat(burnout_score),
      years_experience: parseFloat(years_experience),
      team_size: parseFloat(team_size),
      salary_usd_k: parseFloat(salary_usd_k),
      ai_tools_used_per_day: parseFloat(ai_tools_used_per_day),
      hours_with_ai_assistance_daily: parseFloat(hours_with_ai_assistance_daily),
      ai_replaces_my_tasks_pct: parseFloat(ai_replaces_my_tasks_pct),
      weekly_ai_upskilling_hrs: parseFloat(weekly_ai_upskilling_hrs),
      job_satisfaction_1_5: parseFloat(job_satisfaction_1_5)
    };

    if (email !== undefined) updateData.email = email;
    if (password && password.trim()) updateData.password = password;

    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gagal mengupdate data" });
  }
};

// 4. DELETE: Hapus karyawan berdasarkan ID
const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: "Karyawan berhasil dihapus secara permanen" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gagal menghapus data" });
  }
};

// ==========================================
// 🌟 5. JALUR KHUSUS UPDATE STATUS DOANG 🌟
// ==========================================
const updateEmployeeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error("Gagal update status:", err.message);
    res.status(500).json({ error: "Gagal update status" });
  }
};

// Jangan lupa update export-nya di bawah ini:
module.exports = { 
  getEmployees, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee, 
  updateEmployeeStatus // <-- Ini baru
};