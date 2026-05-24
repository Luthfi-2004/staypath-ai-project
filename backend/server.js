const express = require('express');
const cors    = require('cors');
require('dotenv').config();

// ── Routes ─────────────────────────────────────────────────────────────────────
const employeeRoutes  = require('./routes/employeeRoutes');
const pulseRoutes     = require('./routes/pulseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
// const aiRoutes     = require('./routes/aiRoutes');  // aktifkan setelah AI siap

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
// ── Register routes ────────────────────────────────────────────────────────────
app.use('/api/employees',  employeeRoutes);
app.use('/api/pulse',      pulseRoutes);
app.use('/api/dashboard',  dashboardRoutes);
// app.use('/api/ai',      aiRoutes);

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});