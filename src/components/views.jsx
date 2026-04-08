import { RIOT_GAMES } from "../constants.js";
import { SLabel, Pill, row } from "./ui.jsx";

export function ParticipantList({ participantes, jogo, isAdmin }) {
  const isRiot  = RIOT_GAMES.has(jogo);
  const aprov   = participantes.filter(p => p.estado === "aprovado");
  const times   = aprov.filter(p => p.tipo === "time");
  const solos   = aprov.filter(p => p.tipo === "solo");
  if (!aprov.length)
    return <p style={{ fontSize:13, color:"var(--muted)", marginTop:16 }}>Nenhum participante inscrito.</p>;
  return (
    <div style={{ marginTop:16 }}>
      <SLabel>{aprov.length} participante{aprov.length !== 1 ? "s" : ""} inscrito{aprov.length !== 1 ? "s" : ""}</SLabel>
      {times.length > 0 && <>
        <p style={{ fontSize:11, color:"var(--muted)", margin:"0 0 6px", fontWeight:500 }}>Times</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:solos.length ? 12 : 0 }}>
          {times.map(t => (
            <div key={t.id} style={{ background:"var(--el)", borderRadius:8, padding:"10px 14px", border:"0.5px solid var(--bd)" }}>
              <div style={{ ...row, justifyContent:"space-between", marginBottom:6 }}>
                <div style={{ ...row, gap:6 }}>
                  <span style={{ fontWeight:500, fontSize:14 }}>{t.nome}</span>
                  {t.capitao && <Pill clr="var(--warn)" bg="var(--warnbg)">⚡ Cap: {t.capitao}</Pill>}
                </div>
                {isAdmin && <span style={{ fontSize:11, fontFamily:"monospace", color:"var(--warn)" }}>{t.riot_tag}</span>}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {t.jogadores.map((j, i) => (
                  <span key={i} style={{ fontSize:11, padding:"2px 7px", background:"var(--card)",
                    border:"0.5px solid var(--bdm)", borderRadius:5,
                    color: j.nick === t.capitao ? "var(--warn)" : "var(--muted)" }}>
                    {j.nick === t.capitao ? "⚡ " : ""}{j.nick}{isAdmin ? j.riot_tag : ""}
                    {j.role && <span style={{ color:"var(--faint)" }}> · {j.role}</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>}
      {solos.length > 0 && <>
        <p style={{ fontSize:11, color:"var(--muted)", margin:"0 0 6px", fontWeight:500 }}>Jogadores solo</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {solos.map(s => (
            <div key={s.id} style={{ fontSize:13, padding:"5px 12px", background:"var(--el)", border:"0.5px solid var(--bd)", borderRadius:8 }}>
              {s.nick}{isAdmin ? s.riot_tag : ""}
              {s.role && <span style={{ fontSize:11, color:"var(--muted)" }}> · {s.role}</span>}
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

export function StandingsTable({ tabela }) {
  return (
    <div style={{ marginTop:16 }}>
      <SLabel>Classificação</SLabel>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:"0.5px solid var(--bdm)" }}>
              {["#","Time","J","V","E","D","P","SG"].map(h => (
                <th key={h} style={{ padding:"6px 8px", textAlign: h==="Time"?"left":"center", color:"var(--muted)", fontWeight:400, fontSize:11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabela.map(r => (
              <tr key={r.pos} style={{ borderBottom:"0.5px solid var(--bd)", background: r.pos<=2 ? "rgba(96,165,250,0.06)" : "transparent" }}>
                <td style={{ padding:"7px 8px", textAlign:"center", color:"var(--muted)" }}>{r.pos}</td>
                <td style={{ padding:"7px 8px", fontWeight:500 }}>{r.nome} <span style={{ color:"var(--muted)", fontSize:11 }}>{r.tag}</span></td>
                {["J","V","E","D","P","SG"].map(k => (
                  <td key={k} style={{ padding:"7px 8px", textAlign:"center",
                    color: k==="P" ? "var(--nfo)" : "var(--text)", fontWeight: k==="P" ? 500 : 400 }}>{r[k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BracketView({ bracket, provavel=false }) {
  return (
    <div style={{ marginTop:16 }}>
      <div style={{ ...row, marginBottom:10, gap:8 }}>
        <SLabel style={{ margin:0 }}>{provavel ? "Provável chaveamento" : "Chaveamento"}</SLabel>
        {provavel && <Pill clr="var(--warn)" bg="var(--warnbg)">Preliminar</Pill>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <p style={{ fontSize:11, color:"var(--muted)", fontWeight:500 }}>Semifinais</p>
        {bracket.semifinais.map((s, i) => (
          <div key={i} style={{ ...row, background:"var(--el)", borderRadius:8, padding:"10px 14px",
            border:`0.5px ${provavel?"dashed":"solid"} var(--bdm)`, fontSize:13, gap:10 }}>
            <span style={{ fontWeight: s.vencedor===s.time1?500:400, color: s.vencedor===s.time1?"var(--text)":"var(--muted)" }}>{s.time1}</span>
            <span style={{ color:"var(--faint)", fontSize:11 }}>vs</span>
            <span style={{ fontWeight: s.vencedor===s.time2?500:400, color: s.vencedor===s.time2?"var(--text)":"var(--muted)" }}>{s.time2}</span>
            <span style={{ marginLeft:"auto", fontSize:12, color:"var(--muted)" }}>{s.resultado || "a definir"}</span>
          </div>
        ))}
        <p style={{ fontSize:11, color:"var(--muted)", fontWeight:500, marginTop:4 }}>Final</p>
        <div style={{ ...row, background: provavel?"var(--el)":"var(--warnbg)", borderRadius:8, padding:"11px 14px",
          border:`0.5px ${provavel?"dashed":"solid"} var(--bdm)`, fontSize:14, gap:10 }}>
          <span style={{ fontWeight: bracket.final.vencedor===bracket.final.time1?500:400 }}>{bracket.final.time1}</span>
          <span style={{ color:"var(--faint)", fontSize:11 }}>vs</span>
          <span style={{ fontWeight: bracket.final.vencedor===bracket.final.time2?500:400 }}>{bracket.final.time2}</span>
          {bracket.final.vencedor && !provavel && (
            <span style={{ marginLeft:"auto", fontSize:11, padding:"2px 8px", background:"var(--card)",
              border:"0.5px solid var(--bdm)", borderRadius:6, color:"var(--warn)", fontWeight:500 }}>
              🏆 {bracket.final.vencedor}
            </span>
          )}
          {provavel && <span style={{ marginLeft:"auto", fontSize:11, color:"var(--muted)" }}>a definir</span>}
        </div>
      </div>
    </div>
  );
}
