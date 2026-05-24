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

// 2. POST: Tambah karyawan baru ke Supabase
const addEmployee = async (req, res) => {
  const { name, department, role, status, join_date } = req.body;
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([{
        name,
        department,
        role,
        status: status || 'Aktif',
        join_date
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]); // Balikin data yang baru sukses dibuat
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gagal menambahkan data" });
  }
};

// 3. PUT: Update data karyawan berdasarkan ID
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, department, role, status, join_date } = req.body;
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({
        name,
        department,
        role,
        status: status || 'Aktif',
        join_date
      })
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

// Export semua fungsi agar bisa dibaca oleh file Routes
module.exports = {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee
};