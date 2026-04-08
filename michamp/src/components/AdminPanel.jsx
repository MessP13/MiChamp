import { useState } from "react";
import { STATUS_CFG, MATCH_STATUS_CFG, TEAM_SIZE } from "../constants.js";
import { computeStatus } from "../utils/dates.js";
import { suggestSoloTeams } from "../utils/matchmaking.js";
import { generateMatches } from "../utils/championship.js";
import { Chip, ABtn, SLabel, Pill, Divider, scroll, row } from "./ui.jsx";

const TABS = ["Visão Geral","Inscrições","Formação","Partidas","Correções"];

export default function AdminPanel({ data, setData, simDate, onClose, onUpdateMatch }) {
  const [tab, setTab]       = useState(0);
  const [resInput, setResInput] = useState({});
  const [soloGroups, setSoloGroups] = useState({});

  const allPending  = data.flatMap(c => c.participantes.filter(p => p.estado==="pendente").map(p => ({...p,champId:c.id,champNome:c.nome})));
  const allPedidos  = data.flatMap(c => (c.pedidos||[]).filter(p => p.status==="pendente").map(p => ({...p,champId:c.id,champNome:c.nome})));
  // Also include match-level pedidos
  const matchPedidos = data.flatMap(c =>
    (c.partidas||[]).flatMap(m =>
      (m.pedidos||[]).filter(p => p.status==="pendente").map(p => ({
        ...p, champId:c.id, champNome:c.nome, matchId:m.id,
        partida_desc:`${m.time1} vs ${m.time2} (${m.fase})`,
      }))
    )
  );
  const allCorrections = [...allPedidos, ...matchPedidos];

  const ongoingChamps = data.filter(c => computeStatus(c, simDate) === "em_andamento");
  const emBreveChamps = data.filter(c => computeStatus(c, simDate) === "em_breve");

  const updPart  = (cId, pId, estado) =>
    setData(prev => prev.map(c => c.id!==cId ? c : { ...c, participantes: c.participantes.map(p => p.id!==pId ? p : {...p,estado}) }));

  const updChampPedido = (cId, pId, status) =>
    setData(prev => prev.map(c => c.id!==cId ? c : { ...c, pedidos: (c.pedidos||[]).map(p => p.id!==pId ? p : {...p,status}) }));

  const updMatchPedido = (cId, mId, pId, status) => {
    onUpdateMatch(cId, mId, {
      pedidos: data.find(c=>c.id===cId)?.partidas?.find(m=>m.id===mId)?.pedidos?.map(p => p.id!==pId ? p : {...p,status}) || [],
    });
  };

  const setOverride = (cId, val) =>
    setData(prev => prev.map(c => c.id!==cId ? c : { ...c, status_override: val||null }));

  const setCapitao = (cId, tId, nick) =>
    setData(prev => prev.map(c => c.id!==cId ? c : {
      ...c, participantes: c.participantes.map(p => p.id!==tId ? p : { ...p, capitao: nick===p.capitao ? null : nick }),
    }));

  const doGenerate = (cId) => {
    const champ = data.find(c => c.id === cId);
    if (!champ) return;
    setData(prev => prev.map(c => c.id!==cId ? c : { ...c, partidas: generateMatches(champ) }));
  };

  const doSuggestSolos = (cId) => {
    const champ = data.find(c => c.id === cId);
    const solos = champ.participantes.filter(p => p.tipo==="solo" && p.estado==="aprovado");
    setSoloGroups(prev => ({ ...prev, [cId]: suggestSoloTeams(solos, TEAM_SIZE[champ.jogo]||5) }));
  };

  const confirmSoloGroup = (cId, team, gi) => {
    const newTeam = {
      id: Date.now(), tipo:"time",
      nome: `Time Solo ${gi+1}`, riot_tag:"#TS",
      estado:"aprovado", capitao:null,
      jogadores: team.map(s => ({ nick:s.nick, riot_tag:s.riot_tag, role:s.role||"" })),
    };
    const soloIds = new Set(team.map(s => s.id));
    setData(prev => prev.map(c => c.id!==cId ? c : {
      ...c, participantes: [...c.participantes.filter(p => !soloIds.has(p.id)), newTeam],
    }));
    setSoloGroups(prev => {
      const g = { ...prev[cId] };
      g.teams = g.teams.filter((_, i) => i !== gi);
      return { ...prev, [cId]: g };
    });
  };

  const saveResult = (cId, pId) => {
    const r = resInput[`${cId}-${pId}`];
    if (!r) return;
    onUpdateMatch(cId, pId, { resultado:r, status:"encerrada", placar_vivo:null });
    setResInput(p => ({ ...p, [`${cId}-${pId}`]:"" }));
  };

  const tabBadge = (i) => {
    if (i===1 && allPending.length)     return ` (${allPending.length})`;
    if (i===4 && allCorrections.length) return ` (${allCorrections.length})`;
    return "";
  };

  const elStyle = { background:"var(--el)", borderRadius:8, padding:"10px 14px", border:"0.5px solid var(--bd)" };

  return (
    <div>
      <div style={{ ...row, justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:500 }}>Painel Admin</h2>
          <p style={{ fontSize:12, color:"var(--warn)", marginTop:2 }}>Modo administrador ativo</p>
        </div>
        <ABtn v="danger" onClick={onClose}>Sair</ABtn>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {TABS.map((t, i) => <Chip key={t} label={t + tabBadge(i)} active={tab===i} onClick={() => setTab(i)} />)}
      </div>

      {/* ── Tab 0: Visão geral ── */}
      {tab===0 && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
            {[
              { lbl:"Ativos",     val:data.filter(c=>["inscricoes_abertas","em_breve","em_andamento"].includes(computeStatus(c,simDate))).length, clr:"var(--nfo)" },
              { lbl:"Pendentes",  val:allPending.length,     clr:"var(--warn)" },
              { lbl:"Correções",  val:allCorrections.length, clr:"var(--err)"  },
            ].map(m => (
              <div key={m.lbl} style={{ background:"var(--el)", borderRadius:8, padding:"12px", border:"0.5px solid var(--bd)" }}>
                <p style={{ fontSize:11, color:"var(--muted)", marginBottom:4 }}>{m.lbl}</p>
                <p style={{ fontSize:22, fontWeight:500, color:m.clr }}>{m.val}</p>
              </div>
            ))}
          </div>
          <SLabel>Status dos campeonatos</SLabel>
          <div style={scroll}>
            {data.map(c => {
              const st = computeStatus(c, simDate);
              return (
                <div key={c.id} style={elStyle}>
                  <div style={{ ...row, justifyContent:"space-between", marginBottom:8 }}>
                    <div>
                      <span style={{ fontWeight:500, fontSize:13 }}>{c.nome}</span>
                      <span style={{ fontSize:11, color:"var(--muted)", marginLeft:6 }}>{c.jogo}</span>
                    </div>
                    <span style={{ fontSize:11, fontWeight:500, padding:"3px 10px", borderRadius:6,
                      color:STATUS_CFG[st]?.clr, background:STATUS_CFG[st]?.bg }}>
                      {STATUS_CFG[st]?.label}
                    </span>
                  </div>
                  <div style={{ ...row, gap:6 }}>
                    <span style={{ fontSize:11, color:"var(--muted)" }}>Override:</span>
                    <select value={c.status_override||""} onChange={e => setOverride(c.id, e.target.value)}
                      style={{ width:"auto", fontSize:12, padding:"4px 8px", flex:1, maxWidth:220 }}>
                      <option value="">Automático ({STATUS_CFG[st]?.label})</option>
                      {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab 1: Inscrições ── */}
      {tab===1 && (
        allPending.length===0
          ? <p style={{ color:"var(--muted)", fontSize:13 }}>Nenhuma inscrição pendente.</p>
          : <div style={scroll}>{allPending.map(p => (
              <div key={`${p.champId}-${p.id}`} style={elStyle}>
                <p style={{ fontSize:11, color:"var(--muted)", marginBottom:6 }}>{p.champNome}</p>
                <div style={{ ...row, justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                  <div>
                    <span style={{ fontWeight:500 }}>{p.nick||p.nome}</span>
                    <span style={{ fontSize:12, color:"var(--warn)", marginLeft:6, fontFamily:"monospace" }}>{p.riot_tag}</span>
                    {p.role && <span style={{ fontSize:11, color:"var(--muted)", marginLeft:4 }}>· {p.role}</span>}
                    {p.disponibilidade && (
                      <p style={{ fontSize:11, color:"var(--muted)", marginTop:3 }}>
                        {p.disponibilidade.dias?.join(", ")} · {p.disponibilidade.h_ini}–{p.disponibilidade.h_fim}
                      </p>
                    )}
                  </div>
                  <div style={{ ...row, gap:6 }}>
                    <ABtn v="success" onClick={() => updPart(p.champId, p.id, "aprovado")}>Aprovar</ABtn>
                    <ABtn v="danger"  onClick={() => updPart(p.champId, p.id, "rejeitado")}>Rejeitar</ABtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}

      {/* ── Tab 2: Formação ── */}
      {tab===2 && (
        <div>
          {/* Captain — em_breve */}
          {emBreveChamps.length > 0 && <>
            <SLabel>Designar Capitão/IGL — Em breve</SLabel>
            <p style={{ fontSize:12, color:"var(--muted)", marginBottom:12 }}>Clique num jogador para definir/remover o capitão.</p>
            {emBreveChamps.map(c => (
              <div key={c.id} style={{ marginBottom:14 }}>
                <p style={{ fontSize:12, fontWeight:500, color:"var(--act)", marginBottom:6 }}>{c.nome}</p>
                {c.participantes.filter(p => p.tipo==="time" && p.estado==="aprovado").map(t => (
                  <div key={t.id} style={{ ...elStyle, marginBottom:8 }}>
                    <div style={{ ...row, marginBottom:8 }}>
                      <span style={{ fontWeight:500, fontSize:13 }}>{t.nome}</span>
                      {t.capitao && <Pill clr="var(--warn)" bg="var(--warnbg)">⚡ Cap: {t.capitao}</Pill>}
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {t.jogadores.map((j, i) => (
                        <button key={i} onClick={() => setCapitao(c.id, t.id, j.nick)}
                          style={{ fontSize:12, padding:"4px 10px",
                            borderColor: t.capitao===j.nick ? "var(--warn)" : "var(--bdm)",
                            background:  t.capitao===j.nick ? "var(--warnbg)" : "transparent",
                            color:       t.capitao===j.nick ? "var(--warn)"   : "var(--muted)" }}>
                          {t.capitao===j.nick ? "⚡ " : ""}{j.nick}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <Divider />
          </>}

          {/* Solo grouping */}
          <SLabel style={{ marginTop:12 }}>Formação de times solo</SLabel>
          {data.filter(c => c.participantes.some(p => p.tipo==="solo" && p.estado==="aprovado")).map(c => {
            const solos = c.participantes.filter(p => p.tipo==="solo" && p.estado==="aprovado");
            const sz    = TEAM_SIZE[c.jogo] || 5;
            const sug   = soloGroups[c.id];
            return (
              <div key={c.id} style={{ ...elStyle, marginBottom:12 }}>
                <div style={{ ...row, justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontWeight:500 }}>{c.nome} <span style={{ color:"var(--muted)", fontSize:11 }}>({solos.length} solos · {sz}/time)</span></span>
                  <ABtn v="primary" onClick={() => doSuggestSolos(c.id)}>Sugerir times</ABtn>
                </div>
                {sug && <>
                  {sug.teams.map((team, gi) => (
                    <div key={gi} style={{ background:"var(--card)", borderRadius:8, padding:"10px", marginBottom:8, border:"0.5px solid var(--bdm)" }}>
                      <div style={{ ...row, justifyContent:"space-between", marginBottom:6 }}>
                        <p style={{ fontSize:12, fontWeight:500, color:"var(--act)" }}>Sugestão {gi+1}</p>
                        <ABtn v="success" onClick={() => confirmSoloGroup(c.id, team, gi)} style={{ fontSize:12, padding:"3px 10px" }}>Confirmar</ABtn>
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {team.map(s => (
                          <span key={s.id} style={{ fontSize:11, padding:"2px 8px", background:"var(--el)", border:"0.5px solid var(--bdm)", borderRadius:5, color:"var(--muted)" }}>
                            {s.nick} {s.riot_tag}
                            {s.disponibilidade && <span style={{ color:"var(--faint)" }}> · {s.disponibilidade.dias?.slice(0,2).join(",")} {s.disponibilidade.h_ini}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {sug.leftover?.length > 0 && (
                    <p style={{ fontSize:11, color:"var(--err)", marginTop:4 }}>
                      Sem par suficiente: {sug.leftover.map(s => s.nick).join(", ")}
                    </p>
                  )}
                </>}
              </div>
            );
          })}
          {data.every(c => !c.participantes.some(p => p.tipo==="solo" && p.estado==="aprovado")) && (
            <p style={{ color:"var(--muted)", fontSize:13 }}>Nenhum jogador solo para agrupar.</p>
          )}
        </div>
      )}

      {/* ── Tab 3: Partidas ── */}
      {tab===3 && (
        ongoingChamps.length===0
          ? <p style={{ color:"var(--muted)", fontSize:13 }}>Nenhum campeonato em andamento.</p>
          : ongoingChamps.map(c => (
              <div key={c.id} style={{ marginBottom:20 }}>
                <div style={{ ...row, justifyContent:"space-between", marginBottom:10 }}>
                  <SLabel style={{ margin:0 }}>{c.nome}</SLabel>
                  <ABtn v="primary" onClick={() => doGenerate(c.id)} style={{ fontSize:12, padding:"4px 12px" }}>
                    {c.partidas.length ? "Regerar" : "Gerar partidas"}
                  </ABtn>
                </div>
                {c.partidas.length===0 && <p style={{ fontSize:12, color:"var(--muted)" }}>Clique em "Gerar partidas" para criar o calendário.</p>}
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {c.partidas.map(p => (
                    <div key={p.id} style={elStyle}>
                      <div style={{ ...row, justifyContent:"space-between", marginBottom: p.status==="agendada" ? 8 : 0 }}>
                        <span style={{ fontSize:13 }}>
                          {p.transmissao && <span style={{ fontSize:10, color:"var(--err)", marginRight:4 }}>📡</span>}
                          <span style={{ fontWeight:500 }}>{p.time1}</span>
                          <span style={{ color:"var(--muted)", margin:"0 6px", fontSize:11 }}>vs</span>
                          <span style={{ fontWeight:500 }}>{p.time2}</span>
                          <span style={{ fontSize:11, color:"var(--muted)", marginLeft:8 }}>{p.fase}</span>
                        </span>
                        <div style={{ ...row, gap:6 }}>
                          {p.resultado
                            ? <Pill clr="var(--ok)" bg="var(--okbg)">{p.resultado} ✓</Pill>
                            : p.placar_vivo && p.status==="ao_vivo"
                              ? <Pill clr="var(--err)" bg="var(--errbg)">{p.placar_vivo} 🔴</Pill>
                              : null}
                          <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6,
                            color:MATCH_STATUS_CFG[p.status]?.clr, background:MATCH_STATUS_CFG[p.status]?.bg }}>
                            {MATCH_STATUS_CFG[p.status]?.label}
                          </span>
                        </div>
                      </div>
                      {p.status==="agendada" && (
                        <div style={{ ...row, gap:8 }}>
                          <input value={resInput[`${c.id}-${p.id}`]||""}
                            onChange={e => setResInput(prev => ({ ...prev, [`${c.id}-${p.id}`]: e.target.value }))}
                            placeholder="Resultado final ex: 2-1" style={{ fontSize:12 }} />
                          <ABtn v="primary" onClick={() => saveResult(c.id, p.id)} style={{ whiteSpace:"nowrap" }}>Salvar</ABtn>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
      )}

      {/* ── Tab 4: Correções ── */}
      {tab===4 && (
        allCorrections.length===0
          ? <p style={{ color:"var(--muted)", fontSize:13 }}>Nenhuma correção pendente.</p>
          : <div style={scroll}>{allCorrections.map(p => (
              <div key={`${p.champId}-${p.id}`} style={{ ...elStyle, border:`0.5px solid var(--warn)` }}>
                <p style={{ fontSize:11, color:"var(--muted)", marginBottom:4 }}>{p.champNome} · {p.partida_desc}</p>
                <p style={{ fontSize:13, marginBottom:6 }}>
                  Solicitante: <span style={{ color:"var(--act)" }}>{p.solicitante}</span>
                </p>
                <p style={{ fontSize:13, padding:"8px 10px", background:"var(--card)", borderRadius:6, marginBottom:10 }}>
                  "{p.descricao}"
                </p>
                <div style={{ ...row, gap:8 }}>
                  <ABtn v="success" onClick={() => {
                    if (p.matchId) updMatchPedido(p.champId, p.matchId, p.id, "aceito");
                    else updChampPedido(p.champId, p.id, "aceito");
                  }}>Aceitar</ABtn>
                  <ABtn v="danger" onClick={() => {
                    if (p.matchId) updMatchPedido(p.champId, p.matchId, p.id, "negado");
                    else updChampPedido(p.champId, p.id, "negado");
                  }}>Negar</ABtn>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
}
