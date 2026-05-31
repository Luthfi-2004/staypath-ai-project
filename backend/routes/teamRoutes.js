const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET all teams
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('teams').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// GET /api/teams/overview (HR Overview)
router.get('/overview', async (req, res) => {
  try {
    // 1. Total teams
    const { count: totalTeams, error: e1 } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true });
    if (e1) throw e1;

    // 2. Total employees
    const { count: totalEmployees, error: e2 } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    if (e2) throw e2;

    // 3. Teams with member counts
    const { data: teamsData, error: e3 } = await supabase
      .from('teams')
      .select('id, name, department, expected_size, created_at');
    if (e3) throw e3;

    // Get employees per team to count actual members
    const { data: employeesData, error: e4 } = await supabase
      .from('employees')
      .select('id, team_id');
    if (e4) throw e4;

    const teamCounts = {};
    employeesData.forEach(emp => {
      if (emp.team_id) {
        teamCounts[emp.team_id] = (teamCounts[emp.team_id] || 0) + 1;
      }
    });

    const teams = teamsData.map(t => ({
      ...t,
      membersCount: teamCounts[t.id] || 0,
      openRoles: Math.max(0, t.expected_size - (teamCounts[t.id] || 0)),
      projects: 2, // Dummy
      budget: 85, // Dummy %
      performance: 92, // Dummy
      attendance: 96, // Dummy
      managerName: "Unassigned"
    }));

    res.json({
      totalTeams: totalTeams || 0,
      totalEmployees: totalEmployees || 0,
      openRoles: teams.reduce((acc, t) => acc + t.openRoles, 0),
      activeProjects: teams.length * 2, // Dummy
      teams: teams
    });
  } catch (err) {
    console.error('Error fetching teams overview:', err);
    res.status(500).json({ error: 'Gagal memuat overview tim' });
  }
});

// GET team by ID and its members
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();
    if (teamError) throw teamError;
    
    // fetch members
    const { data: members, error: membersError } = await supabase
      .from('employees')
      .select('*')
      .eq('team_id', id);
    if (membersError) throw membersError;

    // attach members to team
    team.members = members;
    res.json(team);
  } catch (error) {
    console.error('Error fetching team detail:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// POST create team (Opsional for HRD)
router.post('/', async (req, res) => {
  try {
    const { name, department, expected_size, lead_id } = req.body;
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name, department, expected_size, lead_id }])
      .select();
    if (error) throw error;
    res.status(201).json({ message: 'Team berhasil dibuat', team: data[0] });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

module.exports = router;
