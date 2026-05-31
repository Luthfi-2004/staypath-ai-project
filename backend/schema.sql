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
VALUES ('Team Development', 'IT', 5);

-- 7. (Opsional) Masukkan 1 Data Dummy Karyawan (HRD) untuk bisa Login
INSERT INTO employees (name, email, password, auth_role, role, department, team_id)
VALUES ('Admin HRD', 'hrd@staypath.com', 'admin123', 'hrd', 'HR Manager', 'Human Resources', NULL);

-- 8. (Opsional) Masukkan Karyawan Dummy (Karyawan) di Team Development
INSERT INTO employees (name, email, password, auth_role, role, department, team_id)
VALUES ('Akbar Maulana', 'akbar@staypath.com', 'akbar123', 'karyawan', 'Frontend Developer', 'IT', 1);

-- 9. Update Lead ID untuk tim
UPDATE teams SET lead_id = 'EMP-002' WHERE id = 1;
