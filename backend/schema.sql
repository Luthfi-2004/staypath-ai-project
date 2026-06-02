-- ==============================================================================
-- Skema Database untuk StayPath AI (Supabase)
-- Cara Penggunaan: Salin seluruh kode ini dan jalankan di menu "SQL Editor" pada Supabase
-- ==============================================================================

-- Hapus tabel lama (jika ada) untuk reset ke skema baru dengan ID yang lebih simple
DROP TABLE IF EXISTS daily_pulse CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP SEQUENCE IF EXISTS emp_id_seq CASCADE;

-- Buat sequence (penghitung) untuk ID karyawan (EMP-001, EMP-002, dst)
CREATE SEQUENCE emp_id_seq START 1;

-- 1. Buat tabel teams
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT,
    expected_size NUMERIC(5,0) DEFAULT 0,
    lead_id TEXT, -- Will refer to employees(id) later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Buat tabel employees
CREATE TABLE employees (
    id TEXT PRIMARY KEY DEFAULT 'EMP-' || LPAD(nextval('emp_id_seq')::TEXT, 3, '0'),
    name TEXT NOT NULL,
    department TEXT,
    role TEXT,
    status TEXT DEFAULT 'Aktif',
    join_date DATE DEFAULT CURRENT_DATE,
    email TEXT,
    password TEXT,
    auth_role TEXT DEFAULT 'karyawan',
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,

    -- Data AI (Features)
    education_level TEXT,
    country TEXT,
    industry TEXT,
    company_size TEXT,
    remote_work_type TEXT,
    primary_ai_tool TEXT,
    ai_adoption_stage TEXT,
    fear_of_ai_replacement TEXT,
    productivity_score NUMERIC(5,2),
    burnout_score NUMERIC(5,2),
    years_experience NUMERIC(5,2),
    team_size NUMERIC(5,2),
    salary_usd_k NUMERIC(10,2),
    ai_tools_used_per_day NUMERIC(5,2),
    hours_with_ai_assistance_daily NUMERIC(5,2),
    ai_replaces_my_tasks_pct NUMERIC(5,2),
    weekly_ai_upskilling_hrs NUMERIC(5,2),
    job_satisfaction_1_5 NUMERIC(5,2),

    -- Hasil Prediksi AI
    attrition_risk TEXT,
    risk_score NUMERIC(5,4),
    last_predicted_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Buat tabel daily_pulse (tetap ada untuk kompatibilitas mundur jika diperlukan sementara)
CREATE TABLE daily_pulse (
    id SERIAL PRIMARY KEY,
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    mood_score NUMERIC(5,2) NOT NULL,
    workload_score NUMERIC(5,2),
    note TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Buat tabel attendance (Smart Attendance MVP)
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    clock_in_time TIMESTAMP WITH TIME ZONE,
    clock_out_time TIMESTAMP WITH TIME ZONE,
    mood_score NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Buat tabel leave_requests (Pengajuan Cuti MVP)
CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type TEXT NOT NULL, -- e.g., 'Tahunan', 'Sakit', 'Penting'
    reason TEXT,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Buat tabel projects (Persiapan - Belum diimplementasikan di App)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Active',
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Buat tabel tasks (Persiapan - Belum diimplementasikan di App)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assigned_to TEXT REFERENCES employees(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Todo', -- 'Todo', 'In Progress', 'Done'
    priority TEXT DEFAULT 'Medium',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Buat tabel activities (Persiapan - Belum diimplementasikan di App)
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    action_type TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Masukkan Data Dummy Tim
INSERT INTO teams (name, department, expected_size)
VALUES ('Team Development', 'Engineering', 10);

-- Masukkan Karyawan 1 (Admin HRD)
INSERT INTO employees (name, email, password, auth_role, role, department, team_id, education_level, country, industry, company_size, remote_work_type, primary_ai_tool, ai_adoption_stage, fear_of_ai_replacement, productivity_score, burnout_score, years_experience, team_size, salary_usd_k, ai_tools_used_per_day, hours_with_ai_assistance_daily, ai_replaces_my_tasks_pct, weekly_ai_upskilling_hrs, job_satisfaction_1_5, attrition_risk, risk_score)
VALUES ('Admin HRD', 'hrd@staypath.com', 'admin123', 'hrd', 'HR Manager', 'Human Resources', NULL, 'Master', 'Indonesia', 'Technology', 'M', 'Hybrid', 'ChatGPT', 'Advanced', 'Low', 8.5, 3.2, 8.0, 10, 45.0, 2, 1.5, 10, 2.0, 4.5, 'Low Risk', 0.1234);

-- Masukkan Karyawan 2 (Akbar Maulana - Data Scientist)
INSERT INTO employees (name, email, password, auth_role, role, department, team_id, education_level, country, industry, company_size, remote_work_type, primary_ai_tool, ai_adoption_stage, fear_of_ai_replacement, productivity_score, burnout_score, years_experience, team_size, salary_usd_k, ai_tools_used_per_day, hours_with_ai_assistance_daily, ai_replaces_my_tasks_pct, weekly_ai_upskilling_hrs, job_satisfaction_1_5, attrition_risk, risk_score)
VALUES ('Akbar Maulana', 'akbar@staypath.com', 'akbar123', 'karyawan', 'Data Scientist', 'Engineering', 1, 'Bachelor', 'Indonesia', 'Technology', 'M', 'Remote', 'Copilot', 'Advanced', 'Low', 9.2, 4.1, 4.0, 6, 60.0, 4, 5.0, 40, 5.0, 4.8, 'Low Risk', 0.1052);

-- Masukkan Karyawan 3 (Nurul Habibah Gea - Data Scientist)
INSERT INTO employees (name, email, password, auth_role, role, department, team_id, education_level, country, industry, company_size, remote_work_type, primary_ai_tool, ai_adoption_stage, fear_of_ai_replacement, productivity_score, burnout_score, years_experience, team_size, salary_usd_k, ai_tools_used_per_day, hours_with_ai_assistance_daily, ai_replaces_my_tasks_pct, weekly_ai_upskilling_hrs, job_satisfaction_1_5, attrition_risk, risk_score)
VALUES ('Nurul Habibah Gea', 'nurul@staypath.com', 'nurul123', 'karyawan', 'Data Scientist', 'Engineering', 1, 'Bachelor', 'Indonesia', 'Technology', 'M', 'Hybrid', 'ChatGPT', 'Intermediate', 'Medium', 8.1, 5.5, 3.5, 6, 58.0, 3, 3.0, 30, 3.5, 4.2, 'Medium Risk', 0.4510);

-- Masukkan Karyawan 4 (Rafah Fajri Juwaeni - AI Engineer)
INSERT INTO employees (name, email, password, auth_role, role, department, team_id, education_level, country, industry, company_size, remote_work_type, primary_ai_tool, ai_adoption_stage, fear_of_ai_replacement, productivity_score, burnout_score, years_experience, team_size, salary_usd_k, ai_tools_used_per_day, hours_with_ai_assistance_daily, ai_replaces_my_tasks_pct, weekly_ai_upskilling_hrs, job_satisfaction_1_5, attrition_risk, risk_score)
VALUES ('Rafah Fajri Juwaeni', 'rafah@staypath.com', 'rafah123', 'karyawan', 'AI Engineer', 'Engineering', 1, 'Bachelor', 'Indonesia', 'Technology', 'M', 'Remote', 'Claude', 'Advanced', 'Low', 9.5, 3.8, 5.0, 6, 65.0, 5, 6.0, 50, 6.0, 4.9, 'Low Risk', 0.0821);

-- Masukkan Karyawan 5 (Rifki Hidayat - AI Engineer)
INSERT INTO employees (name, email, password, auth_role, role, department, team_id, education_level, country, industry, company_size, remote_work_type, primary_ai_tool, ai_adoption_stage, fear_of_ai_replacement, productivity_score, burnout_score, years_experience, team_size, salary_usd_k, ai_tools_used_per_day, hours_with_ai_assistance_daily, ai_replaces_my_tasks_pct, weekly_ai_upskilling_hrs, job_satisfaction_1_5, attrition_risk, risk_score)
VALUES ('Rifki Hidayat', 'rifki@staypath.com', 'rifki123', 'karyawan', 'AI Engineer', 'Engineering', 1, 'Bachelor', 'Indonesia', 'Technology', 'M', 'Hybrid', 'Copilot', 'Advanced', 'Low', 8.8, 6.1, 4.5, 6, 62.0, 4, 4.5, 45, 4.0, 3.9, 'Medium Risk', 0.5123);

-- Masukkan Karyawan 6 (Luthfi Rafananda Naufal - Full-Stack)
INSERT INTO employees (name, email, password, auth_role, role, department, team_id, education_level, country, industry, company_size, remote_work_type, primary_ai_tool, ai_adoption_stage, fear_of_ai_replacement, productivity_score, burnout_score, years_experience, team_size, salary_usd_k, ai_tools_used_per_day, hours_with_ai_assistance_daily, ai_replaces_my_tasks_pct, weekly_ai_upskilling_hrs, job_satisfaction_1_5, attrition_risk, risk_score)
VALUES ('Luthfi Rafananda Naufal', 'luthfi@staypath.com', 'luthfi123', 'karyawan', 'Full-Stack Web Developer', 'Engineering', 1, 'Bachelor', 'Indonesia', 'Technology', 'M', 'On-site', 'ChatGPT', 'Beginner', 'High', 7.5, 7.8, 2.5, 6, 48.0, 1, 1.0, 10, 1.0, 3.2, 'High Risk', 0.8432);

-- Masukkan Karyawan 7 (Samuel Richard Gunawan - Full-Stack)
INSERT INTO employees (name, email, password, auth_role, role, department, team_id, education_level, country, industry, company_size, remote_work_type, primary_ai_tool, ai_adoption_stage, fear_of_ai_replacement, productivity_score, burnout_score, years_experience, team_size, salary_usd_k, ai_tools_used_per_day, hours_with_ai_assistance_daily, ai_replaces_my_tasks_pct, weekly_ai_upskilling_hrs, job_satisfaction_1_5, attrition_risk, risk_score)
VALUES ('Samuel Richard Gunawan', 'samuel@staypath.com', 'samuel123', 'karyawan', 'Full-Stack Web Developer', 'Engineering', 1, 'Bachelor', 'Indonesia', 'Technology', 'M', 'Remote', 'Gemini', 'Intermediate', 'Medium', 8.4, 4.5, 3.0, 6, 52.0, 3, 2.5, 20, 2.5, 4.5, 'Low Risk', 0.2314);

-- 9. Update Lead ID untuk tim
UPDATE teams SET lead_id = 'EMP-002' WHERE id = 1;
