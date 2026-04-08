import { useState } from "react";
import { fd } from "../utils/dates.js";
import { row } from "./ui.jsx";

export default function TimePanel({ simDate, setSimDate }) {
  if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_SIM !== 'true') {
    return null;
  const [open, setOpen] = useState(false);
  const add = n => { const d = new Date(simDate); d.setDate(d.getDate() + n); setSimDate(d); };
  const jumps = [{l:"-7d",n:-7},{l:"-3d",n:-3},{l:"-1d",n:-1},{l:"+1d",n:1},{l:"+3d",n:3},{l:"+7d",n:7},{l:"+14d",n:14}];

  return (
    <div style={{ background:"var(--el)", border:"0.5px solid var(--bdm)", borderRadius:10, marginBottom:16, overflow:"hidden" }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ ...row, padding:"8px 14px", cursor:"pointer", justifyContent:"space-between" }}>
        <div style={{ ...row, gap:6 }}>
          <span style={{ fontSize:11, color:"var(--warn)", fontWeight:500 }}>⏱ PAINEL DE TEMPO</span>
          <span style={{ fontSize:12, color:"var(--muted)" }}>simulando</span>
          <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:500, color:"var(--warn)" }}>{fd(simDate)}</span>
        </div>
        <span style={{ fontSize:10, color:"var(--muted)" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"10px 14px 14px", borderTop:"0.5px solid var(--bd)" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
            {jumps.map(j => (
              <button key={j.l} onClick={() => add(j.n)} style={{ fontSize:12, padding:"3px 10px",
                color: j.n < 0 ? "var(--err)" : "var(--ok)",
                borderColor: j.n < 0 ? "var(--err)" : "var(--ok)",
                background: j.n < 0 ? "var(--errbg)" : "var(--okbg)" }}>
                {j.l}
              </button>
            ))}
            <button onClick={() => setSimDate(new Date(2026,3,1))}
              style={{ fontSize:12, padding:"3px 10px", marginLeft:"auto", color:"var(--muted)" }}>
              Reset
            </button>
          </div>
          <div style={{ ...row, gap:8 }}>
            <input type="date" defaultValue="2026-04-01"
              onChange={e => { if (e.target.value) { const[y,m,d]=e.target.value.split('-'); setSimDate(new Date(+y,+m-1,+d)); }}}
              style={{ width:160, fontSize:12 }} />
            <span style={{ fontSize:11, color:"var(--muted)" }}>data específica</span>
          </div>
          <p style={{ fontSize:11, color:"var(--muted)", marginTop:8 }}>
            Status recalculados automaticamente com base nesta data.
          </p>
        </div>
      )}
    </div>
  );
}
