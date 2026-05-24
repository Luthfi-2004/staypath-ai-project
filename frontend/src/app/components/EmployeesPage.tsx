import { useState, useRef, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, X, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "Aktif" | "Cuti" | "Nonaktif" | string;

interface EmployeeRecord {
  id: number;
  employeeId: string;
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  status: Status;
  joinDate: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES: Status[] = ["Aktif", "Cuti", "Nonaktif"];

// Tambahkan array DEPARTMENTS ini:
const DEPARTMENTS = [
  "Engineering", 
  "Human Resources", 
  "Finance", 
  "Marketing", 
  "Sales", 
  "Operations"
];
// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusStyle: Record<string, string> = {
  Aktif:    "bg-emerald-50 text-emerald-600 border border-emerald-100",
  Cuti:     "bg-amber-50 text-amber-600 border border-amber-100",
  Nonaktif: "bg-gray-100 text-gray-400 border border-gray-200",
};

const statusDot: Record<string, string> = {
  Aktif:    "bg-emerald-500",
  Cuti:     "bg-amber-400",
  Nonaktif: "bg-gray-400",
};

function StatusBadge({ status }: { status: Status }) {
  const style = statusStyle[status] ?? statusStyle["Nonaktif"];
  const dot   = statusDot[status]   ?? statusDot["Nonaktif"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const avatarColors = [
  "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-600", "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700", "bg-cyan-100 text-cyan-700",
];

function Avatar({ name, index }: { name: string; index: number }) {
  const color = avatarColors[index % avatarColors.length];
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${color}`}>
      {getInitials(name)}
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const emptyForm = {
  name: "", department: DEPARTMENTS[0], role: "",
  email: "", phone: "", status: "Aktif" as Status, joinDate: "",
};

type FormState  = typeof emptyForm;
type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!f.name.trim()) errors.name = "Nama wajib diisi.";
  if (!f.role.trim()) errors.role = "Role wajib diisi.";
  if (!f.email.trim()) {
    errors.email = "Email wajib diisi.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    errors.email = "Format email tidak valid.";
  }
  if (!f.joinDate) errors.joinDate = "Tanggal bergabung wajib diisi.";
  return errors;
}

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition text-gray-700 bg-white ${
    err
      ? "border-red-300 focus:ring-red-100 focus:border-red-400"
      : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
  }`;

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode; }) {
  const backdropRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-[2px] px-4"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-gray-900 font-semibold text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Employee form ────────────────────────────────────────────────────────────

function EmployeeForm({
  initial, employeeId, onSave, onClose, mode,
}: {
  initial: FormState; employeeId?: string;
  onSave: (data: FormState) => void; onClose: () => void; mode: "add" | "edit";
}) {
  const [form, setForm]     = useState<FormState>(initial);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        {employeeId && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Employee ID</label>
            <input
              type="text" value={employeeId} readOnly
              className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
        )}
        <Field label="Nama Lengkap" required error={errors.name}>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Jane Doe" className={inputCls(errors.name)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" required error={errors.email}>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@company.com" className={inputCls(errors.email)} />
          </Field>
          <Field label="No. Telepon" error={errors.phone}>
            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+62 812-0000-0000" className={inputCls(errors.phone)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Departemen" required>
            <select value={form.department} onChange={(e) => set("department", e.target.value)} className={inputCls()}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Role / Jabatan" required error={errors.role}>
            <input type="text" value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Senior Engineer" className={inputCls(errors.role)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status" required>
            <select value={form.status} onChange={(e) => set("status", e.target.value as Status)} className={inputCls()}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Tanggal Bergabung" required error={errors.joinDate}>
            <input type="date" value={form.joinDate} onChange={(e) => set("joinDate", e.target.value)} className={inputCls(errors.joinDate)} />
          </Field>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">
          Batal
        </button>
        <button type="submit" className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
          {mode === "add" ? "Tambah Karyawan" : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}

// ─── Delete confirmation ──────────────────────────────────────────────────────

function DeleteDialog({
  employee, onConfirm, onClose,
}: {
  employee: EmployeeRecord; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Modal title="Hapus Karyawan" onClose={onClose}>
      <div className="px-6 py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <p className="text-gray-800 font-medium mb-1">Hapus {employee.name}?</p>
        <p className="text-gray-400 text-sm">
          Data <span className="text-gray-600 font-medium">{employee.name}</span> ({employee.employeeId}) akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">
          Batal
        </button>
        <button onClick={onConfirm} className="px-5 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm">
          Ya, Hapus
        </button>
      </div>
    </Modal>
  );
}

// ─── Sort helper ──────────────────────────────────────────────────────────────

type SortKey = "employeeId" | "name" | "department" | "role" | "status";
type SortDir = "asc" | "desc";

function sortRecords(rows: EmployeeRecord[], key: SortKey, dir: SortDir) {
  return [...rows].sort((a, b) => {
    const av = String(a[key]).toLowerCase();
    const bv = String(b[key]).toLowerCase();
    return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; employee: EmployeeRecord }
  | { type: "delete"; employee: EmployeeRecord };

export function EmployeesPage() {
  const [records, setRecords]   = useState<EmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [modal, setModal]       = useState<ModalState>({ type: "none" });
  const [sortKey, setSortKey]   = useState<SortKey>("employeeId");
  const [sortDir, setSortDir]   = useState<SortDir>("asc");
  const [toast, setToast]       = useState<string | null>(null);

  // ── Load data dari backend saat halaman dibuka ──
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res  = await fetch(`${API_URL}/api/employees`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const mapped: EmployeeRecord[] = data.map((emp: any) => ({
          id:         emp.id,
          employeeId: `EMP-${String(emp.id).padStart(3, "0")}`,
          name:       emp.name,
          department: emp.department,
          role:       emp.role,
          status:     emp.status ?? "Aktif",
          // email & phone tidak ada di DB — generate sementara
          email:    `${emp.name.split(" ")[0].toLowerCase()}@company.com`,
          phone:    "+62 800-0000-0000",
          joinDate: emp.join_date
  ?? (emp.created_at
    ? emp.created_at.split("T")[0]
    : new Date().toISOString().split("T")[0]),
        }));

        setRecords(mapped);
      } catch (err) {
        console.error("Gagal fetch karyawan:", err);
        showToast("Gagal mengambil data dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = sortRecords(
    records.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        e.name.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || e.status === statusFilter;
      return matchSearch && matchStatus;
    }),
    sortKey,
    sortDir,
  );

  // ── CRUD handlers ──

  const handleAdd = async (data: FormState) => {
    try {
      const res = await fetch(`${API_URL}/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:       data.name,
          department: data.department,
          role:       data.role,
          status:     data.status,
          join_date:  data.joinDate || new Date().toISOString().split("T")[0],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newEmp = await res.json();

      const formatted: EmployeeRecord = {
        id:         newEmp.id,
        employeeId: `EMP-${String(newEmp.id).padStart(3, "0")}`,
        name:       newEmp.name,
        department: newEmp.department,
        role:       newEmp.role,
        status:     newEmp.status ?? "Aktif",
        email:      `${newEmp.name.split(" ")[0].toLowerCase()}@company.com`,
        phone:      "+62 800-0000-0000",
        joinDate:
  newEmp.join_date ??
  (newEmp.created_at
    ? newEmp.created_at.split("T")[0]
    : new Date().toISOString().split("T")[0]),
      };

      setRecords((r) => [formatted, ...r]);
      setModal({ type: "none" });
      showToast(`${data.name} berhasil ditambahkan.`);
    } catch (err) {
      console.error(err);
      showToast("Gagal menambahkan karyawan.");
    }
  };

  const handleEdit = async (data: FormState) => {
    if (modal.type !== "edit") return;
    const { id } = modal.employee;

    try {
      const res = await fetch(`${API_URL}/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:       data.name,
          department: data.department,
          role:       data.role,
          status:     data.status,
          join_date:  data.joinDate || new Date().toISOString().split("T")[0],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();

      setRecords((r) =>
        r.map((e) =>
          e.id === id
            ? {
                ...e,
                name:       updated.name,
                department: updated.department,
                role:       updated.role,
                status:     updated.status ?? "Aktif",
                email:      `${updated.name.split(" ")[0].toLowerCase()}@company.com`,
                joinDate:
  updated.join_date ??
  e.joinDate,
              }
            : e,
        ),
      );
      setModal({ type: "none" });
      showToast(`Data ${data.name} berhasil diperbarui.`);
    } catch (err) {
      console.error(err);
      showToast("Gagal memperbarui data.");
    }
  };

  const handleDelete = async () => {
    if (modal.type !== "delete") return;
    const { id, name } = modal.employee;

    try {
      const res = await fetch(`${API_URL}/api/employees/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setRecords((r) => r.filter((e) => e.id !== id));
      setModal({ type: "none" });
      showToast(`${name} telah dihapus.`);
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus karyawan.");
    }
  };

  // ── UI helpers ──

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp   size={10} className={sortKey === col && sortDir === "asc"  ? "opacity-100 text-blue-600" : ""} />
      <ChevronDown size={10} className={sortKey === col && sortDir === "desc" ? "opacity-100 text-blue-600" : ""} style={{ marginTop: -3 }} />
    </span>
  );

  const thCls = "px-5 py-3.5 text-left text-xs text-gray-400 uppercase tracking-wider font-medium select-none";

  const totalAktif = records.filter((r) => r.status === "Aktif").length;

  // ── Render ──

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-gray-900 font-semibold text-lg">Employees</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {records.length} total · {totalAktif} aktif
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "add" })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} /> Tambah Karyawan
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, ID, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white text-gray-700 placeholder-gray-400 transition"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["All", "Aktif", "Cuti", "Nonaktif"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors duration-150 whitespace-nowrap ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {s === "All" ? "Semua" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-gray-100 bg-gray-50/60">
              <tr>
                <th className={`${thCls} cursor-pointer hover:text-gray-600`} onClick={() => handleSort("employeeId")}>ID Karyawan <SortIcon col="employeeId" /></th>
                <th className={`${thCls} cursor-pointer hover:text-gray-600`} onClick={() => handleSort("name")}>Nama <SortIcon col="name" /></th>
                <th className={`${thCls} cursor-pointer hover:text-gray-600`} onClick={() => handleSort("department")}>Departemen <SortIcon col="department" /></th>
                <th className={`${thCls} cursor-pointer hover:text-gray-600`} onClick={() => handleSort("role")}>Role <SortIcon col="role" /></th>
                <th className={`${thCls} cursor-pointer hover:text-gray-600`} onClick={() => handleSort("status")}>Status <SortIcon col="status" /></th>
                <th className={`${thCls} text-right`}>Aksi</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={6} className="text-center py-14 text-gray-400 text-sm">
                    Memuat data dari database…
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-50">
                {filtered.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors duration-100">
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                        {emp.employeeId}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} index={idx} />
                        <div>
                          <p className="text-sm text-gray-800 font-medium leading-tight">{emp.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{emp.department}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{emp.role}</td>
                    <td className="px-5 py-4"><StatusBadge status={emp.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModal({ type: "edit", employee: emp })}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setModal({ type: "delete", employee: emp })}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Tidak ada karyawan ditemukan</p>
            <p className="text-gray-400 text-xs mt-1">Coba ubah kata kunci atau filter status.</p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Menampilkan {filtered.length} dari {records.length} karyawan
            </p>
            <p className="text-xs text-gray-400">
              Diurutkan: <span className="text-gray-500 font-medium">{sortKey}</span> ({sortDir})
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal.type === "add" && (
        <Modal title="Tambah Karyawan Baru" onClose={() => setModal({ type: "none" })}>
          <EmployeeForm
            mode="add"
            initial={emptyForm}
            onSave={handleAdd}
            onClose={() => setModal({ type: "none" })}
          />
        </Modal>
      )}

      {modal.type === "edit" && (
        <Modal title="Edit Karyawan" onClose={() => setModal({ type: "none" })}>
          <EmployeeForm
            mode="edit"
            employeeId={modal.employee.employeeId}
            initial={{
              name:       modal.employee.name,
              department: modal.employee.department,
              role:       modal.employee.role,
              email:      modal.employee.email,
              phone:      modal.employee.phone,
              status:     modal.employee.status,
              joinDate:   modal.employee.joinDate,
            }}
            onSave={handleEdit}
            onClose={() => setModal({ type: "none" })}
          />
        </Modal>
      )}

      {modal.type === "delete" && (
        <DeleteDialog
          employee={modal.employee}
          onConfirm={handleDelete}
          onClose={() => setModal({ type: "none" })}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-4 h-4 rounded-full bg-emerald-400 flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}