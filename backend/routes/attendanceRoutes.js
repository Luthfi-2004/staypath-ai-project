const express = require('express');
const router = express.Router();
const { clockIn, clockOut, getAttendanceHistory } = require('../controllers/attendanceController');

router.post('/clock-in', clockIn);
router.put('/clock-out', clockOut);
router.get('/history/:employee_id', getAttendanceHistory);

// GET /api/attendance/hr-overview
router.get('/hr-overview', async (req, res) => {
  const supabase = require('../config/supabase');
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Total employees
    const { count: totalEmployees, error: e1 } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    // Present today
    const { data: todaysData, error: e2 } = await supabase
      .from('attendance')
      .select('employee_id, clock_in_time, clock_out_time, employees(name, role, department)')
      .eq('date', today);
      
    // Leave today
    const { data: leaves, error: e3 } = await supabase
      .from('leave_requests')
      .select('employee_id, status')
      .lte('start_date', today)
      .gte('end_date', today)
      .eq('status', 'Approved');

    // Latest Leave Requests
    const { data: pendingLeaves, error: e4 } = await supabase
      .from('leave_requests')
      .select('id, start_date, end_date, leave_type, reason, status, employees(name, department, avatar:name)')
      .order('created_at', { ascending: false })
      .limit(5);

    const presentCount = todaysData ? todaysData.length : 0;
    const leaveCount = leaves ? leaves.length : 0;
    const absentCount = Math.max(0, (totalEmployees || 0) - presentCount - leaveCount);
    const attendanceRate = totalEmployees ? Math.round(((presentCount + leaveCount) / totalEmployees) * 100) : 0;

    res.json({
      totalEmployees: totalEmployees || 0,
      presentToday: presentCount,
      absentToday: absentCount,
      onLeave: leaveCount,
      lateArrivals: 2, // Dummy
      remoteWorkers: 15, // Dummy
      pendingRequests: pendingLeaves ? pendingLeaves.filter(l => l.status === 'Pending').length : 0,
      attendanceRate: attendanceRate,
      todaysAttendance: todaysData || [],
      latestLeaveRequests: pendingLeaves || []
    });
  } catch (err) {
    console.error('HR Attendance Overview Error:', err);
    res.status(500).json({ error: 'Gagal mengambil overview attendance HR' });
  }
});

module.exports = router;
