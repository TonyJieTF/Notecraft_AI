import React from "react";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function AppShell({ children, dark }) {
  return (
    <div
      className={cn(
        "min-h-screen w-full transition-colors duration-300",
        dark
          ? "dark bg-[#0b1020] text-slate-100"
          : "bg-[#f6f8fc] text-slate-900"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 -z-10",
          dark
            ? "bg-[radial-gradient(circle_at_top,_rgba(109,94,249,0.18),_transparent_28%),radial-gradient(circle_at_right,_rgba(25,195,125,0.10),_transparent_24%)]"
            : "bg-[radial-gradient(circle_at_top,_rgba(109,94,249,0.12),_transparent_28%),radial-gradient(circle_at_right,_rgba(25,195,125,0.10),_transparent_20%)]"
        )}
      />
      {children}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={cn(
        "rounded-3xl border backdrop-blur-sm shadow-[0_16px_60px_rgba(15,23,42,0.12)]",
        "border-white/10 bg-white/70 dark:bg-white/5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({ children, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function NavButton({ active, icon: Icon, label, onClick, dark }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
        active
          ? "bg-violet-500 text-white shadow-[0_14px_32px_rgba(109,94,249,0.35)]"
          : dark
          ? "text-slate-300 hover:bg-white/6"
          : "text-slate-700 hover:bg-slate-900/5"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

export function Metric({ label, value, hint, accent = "violet" }) {
  const accents = {
    violet: "from-violet-500/20 to-violet-500/5 text-violet-200 border-violet-400/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-200 border-emerald-400/20",
    sky: "from-sky-500/20 to-sky-500/5 text-sky-200 border-sky-400/20",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-100 border-amber-400/20",
  };

  return (
    <Card className={cn("bg-gradient-to-br p-5", accents[accent])}>
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-xs text-slate-400">{hint}</div>
    </Card>
  );
}

export function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <div className="font-medium">{label}</div>
        <div className="mt-1 text-sm text-slate-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative h-8 w-14 rounded-full transition",
          enabled ? "bg-violet-500" : "bg-slate-500/30"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-6 w-6 rounded-full bg-white transition",
            enabled ? "left-7" : "left-1"
          )}
        />
      </button>
    </div>
  );
}
