const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');

// GET /api/dashboard/stats
// Dipakai oleh SummaryCards dan Dashboard
router.get('/stats', async (req, res) => {
  try {
    // 1. Total karyawan
    const { count: totalEmployees, error: e1 } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    if (e1) throw e1;

    // 2. Jumlah high risk (berdasarkan attrition_risk yang sudah diisi AI)
    const { count: highRiskCount, error: e2 } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('attrition_risk', 'High');
    if (e2) throw e2;

    // 3. Total Teams
    const { count: totalTeams, error: e3 } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true });
    if (e3) throw e3;

    // 4. Latest Employees (5 most recent)
    const { data: latestEmployees, error: e4 } = await supabase
      .from('employees')
      .select('id, name, role, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5);
    if (e4) throw e4;

    // 5. Latest Teams (5 most recent)
    const { data: latestTeams, error: e5 } = await supabase
      .from('teams')
      .select('id, name, department, created_at, expected_size')
      .order('created_at', { ascending: false })
      .limit(5);
    if (e5) throw e5;

    // 6. Pulse/Mood Stats (Dari tabel attendance atau employees)
    // Asumsikan kita punya rata-rata mood di employees
    const { data: empData, error: e6 } = await supabase.from('employees').select('mood_score, burnout_level, satisfaction_score');
    let avgMood = 0, avgBurnout = 0, avgSat = 0, validMoods = 0;
    if (empData) {
        empData.forEach(e => {
            if (e.mood_score) { avgMood += e.mood_score; validMoods++; }
            if (e.burnout_level) { avgBurnout += e.burnout_level; }
            if (e.satisfaction_score) { avgSat += e.satisfaction_score; }
        });
        if (validMoods > 0) avgMood = (avgMood / validMoods).toFixed(1);
        if (empData.length > 0) {
            avgBurnout = (avgBurnout / empData.length).toFixed(1);
            avgSat = (avgSat / empData.length).toFixed(1);
        }
    }

    res.json({
      totalEmployees:  totalEmployees ?? 0,
      highRiskCount:   highRiskCount  ?? 0,
      totalTeams:      totalTeams ?? 0,
      activeProjects:  1, // dummy for now as requested
      tasksCompleted:  0, // dummy for now
      attendanceRate:  95.5, // placeholder
      latestEmployees: latestEmployees || [],
      latestTeams:     latestTeams || [],
      avgMoodToday:    avgMood || 0,
      avgBurnout:      avgBurnout || 0,
      avgSatisfaction: avgSat || 0,
      pulseCountToday: validMoods,
    });

  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil statistik dashboard' });
  }
});

// GET /api/dashboard/karyawan/:id
// Dipakai oleh DashboardKaryawan
router.get('/karyawan/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Attendance Rate (Total hadir bulan ini vs asumsi 20 hari kerja)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const { data: attendanceData, error: e1 } = await supabase
      .from('attendance')
      .select('date, clock_in_time, clock_out_time')
      .eq('employee_id', id)
      .like('date', `${currentMonth}%`);
    if (e1) throw e1;

    const daysPresent = attendanceData.length;
    const attendanceRate = Math.min(100, Math.round((daysPresent / 20) * 100)); // asumsi 20 hari

    // 2. Hours Worked (Akumulasi selisih clock_out dan clock_in)
    let totalMinutes = 0;
    attendanceData.forEach(att => {
      if (att.clock_in_time && att.clock_out_time) {
        const inTime = new Date(att.clock_in_time);
        const outTime = new Date(att.clock_out_time);
        const diffMins = (outTime - inTime) / (1000 * 60);
        if (diffMins > 0) totalMinutes += diffMins;
      }
    });
    const hoursWorked = Math.floor(totalMinutes / 60);

    // 3. Leave Balance (Default 12 - approved)
    const { data: leaves, error: e2 } = await supabase
      .from('leave_requests')
      .select('id, start_date, end_date')
      .eq('employee_id', id)
      .eq('status', 'Approved');
    if (e2) throw e2;

    let usedLeaves = 0;
    leaves.forEach(l => {
      const start = new Date(l.start_date);
      const end = new Date(l.end_date);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) usedLeaves += diffDays;
    });
    const leaveBalance = 12 - usedLeaves;

    // Return aggregated data
    res.json({
      attendanceRate,
      daysPresent,
      hoursWorked,
      leaveBalance,
      // Dummy for now (as requested by user)
      tasksDone: 0,
      activeProjects: 0,
      upcomingTasks: [],
      recentActivities: []
    });

  } catch (err) {
    console.error('Dashboard karyawan error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data dashboard karyawan' });
  }
});

module.exports = router;