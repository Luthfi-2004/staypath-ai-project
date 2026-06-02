const supabase = require('../config/supabase');

// 1. GET: Ambil semua pengajuan cuti (untuk HRD)
const getAllLeaves = async (req, res) => {
  try {
    // Kita joinkan dengan employees untuk mendapatkan nama karyawan
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*, employees(name, department, role)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Get Leaves Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data cuti" });
  }
};

// 2. GET: Ambil riwayat cuti spesifik karyawan
const getMyLeaves = async (req, res) => {
  const { employee_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', employee_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Get My Leaves Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil riwayat cuti" });
  }
};

// 3. POST: Ajukan cuti baru
const submitLeaveRequest = async (req, res) => {
  const { employee_id, start_date, end_date, leave_type, reason } = req.body;

  if (!employee_id || !start_date || !end_date || !leave_type) {
    return res.status(400).json({ error: "Semua field wajib diisi" });
  }

  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert([{
        employee_id,
        start_date,
        end_date,
        leave_type,
        reason,
        status: 'Pending'
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Submit Leave Error:", err.message);
    res.status(500).json({ error: "Gagal mengajukan cuti" });
  }
};

// 4. PUT: Approve / Reject cuti (Khusus HRD)
const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Approved' atau 'Rejected'

  if (!status) {
    return res.status(400).json({ error: "Status diperlukan" });
  }

  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error("Update Leave Status Error:", err.message);
    res.status(500).json({ error: "Gagal mengubah status cuti" });
  }
};

module.exports = {
  getAllLeaves,
  getMyLeaves,
  submitLeaveRequest,
  updateLeaveStatus
};
