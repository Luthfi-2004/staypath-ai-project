import { useState, useEffect } from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const moods = [
  { emoji: "😞", label: "Rough day",    value: 1, bg: "bg-red-50",     border: "border-red-200",    ring: "ring-red-300",    text: "text-red-500",    activeBg: "bg-red-100"    },
  { emoji: "😕", label: "Not great",    value: 2, bg: "bg-orange-50",  border: "border-orange-200", ring: "ring-orange-300", text: "text-orange-500", activeBg: "bg-orange-100" },
  { emoji: "😐", label: "It's okay",    value: 3, bg: "bg-amber-50",   border: "border-amber-200",  ring: "ring-amber-300",  text: "text-amber-500",  activeBg: "bg-amber-100"  },
  { emoji: "🙂", label: "Pretty good",  value: 4, bg: "bg-emerald-50", border: "border-emerald-200", ring: "ring-emerald-300", text: "text-emerald-500", activeBg: "bg-emerald-100" },
  { emoji: "😄", label: "Fantastic!",   value: 5, bg: "bg-blue-50",    border: "border-blue-200",   ring: "ring-blue-300",   text: "text-blue-500",   activeBg: "bg-blue-100"    },
];

const workloadLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Very Light",    color: "text-emerald-500" },
  2: { label: "Light",         color: "text-emerald-400" },
  3: { label: "Moderate",      color: "text-amber-500"   },
  4: { label: "Heavy",         color: "text-orange-500"  },
  5: { label: "Overwhelming",  color: "text-red-500"     },
};

const greeting = (() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat pagi";
  if (hour < 17) return "Selamat siang";
  return "Selamat malam";
})();

type Status = "idle" | "submitting" | "done" | "already_submitted" | "error";

export function DailyPulse() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [workload, setWorkload]         = useState(3);
  const [note, setNote]                 = useState("");
  const [status, setStatus]             = useState<Status>("idle");
  const [employeeStatus, setEmployeeStatus] = useState("");

  // Ambil data employee dari auth context/localStorage (disimpan saat login)
  const employeeId = parseInt(localStorage.getItem("employee_id") || "0");
  const employeeName = localStorage.getItem("employee_name") || "Karyawan";

  useEffect(() => {
    // 1. Ambil status bawaan dari localStorage (buat jaga-jaga kalau internet lelet)
    const storedStatus = localStorage.getItem("employee_status") || "Aktif";
    setEmployeeStatus(storedStatus);

    // 2. Langsung nanya ke server, status TERBARU gw sekarang apa?
    if (employeeId) {
      fetch(`${API_URL}/api/auth/me/${employeeId}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          // Kalau status di server beda, update layarnya!
          if (data.status) {
            setEmployeeStatus(data.status);
            // Update juga localStorage biar sinkron
            localStorage.setItem("employee_status", data.status);
          }
        })
        .catch(() => {
          console.warn("Gagal mengecek status terbaru ke server.");
        });
    }
  }, [employeeId]);

  const handleSubmit = async () => {
    if (selectedMood === null || !employeeId) return;
    setStatus("submitting");

    try {
      const res = await fetch(`${API_URL}/api/pulse`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id:    employeeId,
          mood_score:     selectedMood,
          workload_score: workload,
          note:           note.trim() || null,
        }),
      });

      if (res.status === 409) {
        setStatus("already_submitted");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("done");
    } catch (err) {
      console.error("Gagal submit pulse:", err);
      setStatus("error");
    }
  };

  const handleReset = () => {
    setSelectedMood(null);
    setWorkload(3);
    setNote("");
    setStatus("idle");
  };

  const workloadInfo = workloadLabels[workload];

  // ── Already submitted ──
  if (status === "already_submitted") {
    return (
      <div className="max-w-lg mx-auto py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h2 className="text-gray-800 font-semibold text-lg mb-2">Sudah check-in hari ini</h2>
        <p className="text-gray-400 text-sm">Kamu sudah mengisi Daily Pulse hari ini. Sampai jumpa besok!</p>
      </div>
    );
  }

  // ── Done ──
  if (status === "done") {
    const mood = moods.find((m) => m.value === selectedMood);
    return (
      <div className="max-w-lg mx-auto py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-gray-800 font-semibold text-lg mb-2">Check-in tersimpan!</h2>
        <p className="text-gray-400 text-sm mb-1">
          Mood kamu hari ini: <span className="font-medium text-gray-600">{mood?.emoji} {mood?.label}</span>
        </p>
        <p className="text-gray-400 text-sm mb-6">Beban kerja: <span className={`font-medium ${workloadInfo.color}`}>{workloadInfo.label}</span></p>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Isi ulang ↺
        </button>
      </div>
    );
  }

  // ── Error ──
  if (status === "error") {
    return (
      <div className="max-w-lg mx-auto py-10 text-center">
        <p className="text-red-500 text-sm mb-4">Gagal menyimpan check-in. Coba lagi.</p>
        <button onClick={handleReset} className="text-sm text-blue-600 font-medium">Coba lagi</button>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="max-w-lg mx-auto">
      
      {/* 🌟 BANNER NOTIFIKASI JADWAL 1-ON-1 🌟 */}
      {employeeStatus === 'Dijadwalkan' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-xl shadow-sm flex items-start animate-fade-in">
          <AlertCircle className="h-6 w-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-blue-800 font-semibold text-lg">Undangan Sesi 1-on-1</h3>
            <p className="text-blue-700 text-sm mt-1 leading-relaxed">
              Tim HRD ingin menjadwalkan sesi ngobrol santai dengan Anda berdasarkan hasil evaluasi rutin. Silakan cek email Anda untuk detail jadwal atau hubungi tim HRD.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-8 mb-4">

        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-400 text-sm mb-1">{greeting}, <span className="text-gray-600 font-medium">{employeeName}</span></p>
          <h1 className="text-gray-900 text-2xl font-semibold tracking-tight leading-tight">
            How are you feeling today?
          </h1>
          <p className="text-gray-400 text-sm mt-1.5">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Mood grid */}
        <section className="mb-8">
          <p className="text-sm text-gray-700 font-medium mb-3">Pilih mood kamu</p>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.value;
              return (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`
                    flex flex-col items-center gap-1.5 px-1 py-3.5 rounded-2xl border-2 transition-all duration-150
                    ${isSelected
                      ? `${mood.activeBg} ${mood.border} ring-2 ${mood.ring} scale-105 shadow-sm`
                      : `${mood.bg} ${mood.border} hover:scale-102 hover:shadow-sm opacity-70 hover:opacity-100`
                    }
                  `}
                >
                  <span className="text-2xl leading-none">{mood.emoji}</span>
                  <span className={`text-[10px] font-semibold leading-tight text-center ${mood.text}`}>
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="border-t border-gray-100 mb-8" />

        {/* Workload slider */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-700 font-medium">Beban Kerja</p>
            <span className={`text-sm font-semibold ${workloadInfo.color}`}>{workloadInfo.label}</span>
          </div>
          <input
            type="range" min={1} max={5} step={1} value={workload}
            onChange={(e) => setWorkload(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((workload - 1) / 4) * 100}%, #e2e8f0 ${((workload - 1) / 4) * 100}%, #e2e8f0 100%)`,
            }}
          />
          <div className="flex justify-between mt-2.5 px-0.5">
            {[1, 2, 3, 4, 5].map((v) => (
              <span key={v} className={`text-xs transition-colors ${v === workload ? "text-blue-600 font-semibold" : "text-gray-300"}`}>
                {v}
              </span>
            ))}
          </div>
        </section>

        <div className="border-t border-gray-100 mb-8" />

        {/* Note */}
        <section className="mb-8">
          <label className="block text-sm text-gray-700 font-medium mb-2.5">
            Ada yang ingin disampaikan?{" "}
            <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ceritakan sesuatu, keluhan, atau highlight hari ini…"
            rows={3}
            maxLength={300}
            className="w-full text-sm text-gray-700 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition leading-relaxed"
          />
          <p className="text-right text-xs text-gray-300 mt-1">{note.length}/300</p>
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={selectedMood === null || status === "submitting"}
          className={`
            w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200
            ${selectedMood !== null
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:scale-[0.98]"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }
          `}
        >
          {status === "submitting" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan…</>
          ) : (
            <>
              Submit Check-in
              {selectedMood !== null && (
                <span className="text-base">{moods.find((m) => m.value === selectedMood)?.emoji}</span>
              )}
            </>
          )}
        </button>

        {selectedMood === null && (
          <p className="text-center text-xs text-gray-400 mt-3">Pilih mood terlebih dahulu</p>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 px-4">
        Responsmu bersifat privat dan hanya terlihat oleh HR. Check-in ini membantu kami menjaga kesejahteraan kerjamu.
      </p>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #2563eb; border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(37,99,235,0.25); cursor: pointer; transition: transform 0.15s;
        }
        input[type='range']::-webkit-slider-thumb:hover { transform: scale(1.15); }
        input[type='range']::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #2563eb; border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(37,99,235,0.25); cursor: pointer;
        }
      `}</style>
    </div>
  );
}