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
  const { name, department, role, status, join_date, email, password, auth_role } = req.body;
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([{
        name,
        department,
        role,
        status:    status    || 'Aktif',
        join_date: join_date || new Date().toISOString().split('T')[0],
        email:     email     || null,
        password:  password  || 'password123',
        auth_role: auth_role || 'karyawan',
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gagal menambahkan data" });
  }
};

// 3. PUT: Update data karyawan berdasarkan ID
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, department, role, status, join_date, email, password, auth_role } = req.body;
  try {
    const updateData = {
      name,
      department,
      role,
      status:    status    || 'Aktif',
      join_date: join_date || new Date().toISOString().split('T')[0],
      auth_role: auth_role || 'karyawan',
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