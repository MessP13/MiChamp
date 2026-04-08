import { MatchBadge, Pill, SLabel, row } from "./ui.jsx";

export default function MatchList({ partidas, onSelectMatch }) {
  if (!partidas?.length) return null;
  const groups = {};
  partidas.forEach(p => { if (!groups[p.fase]) groups[p.fase] = []; groups[p.fase].push(p); });

  return (
    <div style={{ marginTop:16 }}>
      <SLabel>Partidas</SLabel>
      {Object.entries(groups).map(([fase, matches]) => (
        <div key={fase} style={{ marginBottom:12 }}>
          <p style={{ fontSize:11, color:"var(--muted)", fontWeight:500, margin:"0 0 6px" }}>{fase}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {matches.map(m => (
              <div key={m.id} onClick={() => onSelectMatch?.(m)}
                onMouseEnter={e => onSelectMatch && (e.currentTarget.style.borderColor="var(--bdm)")}
                onMouseLeave={e => onSelectMatch && (e.currentTarget.style.borderColor="var(--bd)")}
                style={{ ...row, justifyContent:"space-between", background:"var(--el)",
                  borderRadius:8, padding:"9px 14px", border:"0.5px solid var(--bd)",
                  fontSize:13, cursor: onSelectMatch ? "pointer" : "default",
                  transition:"border-color 0.1s" }}>
                <div style={{ ...row, gap:6, flex:1, minWidth:0 }}>
                  {m.transmissao && <span style={{ fontSize:10, color:"var(--err)" }}>📡</span>}
                  <span style={{ fontWeight:500 }}>{m.time1}</span>
                  <span style={{ color:"var(--faint)", fontSize:11 }}>vs</span>
                  <span style={{ fontWeight:500 }}>{m.time2}</span>
                </div>
                <div style={{ ...row, gap:6, flexShrink:0 }}>
                  {m.resultado
                    ? <Pill clr="var(--ok)" bg="var(--okbg)">{m.resultado}</Pill>
                    : m.placar_vivo && m.status === "ao_vivo"
                      ? <Pill clr="var(--err)" bg="var(--errbg)">{m.placar_vivo} 🔴</Pill>
                      : null}
                  <MatchBadge status={m.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
