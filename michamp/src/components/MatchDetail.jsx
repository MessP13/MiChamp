import { useState } from "react";
import { RIOT_GAMES, MATCH_STATUS_CFG } from "../constants.js";
import { overlapWindow } from "../utils/matchmaking.js";
import { MatchBadge, ABtn, Divider, SLabel, Pill, row, card } from "./ui.jsx";

// ── helpers ──────────────────────────────────────────────────────────────────
function TeamCard({ nome, jogadores, capitao, isRiot, isAdmin, side }) {
  const accent = side === "left" ? "var(--ac)" : "var(--ok)";
  return (
    <div style={{ flex:1, background:"var(--el)", borderRadius:10, padding:"12px 14px",
      border:`0.5px solid var(--bdm)`, borderTop:`2px solid ${accent}` }}>
      <p style={{ fontWeight:500, fontSize:15, marginBottom:8 }}>{nome}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {(jogadores || []).map((j, i) => (
          <div key={i} style={{ ...row, justifyContent:"space-between",
            background: j.nick === capitao ? "var(--warnbg)" : "var(--card)",
            borderRadius:6, padding:"6px 10px",
            border: j.nick === capitao ? "0.5px solid var(--warn)" : "0.5px solid var(--bd)" }}>
            <div style={{ ...row, gap:6 }}>
              {j.nick === capitao && <span style={{ fontSize:10, color:"var(--warn)" }}>⚡</span>}
              <span style={{ fontSize:13, fontWeight: j.nick === capitao ? 500 : 400 }}>{j.nick}</span>
              {(isAdmin || !isRiot) && (
                <span style={{ fontSize:11, fontFamily:"monospace", color:"var(--muted)" }}>{j.riot_tag}</span>
              )}
            </div>
            {j.role && (
              <span style={{ fontSize:11, color:"var(--muted)", padding:"1px 6px",
                background:"var(--el)", borderRadius:4, border:"0.5px solid var(--bd)" }}>
                {j.role}
              </span>
            )}
          </div>
        ))}
        {(!jogadores || jogadores.length === 0) && (
          <p style={{ fontSize:12, color:"var(--muted)" }}>Sem jogadores cadastrados.</p>
        )}
      </div>
    </div>
  );
}

function ScoreBoard({ match, onUpdate, isAdmin, champNome }) {
  const [liveInput, setLiveInput] = useState(match.placar_vivo || "");
  const [resultInput, setResultInput] = useState(match.resultado || "");

  return (
    <div style={{ background:"var(--el)", borderRadius:10, padding:"1.25rem",
      border:"0.5px solid var(--bdm)", marginBottom:16 }}>

      {/* score display */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:12 }}>
        <span style={{ fontWeight:500, fontSize:16, flex:1, textAlign:"right" }}>{match.time1}</span>
        <div style={{ textAlign:"center", minWidth:80 }}>
          {match.resultado ? (
            <p style={{ fontSize:28, fontWeight:500, letterSpacing:"0.05em", color:"var(--ok)", fontFamily:"monospace" }}>
              {match.resultado}
            </p>
          ) : match.placar_vivo && match.status === "ao_vivo" ? (
            <div>
              <p style={{ fontSize:26, fontWeight:500, color:"var(--err)", fontFamily:"monospace" }}>
                {match.placar_vivo}
              </p>
              <span style={{ fontSize:10, color:"var(--err)", letterSpacing:"0.1em" }}>AO VIVO</span>
            </div>
          ) : (
            <p style={{ fontSize:22, color:"var(--muted)", letterSpacing:"0.08em" }}>vs</p>
          )}
        </div>
        <span style={{ fontWeight:500, fontSize:16, flex:1, textAlign:"left" }}>{match.time2}</span>
      </div>

      <div style={{ ...row, justifyContent:"center", gap:8, marginBottom: isAdmin ? 16 : 0 }}>
        <MatchBadge status={match.status} />
        {match.transmissao && <Pill clr="var(--err)" bg="var(--errbg)">📡 Transmissão</Pill>}
        <Pill>{match.fase}</Pill>
      </div>

      {/* admin controls */}
      {isAdmin && (
        <>
          <Divider mt={12} mb={12} />
          <SLabel>Controles admin</SLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

            {/* status changer */}
            <div style={{ ...row, gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:"var(--muted)", minWidth:60 }}>Status:</span>
              {Object.entries(MATCH_STATUS_CFG).map(([k, v]) => (
                <button key={k} onClick={() => onUpdate({ status: k })}
                  style={{ fontSize:12, padding:"4px 10px",
                    borderColor: match.status === k ? v.clr : "var(--bdm)",
                    background:  match.status === k ? v.bg   : "transparent",
                    color:       match.status === k ? v.clr  : "var(--muted)" }}>
                  {v.label}
                </button>
              ))}
            </div>

            {/* live score */}
            {match.status === "ao_vivo" && (
              <div style={{ ...row, gap:8 }}>
                <input value={liveInput} onChange={e => setLiveInput(e.target.value)}
                  placeholder="Placar ao vivo ex: 1-0" style={{ fontSize:13 }} />
                <ABtn v="warn" onClick={() => onUpdate({ placar_vivo: liveInput })}
                  style={{ whiteSpace:"nowrap" }}>
                  Atualizar
                </ABtn>
              </div>
            )}

            {/* final result */}
            {(match.status === "encerrada" || match.status === "ao_vivo") && (
              <div style={{ ...row, gap:8 }}>
                <input value={resultInput} onChange={e => setResultInput(e.target.value)}
                  placeholder="Resultado final ex: 2-1 ou 16–9" style={{ fontSize:13 }} />
                <ABtn v="success" onClick={() => onUpdate({ resultado: resultInput, status:"encerrada", placar_vivo:null })}
                  style={{ whiteSpace:"nowrap" }}>
                  Finalizar
                </ABtn>
              </div>
            )}

            {/* transmissão toggle */}
            <div style={{ ...row, gap:8 }}>
              <button onClick={() => onUpdate({ transmissao: !match.transmissao })}
                style={{ fontSize:12, padding:"4px 12px",
                  borderColor: match.transmissao ? "var(--err)" : "var(--bdm)",
                  background:  match.transmissao ? "var(--errbg)" : "transparent",
                  color:       match.transmissao ? "var(--err)"   : "var(--muted)" }}>
                {match.transmissao ? "📡 Transmissão: ON" : "📡 Transmissão: OFF"}
              </button>
            </div>

            {/* observações */}
            <div>
              <label style={{ fontSize:12, color:"var(--muted)", display:"block", marginBottom:4 }}>
                Observações internas
              </label>
              <textarea rows={2} defaultValue={match.observacoes}
                onBlur={e => onUpdate({ observacoes: e.target.value })}
                placeholder="Notas sobre esta partida..." />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AvailabilityWindow({ time1data, time2data }) {
  if (!time1data || !time2data) return null;
  const win = overlapWindow(time1data.disponibilidade, time2data.disponibilidade);
  if (!win) return (
    <div style={{ padding:"10px 14px", background:"var(--errbg)", borderRadius:8,
      border:"0.5px solid var(--err)", fontSize:13, color:"var(--err)", marginBottom:16 }}>
      Sem janela de disponibilidade em comum.
    </div>
  );
  return (
    <div style={{ padding:"10px 14px", background:"var(--nfobg)", borderRadius:8,
      border:"0.5px solid var(--bdm)", fontSize:13, marginBottom:16 }}>
      <p style={{ fontSize:11, color:"var(--nfo)", marginBottom:4 }}>
        Janela de disponibilidade sugerida
      </p>
      <div style={{ ...row, gap:8, flexWrap:"wrap" }}>
        {win.dias.map(d => <Pill key={d} clr="var(--nfo)" bg="var(--nfobg)">{d}</Pill>)}
        <Pill clr="var(--act)" bg="var(--acbg)">{win.janela}</Pill>
      </div>
    </div>
  );
}

function PedidosSection({ pedidos=[], onResolve, isAdmin }) {
  const pending = pedidos.filter(p => p.status === "pendente");
  if (!pending.length && !isAdmin) return null;
  return (
    <div style={{ marginTop:16 }}>
      <SLabel>Pedidos de correção ({pending.length} pendente{pending.length !== 1 ? "s" : ""})</SLabel>
      {pedidos.length === 0 && <p style={{ fontSize:12, color:"var(--muted)" }}>Nenhum pedido.</p>}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {pedidos.map(p => (
          <div key={p.id} style={{ background:"var(--el)", borderRadius:8, padding:"10px 14px",
            border:`0.5px solid ${p.status==="pendente"?"var(--warn)":"var(--bd)"}` }}>
            <div style={{ ...row, justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, color:"var(--act)" }}>{p.solicitante}</span>
              <Pill
                clr={p.status==="pendente"?"var(--warn)":p.status==="aceito"?"var(--ok)":"var(--muted)"}
                bg={p.status==="pendente"?"var(--warnbg)":p.status==="aceito"?"var(--okbg)":"var(--el)"}>
                {p.status}
              </Pill>
            </div>
            <p style={{ fontSize:13, marginBottom: isAdmin && p.status==="pendente" ? 10 : 0 }}>
              "{p.descricao}"
            </p>
            {isAdmin && p.status === "pendente" && (
              <div style={{ ...row, gap:8, marginTop:8 }}>
                <ABtn v="success" onClick={() => onResolve(p.id, "aceito")}  style={{ fontSize:12, padding:"4px 10px" }}>Aceitar</ABtn>
                <ABtn v="danger"  onClick={() => onResolve(p.id, "negado")}  style={{ fontSize:12, padding:"4px 10px" }}>Negar</ABtn>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── main export ───────────────────────────────────────────────────────────────
export default function MatchDetail({ match, champ, isAdmin, onBack, onUpdateMatch, onAddPedido }) {
  const isRiot     = RIOT_GAMES.has(champ.jogo);
  const [pedTxt, setPedTxt] = useState("");
  const [pedSent, setPedSent] = useState(false);

  const getParticipant = nome =>
    champ.participantes.find(p => p.nome === nome && p.estado === "aprovado");

  const p1 = getParticipant(match.time1);
  const p2 = getParticipant(match.time2);

  const handleUpdate  = patch => onUpdateMatch(champ.id, match.id, patch);
  const handleResolve = (pedId, status) => onUpdateMatch(champ.id, match.id, {
    pedidos: match.pedidos.map(p => p.id !== pedId ? p : { ...p, status }),
  });

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom:16, color:"var(--muted)",
        border:"none", background:"none", padding:0, fontSize:13 }}>
        ← Voltar ao campeonato
      </button>

      {/* header */}
      <div style={{ ...card, marginBottom:16 }}>
        <div style={{ ...row, justifyContent:"space-between", gap:12, marginBottom:4 }}>
          <p style={{ fontSize:12, color:"var(--muted)" }}>{champ.nome}</p>
          <MatchBadge status={match.status} />
        </div>
        <h2 style={{ fontSize:20, fontWeight:500, marginBottom:2 }}>
          {match.time1} <span style={{ color:"var(--muted)", fontSize:14 }}>vs</span> {match.time2}
        </h2>
        <p style={{ fontSize:13, color:"var(--muted)" }}>{match.fase}</p>
      </div>

      {/* scoreboard */}
      <ScoreBoard match={match} onUpdate={handleUpdate} isAdmin={isAdmin} champNome={champ.nome} />

      {/* availability window (only if scheduled) */}
      {match.status === "agendada" && p1?.tipo === "solo" && p2?.tipo === "solo" && (
        <AvailabilityWindow time1data={p1} time2data={p2} />
      )}

      {/* teams */}
      <SLabel style={{ marginBottom:10 }}>Composições</SLabel>
      <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <TeamCard
          nome={match.time1}
          jogadores={p1?.jogadores}
          capitao={p1?.capitao}
          isRiot={isRiot}
          isAdmin={isAdmin}
          side="left"
        />
        <TeamCard
          nome={match.time2}
          jogadores={p2?.jogadores}
          capitao={p2?.capitao}
          isRiot={isRiot}
          isAdmin={isAdmin}
          side="right"
        />
      </div>

      {/* observações públicas */}
      {match.observacoes && !isAdmin && (
        <div style={{ padding:"10px 14px", background:"var(--el)", borderRadius:8,
          border:"0.5px solid var(--bd)", fontSize:13, color:"var(--muted)", marginBottom:16 }}>
          <SLabel style={{ margin:"0 0 4px" }}>Observações</SLabel>
          {match.observacoes}
        </div>
      )}

      {/* pedidos */}
      <PedidosSection
        pedidos={match.pedidos || []}
        onResolve={handleResolve}
        isAdmin={isAdmin}
      />

      {/* jogador: abrir pedido */}
      {!isAdmin && (match.status === "ao_vivo" || match.status === "encerrada") && !pedSent && (
        <div style={{ marginTop:16 }}>
          <Divider mt={0} mb={12} />
          <SLabel>Solicitar correção de resultado</SLabel>
          <textarea value={pedTxt} onChange={e => setPedTxt(e.target.value)}
            placeholder="Descreva o problema com este resultado..." rows={3}
            style={{ marginBottom:8 }} />
          <ABtn v="warn" disabled={!pedTxt} onClick={() => {
            if (!pedTxt) return;
            const ped = { id: Date.now(), solicitante:"jogador", descricao:pedTxt, status:"pendente" };
            onUpdateMatch(champ.id, match.id, { pedidos:[...(match.pedidos||[]),ped] });
            setPedSent(true);
          }}>
            Enviar pedido
          </ABtn>
        </div>
      )}
      {pedSent && (
        <p style={{ marginTop:12, fontSize:12, color:"var(--ok)", padding:"8px 12px",
          background:"var(--okbg)", borderRadius:8 }}>
          Pedido enviado! O admin será notificado.
        </p>
      )}
    </div>
  );
}
