# StayPath AI - Smart HRIS & Employee Attrition Predictor

## Deskripsi Singkat Proyek
StayPath AI adalah sistem Human Resources Information System (HRIS) modern yang dilengkapi dengan fitur analitik prediktif berbasis Kecerdasan Buatan (Machine Learning). Proyek ini dikembangkan untuk menjadi "early warning system" bagi tim HRD dalam mendeteksi risiko *resign* (*attrition risk*) pada karyawan akibat kelelahan kerja (*burnout*) dan tantangan adaptasi terhadap alat AI (*AI tools*). Aplikasi ini mengintegrasikan fungsi HR harian seperti absensi (*Smart Attendance*) dan pengajuan cuti secara langsung dengan model prediksi risiko.

## Petunjuk Setup Environment
Pastikan Anda telah menginstal Node.js (untuk Frontend & Backend) dan Python (untuk AI Service) di komputer Anda.

**1. Setup Backend (Node.js & Supabase):**
- Buka terminal, masuk ke folder `backend`.
- Salin `backend/.env.example` menjadi `backend/.env` dan isi kredensial `SUPABASE_URL` dan `SUPABASE_KEY` dari project Supabase Anda.
- Jalankan perintah:
  ```bash
  npm install
  ```

**2. Setup Frontend (React/Vite):**
- Buka terminal baru, masuk ke folder `frontend`.
- Salin `frontend/.env.example` menjadi `frontend/.env` dan pastikan `VITE_API_URL` terisi (misal `http://localhost:5001`).
- Jalankan perintah:
  ```bash
  npm install
  ```

**3. Setup AI Service (Python/Flask):**
- Buka terminal baru, masuk ke folder `ai-service`.
- Buat virtual environment dan aktifkan:
  ```bash
  python -m venv venv
  # Untuk Windows: venv\Scripts\activate
  # Untuk Mac/Linux: source venv/bin/activate
  ```
- Instal *dependencies*:
  ```bash
  pip install -r requirements.txt
  ```

## Tautan Model ML
Model Machine Learning untuk prediksi *attrition risk* disimpan dalam format `.keras`. Anda dapat mengunduh model tersebut melalui tautan Google Drive berikut:

🔗 **[https://drive.google.com/file/d/1DPQagKqQBTAOE9Xb2CzKbR6xs2ccik6j/view?usp=sharing]**


## Cara Menjalankan Aplikasi

Aplikasi berjalan di 3 servis berbeda yang harus diaktifkan secara bersamaan:

**1. Menjalankan AI Service (Flask):**
- Buka terminal, masuk ke direktori `ai-service`.
- Pastikan virtual environment aktif.
- Jalankan aplikasi:
  ```bash
  python app.py
  # atau flask run
  ```
- API Model ML akan berjalan (biasanya di `http://localhost:5000` atau port yang ditentukan).

**2. Menjalankan Backend Server:**
- Buka terminal, masuk ke direktori `backend`.
- Jalankan server:
  ```bash
  npm run dev
  # atau node server.js
  ```
- Backend Node.js akan berjalan melayani request database.

**3. Menjalankan Frontend (Web App):**
- Buka terminal, masuk ke direktori `frontend`.
- Jalankan web server Vite:
  ```bash
  npm run dev
  ```
- Buka browser dan akses URL lokal yang diberikan Vite (biasanya `http://localhost:5173`). Anda sudah bisa menggunakan aplikasi StayPath AI!
