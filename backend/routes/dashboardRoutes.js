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

    // 3. Rata-rata mood dari daily_pulse hari ini
    const today = new Date().toISOString().split('T')[0];
    const { data: pulseToday, error: e3 } = await supabase
      .from('daily_pulse')
      .select('mood_score')
      .gte('submitted_at', `${today}T00:00:00`)
      .lte('submitted_at', `${today}T23:59:59`);
    if (e3) throw e3;

    const avgMood = pulseToday && pulseToday.length > 0
      ? (pulseToday.reduce((sum, p) => sum + p.mood_score, 0) / pulseToday.length).toFixed(1)
      : null;

    // 4. Rata-rata burnout dan job_satisfaction dari semua karyawan
    const { data: metrics, error: e4 } = await supabase
      .from('employees')
      .select('burnout_score, job_satisfaction_1_5, attrition_risk');
    if (e4) throw e4;

    const avgBurnout = metrics.length > 0
      ? (metrics.reduce((s, e) => s + (e.burnout_score || 0), 0) / metrics.length).toFixed(1)
      : null;

    const avgSatisfaction = metrics.length > 0
      ? (metrics.reduce((s, e) => s + (e.job_satisfaction_1_5 || 0), 0) / metrics.length).toFixed(1)
      : null;

    res.json({
      totalEmployees:  totalEmployees ?? 0,
      highRiskCount:   highRiskCount  ?? 0,
      avgMoodToday:    avgMood        ? parseFloat(avgMood)        : null,
      avgBurnout:      avgBurnout     ? parseFloat(avgBurnout)     : null,
      avgSatisfaction: avgSatisfaction? parseFloat(avgSatisfaction): null,
      pulseCountToday: pulseToday?.length ?? 0,
    });

  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil statistik dashboard' });
  }
});

module.exports = router;