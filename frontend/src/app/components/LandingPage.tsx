import { Link } from "react-router";
import {
  Zap,
  BrainCircuit,
  Activity,
  BarChart3,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Shield,
  TrendingDown,
  Users,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Machine Learning Predictions",
    desc: "Our gradient boosting model analyzes engagement signals, mood data, and tenure patterns to surface resignation risk before it becomes a problem.",
    accent: "bg-blue-50 text-blue-600",
    border: "hover:border-blue-200",
  },
  {
    icon: Activity,
    title: "Daily Employee Pulse",
    desc: "A lightweight daily check-in captures mood, workload, and wellbeing in seconds — giving HR teams a real-time pulse across the entire workforce.",
    accent: "bg-emerald-50 text-emerald-600",
    border: "hover:border-emerald-200",
  },
  {
    icon: BarChart3,
    title: "HR Analytics Dashboard",
    desc: "Unified KPIs, trend charts, and high-risk employee tables — all in one clean dashboard designed for HR managers who need clarity fast.",
    accent: "bg-violet-50 text-violet-600",
    border: "hover:border-violet-200",
  },
];

const STATS = [
  { value: "87%", label: "Prediction accuracy" },
  { value: "3×", label: "Faster HR response time" },
  { value: "40%", label: "Reduction in attrition" },
  { value: "2 min", label: "Average daily check-in" },
];

const TRUST_ITEMS = [
  "No credit card required",
  "GDPR compliant",
  "SOC 2 Type II certified",
  "14-day free trial",
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* NAVBAR                                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-[#0f1f3d]" style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
              StayPath <span className="text-[#2563eb]">AI</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Solutions"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-gray-500 hover:text-[#0f1f3d] transition-colors"
                style={{ fontSize: "0.9rem", fontWeight: 500 }}
              >
                {link}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 bg-[#2563eb] text-white px-5 py-2.5 rounded-xl hover:bg-[#1d4ed8] transition-colors"
            style={{ fontSize: "0.875rem", fontWeight: 600 }}
          >
            Login to Dashboard
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HERO                                                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="pt-24 pb-20 px-6 text-center bg-white">
        <div className="max-w-3xl mx-auto">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-[#2563eb] px-4 py-1.5 rounded-full mb-8"
               style={{ fontSize: "0.78rem", fontWeight: 600 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse" />
            AI-Powered HR Intelligence Platform
          </div>

          {/* Headline */}
          <h1
            className="text-[#0f1f3d] mb-6"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            Predict and Prevent
            <br />
            <span className="text-[#2563eb]">Employee Turnover</span> with AI
          </h1>

          {/* Sub-headline */}
          <p
            className="text-gray-500 mb-10 max-w-xl mx-auto"
            style={{ fontSize: "1.1rem", lineHeight: 1.7, fontWeight: 400 }}
          >
            StayPath AI monitors daily employee wellbeing, surfaces resignation risk early,
            and gives HR teams the clarity they need to act before it's too late.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-[#2563eb] text-white px-7 py-3.5 rounded-xl hover:bg-[#1d4ed8] transition-colors w-full sm:w-auto justify-center"
              style={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 bg-white text-[#0f1f3d] border border-gray-200 px-7 py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors w-full sm:w-auto justify-center"
              style={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              Learn More
            </a>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {TRUST_ITEMS.map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-gray-400" style={{ fontSize: "0.8rem" }}>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Hero visual — Dashboard preview mockup */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl overflow-hidden shadow-xl shadow-gray-100">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 bg-white border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-gray-100 rounded-md px-10 py-1 text-gray-400" style={{ fontSize: "0.72rem" }}>
                  app.staypath.ai/dashboard
                </div>
              </div>
            </div>

            {/* Fake dashboard body */}
            <div className="flex" style={{ minHeight: "260px" }}>
              {/* Fake sidebar */}
              <div className="w-44 bg-[#0f1f3d] shrink-0 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-[#2563eb] flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" fill="white" />
                  </div>
                  <span className="text-white" style={{ fontSize: "0.72rem", fontWeight: 700 }}>StayPath AI</span>
                </div>
                {["Dashboard", "Daily Pulse", "Employees", "Predictions", "Settings"].map((item, i) => (
                  <div
                    key={item}
                    className={`px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${i === 0 ? "bg-[#2563eb]" : ""}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-[#64748b]"}`} />
                    <span className={i === 0 ? "text-white" : "text-[#64748b]"} style={{ fontSize: "0.7rem" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fake content area */}
              <div className="flex-1 p-5 bg-[#f0f4fb]">
                {/* KPI cards row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Total Employees", val: "142", color: "text-[#2563eb]", bg: "bg-blue-50" },
                    { label: "High Risk",        val: "12",  color: "text-red-500",    bg: "bg-red-50"  },
                    { label: "Avg Mood",         val: "3.7", color: "text-emerald-600",bg: "bg-emerald-50" },
                  ].map(({ label, val, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl p-3`}>
                      <div className={`${color}`} style={{ fontSize: "1.1rem", fontWeight: 800 }}>{val}</div>
                      <div className="text-gray-500" style={{ fontSize: "0.62rem" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Fake chart area */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-[#0f1f3d] mb-3" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                    Resignation Trend — Last 6 Months
                  </div>
                  <div className="flex items-end gap-2 h-16">
                    {[40, 55, 38, 62, 48, 72, 58, 80, 65, 88, 70, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: i >= 9 ? "#2563eb" : "#bfdbfe",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* STATS STRIP                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-[#0f1f3d]" style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {value}
                </div>
                <div className="text-gray-500 mt-1" style={{ fontSize: "0.85rem" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FEATURES                                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-[#2563eb] mb-3" style={{ fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Platform Features
            </p>
            <h2
              className="text-[#0f1f3d] mb-4"
              style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              Everything HR needs to retain talent
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto" style={{ fontSize: "1rem", lineHeight: 1.7 }}>
              Three powerful modules — built to work together — giving your HR team a complete retention toolkit.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="features">
            {FEATURES.map(({ icon: Icon, title, desc, accent, border }) => (
              <div
                key={title}
                className={`bg-white border border-gray-100 rounded-2xl p-7 flex flex-col gap-5 transition-all hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-0.5 ${border}`}
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text */}
                <div>
                  <h3
                    className="text-[#0f1f3d] mb-2"
                    style={{ fontSize: "1rem", fontWeight: 700 }}
                  >
                    {title}
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>
                    {desc}
                  </p>
                </div>

                {/* Learn more link */}
                <div className="mt-auto pt-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1 text-[#2563eb] hover:gap-2 transition-all"
                    style={{ fontSize: "0.82rem", fontWeight: 600 }}
                  >
                    Explore feature <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SOLUTIONS / WHY US                                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="solutions" className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left copy */}
            <div>
              <p className="text-[#2563eb] mb-3" style={{ fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Why StayPath AI
              </p>
              <h2
                className="text-[#0f1f3d] mb-5"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.3 }}
              >
                Stop reacting to resignations.
                <br />
                Start preventing them.
              </h2>
              <p className="text-gray-500 mb-8" style={{ fontSize: "0.95rem", lineHeight: 1.75 }}>
                Most HR teams find out about disengaged employees after the damage is done.
                StayPath AI shifts that dynamic — giving you a 30 to 60-day early warning window
                to intervene, engage, and retain the people who matter most.
              </p>

              {[
                { icon: BrainCircuit, title: "Proactive, not reactive", desc: "AI flags at-risk employees weeks before they consider leaving." },
                { icon: TrendingDown,  title: "Reduce costly turnover",   desc: "Each resignation costs 50–200% of annual salary. Prevent it." },
                { icon: Users,         title: "Team-level insights",       desc: "Drill from company overview to individual risk profiles instantly." },
                { icon: Shield,        title: "Built for privacy",          desc: "Anonymized check-ins. GDPR compliant. Your data stays yours." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-[#2563eb]" />
                  </div>
                  <div>
                    <p className="text-[#0f1f3d] mb-0.5" style={{ fontSize: "0.9rem", fontWeight: 700 }}>{title}</p>
                    <p className="text-gray-500" style={{ fontSize: "0.83rem", lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — decorative card stack */}
            <div className="relative flex flex-col gap-4">
              {[
                {
                  name: "Sarah Mitchell",
                  role: "Senior Engineer · Engineering",
                  risk: "87%",
                  riskColor: "text-red-600 bg-red-50",
                  action: "Schedule immediate 1:1 with HR",
                  avatar: "SM",
                  avatarBg: "from-violet-400 to-purple-600",
                },
                {
                  name: "Lucas Fernández",
                  role: "Data Analyst · Analytics",
                  risk: "79%",
                  riskColor: "text-orange-600 bg-orange-50",
                  action: "Offer lateral growth opportunity",
                  avatar: "LF",
                  avatarBg: "from-rose-400 to-pink-600",
                },
                {
                  name: "Aisha Patel",
                  role: "HR Coordinator · HR",
                  risk: "22%",
                  riskColor: "text-emerald-600 bg-emerald-50",
                  action: "Continue regular check-ins",
                  avatar: "AP",
                  avatarBg: "from-indigo-400 to-blue-600",
                },
              ].map(({ name, role, risk, riskColor, action, avatar, avatarBg }, i) => (
                <div
                  key={name}
                  className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
                  style={{ opacity: 1 - i * 0.08, transform: `scale(${1 - i * 0.02})` }}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarBg} flex items-center justify-center shrink-0`}>
                    <span className="text-white" style={{ fontSize: "0.7rem", fontWeight: 700 }}>{avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0f1f3d]" style={{ fontSize: "0.875rem", fontWeight: 600 }}>{name}</p>
                    <p className="text-gray-400 truncate" style={{ fontSize: "0.72rem" }}>{role}</p>
                    <p className="text-gray-500 mt-1 truncate" style={{ fontSize: "0.72rem" }}>💡 {action}</p>
                  </div>
                  <div className={`shrink-0 px-3 py-1.5 rounded-xl ${riskColor}`} style={{ fontSize: "0.85rem", fontWeight: 800 }}>
                    {risk}
                  </div>
                </div>
              ))}

              {/* Subtle label */}
              <p className="text-center text-gray-300 mt-1" style={{ fontSize: "0.72rem" }}>
                Live AI risk predictions — updated on every check-in
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CTA BANNER                                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0f1f3d]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#2563eb] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/40">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
          <h2
            className="text-white mb-4"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Ready to keep your best people?
          </h2>
          <p className="text-blue-300 mb-10" style={{ fontSize: "1rem", lineHeight: 1.7 }}>
            Join HR teams already using StayPath AI to predict, prevent, and reduce employee turnover.
            Start your 14-day free trial — no card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-[#2563eb] text-white px-7 py-3.5 rounded-xl hover:bg-[#1d4ed8] transition-colors w-full sm:w-auto justify-center"
              style={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-white/10 text-white border border-white/20 px-7 py-3.5 rounded-xl hover:bg-white/15 transition-colors w-full sm:w-auto justify-center"
              style={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2563eb] flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" fill="white" />
            </div>
            <span className="text-[#0f1f3d]" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
              StayPath <span className="text-[#2563eb]">AI</span>
            </span>
          </div>
          <p className="text-gray-400 text-center" style={{ fontSize: "0.78rem" }}>
            © 2026 StayPath AI. All rights reserved. Built for modern HR teams.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Support"].map((item) => (
              <a key={item} href="#" className="text-gray-400 hover:text-gray-600 transition-colors" style={{ fontSize: "0.78rem" }}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}