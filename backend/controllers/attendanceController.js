const supabase = require('../config/supabase');

// 1. Clock In
const clockIn = async (req, res) => {
  const { employee_id } = req.body;

  if (!employee_id) {
    return res.status(400).json({ error: "employee_id diperlukan" });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // Cek apakah sudah clock in hari ini
    const { data: existing, error: checkError } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('date', today)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Anda sudah melakukan clock in hari ini" });
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        employee_id,
        date: today,
        clock_in_time: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Clock In Error:", err.message);
    res.status(500).json({ error: "Gagal melakukan clock in" });
  }
};

// 2. Clock Out (dan mengisi Daily Pulse)
const clockOut = async (req, res) => {
  const { employee_id, mood_score, notes } = req.body;

  if (!employee_id || mood_score === undefined) {
    return res.status(400).json({ error: "employee_id dan mood_score diperlukan" });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // Cari absen hari ini
    const { data: existing, error: checkError } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('date', today)
      .single();

    if (!existing) {
      return res.status(400).json({ error: "Anda belum melakukan clock in hari ini" });
    }

    if (existing.clock_out_time) {
      return res.status(400).json({ error: "Anda sudah melakukan clock out hari ini" });
    }

    const { data, error } = await supabase
      .from('attendance')
      .update({
        clock_out_time: new Date().toISOString(),
        mood_score: parseFloat(mood_score),
        notes: notes || null
      })
      .eq('id', existing.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error("Clock Out Error:", err.message);
    res.status(500).json({ error: "Gagal melakukan clock out" });
  }
};

// 3. GET History Absensi per Karyawan
const getAttendanceHistory = async (req, res) => {
  const { employee_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gagal mengambil riwayat absensi" });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getAttendanceHistory
};
