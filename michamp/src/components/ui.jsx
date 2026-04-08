import { STATUS_CFG, MATCH_STATUS_CFG } from '../constants.js';

export const row  = { display:"flex", alignItems:"center", gap:8 };
export const card = { background:"var(--card)", border:"0.5px solid var(--bd)", borderRadius:12, padding:"1rem 1.25rem" };
export const scroll = { maxHeight:380, overflowY:"auto", display:"flex", flexDirection:"column", gap:10 };

export function Badge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.encerrado;
  return (
    <span style={{ fontSize:11, fontWeight:500, padding:"3px 10px", borderRadius:6,
      color:c.clr, background:c.bg, whiteSpace:"nowrap" }}>
      {c.label}
    </span>
  );
}

export function MatchBadge({ status }) {
  const c = MATCH_STATUS_CFG[status] || MATCH_STATUS_CFG.agendada;
  return (
    <span style={{ fontSize:11, fontWeight:500, padding:"3px 10px", borderRadius:6,
      color:c.clr, background:c.bg, whiteSpace:"nowrap" }}>
      {c.label}
    </span>
  );
}

export function Chip({ label, active, onClick, ok }) {
  return (
    <button onClick={onClick} style={{ fontSize:12, padding:"4px 10px",
      borderColor: active ? (ok ? "var(--ok)" : "var(--ac)") : "var(--bdm)",
      background:  active ? (ok ? "var(--okbg)" : "var(--acbg)") : "transparent",
      color:       active ? (ok ? "var(--ok)" : "var(--act)") : "var(--muted)" }}>
      {label}
    </button>
  );
}

export function Divider({ mt=12, mb=12 }) {
  return <div style={{ borderTop:"0.5px solid var(--bd)", marginTop:mt, marginBottom:mb }} />;
}

export function SLabel({ children, style={} }) {
  return (
    <p style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase",
      letterSpacing:"0.08em", margin:"0 0 8px", ...style }}>
      {children}
    </p>
  );
}

export function ABtn({ children, onClick, v="default", disabled, style={} }) {
  const vs = {
    default: {},
    primary: { borderColor:"var(--ac)",   color:"var(--act)", background:"var(--acbg)"  },
    danger:  { borderColor:"var(--err)",  color:"var(--err)", background:"var(--errbg)" },
    success: { borderColor:"var(--ok)",   color:"var(--ok)",  background:"var(--okbg)"  },
    warn:    { borderColor:"var(--warn)", color:"var(--warn)",background:"var(--warnbg)"},
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...vs[v], ...style }}>
      {children}
    </button>
  );
}

export function Pill({ children, clr="var(--muted)", bg="var(--el)" }) {
  return (
    <span style={{ fontSize:11, padding:"2px 7px", borderRadius:5,
      border:"0.5px solid var(--bdm)", color:clr, background:bg, whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}
