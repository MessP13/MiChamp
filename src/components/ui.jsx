import { STATUS_CFG, MATCH_STATUS_CFG } from '../constants.js';

// ── Layout primitives ─────────────────────────────────────────────────────────
export const card = {
  background: "var(--card)",
  borderRadius: "16px",
  padding: "1.25rem",
  border: "1px solid var(--bd)",
  backdropFilter: "blur(12px)",
  boxShadow: "var(--shadow)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};

export const row = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

export const scroll = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  maxHeight: "60vh",
  overflowY: "auto",
  paddingRight: "4px",
};

// ── Components ────────────────────────────────────────────────────────────────

export function Chip({ label, active, onClick, ok }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        fontSize: "12px",
        borderRadius: "20px",
        background: active ? (ok ? "var(--okbg)" : "var(--acbg)") : "var(--el)",
        borderColor: active ? (ok ? "var(--ok)" : "var(--ac)") : "var(--bdm)",
        color: active ? (ok ? "var(--ok)" : "var(--act)") : "var(--muted)",
        fontWeight: active ? "600" : "400",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

export function Badge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.encerrado;
  return (
    <span style={{
      fontSize: "10px", fontWeight: "700", textTransform: "uppercase",
      letterSpacing: "0.05em", padding: "4px 10px", borderRadius: "6px",
      color: c.clr, background: c.bg, border: `1px solid ${c.clr}33`, whiteSpace: "nowrap",
    }}>
      {c.label}
    </span>
  );
}

export function MatchBadge({ status }) {
  const c = MATCH_STATUS_CFG[status] || MATCH_STATUS_CFG.agendada;
  return (
    <span style={{
      fontSize: "10px", fontWeight: "700", textTransform: "uppercase",
      letterSpacing: "0.05em", padding: "4px 10px", borderRadius: "6px",
      color: c.clr, background: c.bg, border: `1px solid ${c.clr}33`, whiteSpace: "nowrap",
    }}>
      {c.label}
    </span>
  );
}

export function Pill({ children, clr = "var(--muted)", bg = "var(--el)", className = "" }) {
  return (
    <span className={className} style={{
      fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px",
      color: clr, background: bg, border: `1px solid ${clr}33`,
      display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

export function ABtn({ children, onClick, v = "primary", disabled, style = {} }) {
  const variants = {
    default: { bd: "var(--bdm)",  bg: "var(--el)",     c: "var(--text)" },
    primary: { bd: "var(--ac)",   bg: "var(--acbg)",   c: "var(--act)"  },
    success: { bd: "var(--ok)",   bg: "var(--okbg)",   c: "var(--ok)"   },
    danger:  { bd: "var(--err)",  bg: "var(--errbg)",  c: "var(--err)"  },
    warn:    { bd: "var(--warn)", bg: "var(--warnbg)", c: "var(--warn)" },
  };
  const cur = variants[v] || variants.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "6px 14px", fontSize: "12px",
      borderColor: cur.bd, background: cur.bg, color: cur.c,
      ...style,
    }}>
      {children}
    </button>
  );
}

export const SLabel = ({ children, style = {} }) => (
  <p style={{
    fontSize: "10px", fontWeight: "700", color: "var(--muted)",
    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px",
    ...style,
  }}>
    {children}
  </p>
);

export const Divider = ({ mt = 12, mb = 12 }) => (
  <div style={{ height: "1px", background: "var(--bd)", margin: `${mt}px 0 ${mb}px 0` }} />
);

// ── Theme toggle ──────────────────────────────────────────────────────────────
export function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      style={{
        fontSize: 15, padding: '5px 10px', borderRadius: 8,
        border: '1px solid var(--bdm)', background: 'var(--glass-bg)',
        minWidth: 36, lineHeight: 1,
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

// ── Modal overlay ─────────────────────────────────────────────────────────────
export function Modal({ children, onClose, wide = false }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 999, padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-in"
        style={{
          background: 'var(--card)',
          borderRadius: 20,
          padding: '1.75rem',
          maxWidth: wide ? 720 : 420,
          width: '100%',
          border: '1px solid var(--bdm)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
