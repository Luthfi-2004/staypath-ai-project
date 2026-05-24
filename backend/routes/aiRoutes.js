// backend/routes/aiRoutes.js  ← FILE BARU
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5002';

router.post('/predict/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Ambil data karyawan dari Supabase
    const { data: emp, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !emp) {
      return res.status(404).json({ error: 'Karyawan tidak ditemukan' });
    }

    // 2. Siapkan payload untuk Flask (mapping job_role dari role)
    const mlPayload = {
      job_role:                    emp.role,
      education_level:             emp.education_level   || 'Bachelor',
      country:                     emp.country           || 'Indonesia',
      industry:                    emp.industry          || 'Technology',
      company_size:                emp.company_size      || 'Mid-size',
      remote_work_type:            emp.remote_work_type  || 'Hybrid',
      primary_ai_tool:             emp.primary_ai_tool   || 'ChatGPT',
      ai_adoption_stage:           emp.ai_adoption_stage || 'Intermediate',
      fear_of_ai_replacement:      emp.fear_of_ai_replacement || 'Low',
      years_experience:            emp.years_experience  || 2.0,
      team_size:                   emp.team_size         || 10.0,
      salary_usd_k:                emp.salary_usd_k      || 50.0,
      ai_tools_used_per_day:       emp.ai_tools_used_per_day || 1.0,
      hours_with_ai_assistance_daily: emp.hours_with_ai_assistance_daily || 2.0,
      ai_replaces_my_tasks_pct:    emp.ai_replaces_my_tasks_pct || 15.0,
      weekly_ai_upskilling_hrs:    emp.weekly_ai_upskilling_hrs || 1.0,
      productivity_score:          emp.productivity_score || 7.5,
      burnout_score:               emp.burnout_score      || 3.0,
      job_satisfaction_1_5:        emp.job_satisfaction_1_5 || 3.0,
    };

    // 3. Panggil Flask AI service
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mlPayload),
      signal: AbortSignal.timeout(8000),
    });

    if (!aiResponse.ok) throw new Error('AI service error');
    const aiResult = await aiResponse.json();

    // 4. Simpan hasil prediksi ke Supabase
    const { error: updateError } = await supabase
      .from('employees')
      .update({
        attrition_risk:    aiResult.predicted_risk,
        risk_score:        aiResult.risk_score,
        last_predicted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw updateError;

    res.json({
      employee_id:    id,
      predicted_risk: aiResult.predicted_risk,
      risk_score:     aiResult.risk_score,
    });

  } catch (err) {
    console.error('AI predict error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Predict semua karyawan sekaligus (untuk tombol Refresh di halaman Predictions)
router.post('/predict-all', async (req, res) => {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*');

    if (error) throw error;

    const results = [];
    for (const emp of employees) {
      try {
        const mlPayload = {
          job_role: emp.role,
          education_level: emp.education_level || 'Bachelor',
          country: emp.country || 'Indonesia',
          industry: emp.industry || 'Technology',
          company_size: emp.company_size || 'Mid-size',
          remote_work_type: emp.remote_work_type || 'Hybrid',
          primary_ai_tool: emp.primary_ai_tool || 'ChatGPT',
          ai_adoption_stage: emp.ai_adoption_stage || 'Intermediate',
          fear_of_ai_replacement: emp.fear_of_ai_replacement || 'Low',
          years_experience: emp.years_experience || 2.0,
          team_size: emp.team_size || 10.0,
          salary_usd_k: emp.salary_usd_k || 50.0,
          ai_tools_used_per_day: emp.ai_tools_used_per_day || 1.0,
          hours_with_ai_assistance_daily: emp.hours_with_ai_assistance_daily || 2.0,
          ai_replaces_my_tasks_pct: emp.ai_replaces_my_tasks_pct || 15.0,
          weekly_ai_upskilling_hrs: emp.weekly_ai_upskilling_hrs || 1.0,
          productivity_score: emp.productivity_score || 7.5,
          burnout_score: emp.burnout_score || 3.0,
          job_satisfaction_1_5: emp.job_satisfaction_1_5 || 3.0,
        };

        const aiResponse = await fetch(`${AI_SERVICE_URL}/api/predict-risk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mlPayload),
          signal: AbortSignal.timeout(8000),
        });

        if (!aiResponse.ok) continue;
        const aiResult = await aiResponse.json();

        await supabase.from('employees').update({
          attrition_risk: aiResult.predicted_risk,
          risk_score: aiResult.risk_score,
          last_predicted_at: new Date().toISOString(),
        }).eq('id', emp.id);

        results.push({ id: emp.id, name: emp.name, ...aiResult });
      } catch {
        results.push({ id: emp.id, name: emp.name, error: 'predict failed' });
      }
    }

    res.json({ updated: results.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;