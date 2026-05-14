import { useState } from "react";
import { RIOT_GAMES, MATCH_STATUS_CFG, ROLE_ICONS } from "../constants.js";
import { overlapWindow } from "../utils/matchmaking.js";
import { MatchBadge, ABtn, Divider, SLabel, Pill, row, card } from "./ui.jsx";
import { MatchFormatSelector, MATCH_FORMATS } from "./MatchFormatSelector.jsx";

// ── helpers ──────────────────────────────────────────────────────────────────

function TeamCard({ nome, jogadores, capitao, isRiot, isAdmin, side }) {
  const accent = side === "left" ? "var(--ac)" : "var(--ok)";
  const bgGradient = side === "left" 
    ? "linear-gradient(135deg, rgba(255, 70, 85, 0.05) 0%, transparent 100%)"
    : "linear-gradient(135deg, rgba(74, 222, 128, 0.05) 0%, transparent 100%)";

  return (
    <div style={{ 
      flex: 1, 
      minWidth: "280px",
      background: "var(--el)", 
      backgroundImage: bgGradient,
      borderRadius: "12px", 
      padding: "16px",
      border: `1px solid var(--bd)`, 
      borderTop: `3px solid ${accent}`,
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
    }}>
      <div style={{ ...row, justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>{nome}</p>
        <Pill clr={accent} bg={`${accent}11`}>{jogadores?.length || 0} Jogadores</Pill>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(jogadores || []).map((j, i) => (
          <div key={i} style={{ 
            ...row, 
            justifyContent: "space-between",
            background: j.nick === capitao ? "var(--warnbg)" : "rgba(255,255,255,0.02)",
            borderRadius: "8px", 
            padding: "8px 12px",
            border: j.nick === capitao ? "1px solid var(--warn)" : "1px solid var(--bd)",
            transition: "transform 0.2s"
          }}>
            <div style={{ ...row, gap: 8 }}>
              {j.nick === capitao && <span title="Capitão / IGL" style={{ fontSize: 12, cursor: "help" }}>⚡</span>}
              <span style={{ fontSize: 13, fontWeight: j.nick === capitao ? 700 : 500 }}>{j.nick}</span>
              {(isAdmin || !isRiot) && (
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)", opacity: 0.7 }}>{j.riot_tag}</span>
              )}
            </div>
            {j.role && (
              <span style={{ 
                fontSize: 10, 
                fontWeight: 700,
                color: "var(--muted)", 
                textTransform: "uppercase",
                padding: "2px 6px",
                background: "rgba(0,0,0,0.3)", 
                borderRadius: "4px", 
                border: "1px solid var(--bd)" 
              }}>
                {ROLE_ICONS[j.role] || ""} {j.role}
              </span>
            )}
          </div>
        ))}
        {(!jogadores || jogadores.length === 0) && (
          <p style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", textAlign: "center", padding: "10px" }}>
            Aguardando escalação...
          </p>
        )}
      </div>
    </div>
  );
}

function ScoreBoard({ match, onUpdate, isAdmin }) {
  const format = MATCH_FORMATS[(match?.format || 'SINGLE').toUpperCase()] || MATCH_FORMATS.SINGLE;
  const readOnly = !isAdmin;
  
  const [liveInput, setLiveInput] = useState(match.placar_vivo || "");
  const [resultInput, setResultInput] = useState(match.resultado || "");
  const [seriesScores, setSeriesScores] = useState(match.score?.games || Array(format.maxGames || 3).fill(null));

  const updateScore = (newScore) => {
    onUpdate({ 
      score: { ...match.score, ...newScore },
      placar_vivo: format.needsSeries 
        ? `${newScore?.teamA || 0}-${newScore?.teamB || 0}` 
        : match.placar_vivo
    });
  };

  const renderScoreDisplay = () => {
    if (format.needsSeries) {
      const teamAWins = seriesScores.filter(g => g === 'A').length;
      const teamBWins = seriesScores.filter(g => g === 'B').length;
      const isFinished = teamAWins >= format.winCondition || teamBWins >= format.winCondition;
      
      return (
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 42, color: teamAWins > teamBWins ? "var(--ac)" : "var(--text)", textShadow: teamAWins > teamBWins ? "0 0 20px rgba(255, 70, 85, 0.4)" : "none" }}>{teamAWins}</span>
            <span style={{ color: "var(--muted)", fontSize: 20, fontWeight: 300 }}>VS</span>
            <span style={{ fontWeight: 800, fontSize: 42, color: teamBWins > teamAWins ? "var(--ok)" : "var(--text)", textShadow: teamBWins > teamAWins ? "0 0 20px rgba(74, 222, 128, 0.4)" : "none" }}>{teamBWins}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {Array.from({ length: format.maxGames }).map((_, i) => {
              const winner = seriesScores[i];
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (readOnly || isFinished) return;
                    const newScores = [...seriesScores];
                    newScores[i] = winner === 'A' ? 'B' : winner === 'B' ? null : 'A';
                    setSeriesScores(newScores);
                    const newA = newScores.filter(g => g === 'A').length;
                    const newB = newScores.filter(g => g === 'B').length;
                    updateScore({ games: newScores, teamA: newA, teamB: newB });
                  }}
                  disabled={readOnly || isFinished}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: "1px solid var(--bdm)",
                    background: winner === 'A' ? "var(--acbg)" : winner === 'B' ? "var(--okbg)" : "rgba(0,0,0,0.2)",
                    color: winner === 'A' ? "var(--act)" : winner === 'B' ? "var(--ok)" : "var(--muted)",
                    fontWeight: 700, fontSize: 13
                  }}
                >
                  {winner || i + 1}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input 
            type="text" 
            value={match.status === "encerrada" ? match.resultado?.split(/[-–]/)[0] : liveInput?.split('-')[0] || "0"} 
            onChange={e => {
              const [_, b] = (liveInput || "0-0").split('-');
              const newPlacar = `${e.target.value}-${b || 0}`;
              setLiveInput(newPlacar);
              if (match.status === "ao_vivo") onUpdate({ placar_vivo: newPlacar });
            }}
            disabled={readOnly || match.status !== "ao_vivo"}
            style={{ width: 70, height: 70, textAlign: "center", fontSize: 36, fontWeight: 800, background: "rgba(0,0,0,0.3)", border: "1px solid var(--bdm)", borderRadius: 12 }}
          />
          <span style={{ color: "var(--muted)", fontSize: 24, fontWeight: 300 }}>:</span>
          <input 
            type="text" 
            value={match.status === "encerrada" ? match.resultado?.split(/[-–]/)[1] : liveInput?.split('-')[1] || "0"} 
            onChange={e => {
              const [a] = (liveInput || "0-0").split('-');
              const newPlacar = `${a || 0}-${e.target.value}`;
              setLiveInput(newPlacar);
              if (match.status === "ao_vivo") onUpdate({ placar_vivo: newPlacar });
            }}
            disabled={readOnly || match.status !== "ao_vivo"}
            style={{ width: 70, height: 70, textAlign: "center", fontSize: 36, fontWeight: 800, background: "rgba(0,0,0,0.3)", border: "1px solid var(--bdm)", borderRadius: 12 }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: "var(--el)", borderRadius: 16, padding: "2rem", border: "1px solid var(--bdm)", marginBottom: 24, boxShadow: "inset 0 0 40px rgba(0,0,0,0.2)" }}>
      {isAdmin && <MatchFormatSelector match={match} onUpdate={onUpdate} readOnly={false} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginBottom: 24 }}>
        <div style={{ flex: 1, textAlign: "right" }}>
          <p style={{ fontWeight: 800, fontSize: 18 }}>{match.time1}</p>
          <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Time A</p>
        </div>
        <div style={{ minWidth: 200 }}>{renderScoreDisplay()}</div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <p style={{ fontWeight: 800, fontSize: 18 }}>{match.time2}</p>
          <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Time B</p>
        </div>
      </div>

      <div style={{ ...row, justifyContent: "center", gap: 10 }}>
        <MatchBadge status={match.status} />
        {match.transmissao && <Pill clr="#fff" bg="var(--ac)">📡 AO VIVO</Pill>}
        <Pill bg="var(--card)">{match.fase}</Pill>
      </div>

      {isAdmin && (
        <div style={{ marginTop: 24, padding: "1.25rem", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid var(--bd)" }}>
          <SLabel>Controles de Administração</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...row, gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 60 }}>Status:</span>
              {Object.entries(MATCH_STATUS_CFG).map(([k, v]) => (
                <button key={k} onClick={() => onUpdate({ status: k })}
                  style={{ fontSize: 11, padding: "4px 10px", borderColor: match.status === k ? v.clr : "var(--bdm)", background: match.status === k ? v.bg : "transparent", color: match.status === k ? v.clr : "var(--muted)" }}>
                  {v.label}
                </button>
              ))}
            </div>
            {match.status !== "encerrada" && (
              <div style={{ ...row, gap: 8 }}>
                <input value={resultInput} onChange={e => setResultInput(e.target.value)} placeholder={format.needsSeries ? "Nome do Vencedor" : "Resultado ex: 2-1"} style={{ fontSize: 13, flex: 1 }} />
                <ABtn v="success" onClick={() => {
                  if (format.needsSeries) {
                    onUpdate({ resultado: resultInput, status: "encerrada", placar_vivo: null, score: { ...match.score, finished: true } });
                  } else if (/^\d+[-–]\d+$/.test(resultInput.trim())) {
                    onUpdate({ resultado: resultInput.trim(), status: "encerrada", placar_vivo: null });
                  } else {
                    alert("Formato de resultado inválido. Use o padrão: 2-1 ou 13-5");
                  }
                }}>Finalizar Partida</ABtn>
              </div>
            )}
            <div style={{ ...row, gap: 8 }}>
              <button onClick={() => onUpdate({ transmissao: !match.transmissao })}
                style={{ fontSize: 12, padding: "4px 12px", borderColor: match.transmissao ? "var(--err)" : "var(--bdm)", background: match.transmissao ? "var(--errbg)" : "transparent", color: match.transmissao ? "var(--err)" : "var(--muted)" }}>
                {match.transmissao ? "📡 Transmissão: ON" : "📡 Transmissão: OFF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AvailabilityWindow({ time1data, time2data }) {
  if (!time1data || !time2data) return null;
  const win = overlapWindow(time1data.disponibilidade, time2data.disponibilidade);
  if (!win) return (
    <div style={{ padding: "12px 16px", background: "var(--errbg)", borderRadius: 12, border: "1px solid var(--err)", fontSize: 13, color: "var(--err)", marginBottom: 16 }}>
      ⚠️ Sem janela de disponibilidade em comum para esta partida.
    </div>
  );
  return (
    <div style={{ padding: "12px 16px", background: "var(--nfobg)", borderRadius: 12, border: "1px solid var(--bdm)", fontSize: 13, marginBottom: 16 }}>
      <SLabel style={{ color: "var(--nfo)", marginBottom: 6 }}>Janela de Disponibilidade Sugerida</SLabel>
      <div style={{ ...row, gap: 8, flexWrap: "wrap" }}>
        {win.dias.map(d => <Pill key={d} clr="var(--nfo)" bg="var(--nfobg)">{d}</Pill>)}
        <Pill clr="var(--act)" bg="var(--acbg)">{win.janela}</Pill>
      </div>
    </div>
  );
}

function PedidosSection({ pedidos = [], onResolve, isAdmin }) {
  const pending = pedidos.filter(p => p.status === "pendente");
  if (!pending.length && !isAdmin) return null;
  return (
    <div style={{ marginTop: 24 }}>
      <SLabel>Solicitações de Correção ({pending.length})</SLabel>
      {pedidos.length === 0 && <p style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Nenhuma solicitação até o momento.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pedidos.map(p => (
          <div key={p.id} style={{ background: "var(--el)", borderRadius: 12, padding: "12px 16px", border: `1px solid ${p.status === "pendente" ? "var(--warn)" : "var(--bd)"}` }}>
            <div style={{ ...row, justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--act)" }}>{p.solicitante}</span>
              <Pill clr={p.status === "pendente" ? "var(--warn)" : p.status === "aceito" ? "var(--ok)" : "var(--muted)"} bg={p.status === "pendente" ? "var(--warnbg)" : p.status === "aceito" ? "var(--okbg)" : "var(--el)"}>
                {p.status.toUpperCase()}
              </Pill>
            </div>
            <p style={{ fontSize: 13, lineHeight: "1.5" }}>"{p.descricao}"</p>
            {isAdmin && p.status === "pendente" && (
              <div style={{ ...row, gap: 8, marginTop: 12 }}>
                <ABtn v="success" onClick={() => onResolve(p.id, "aceito")}>Aceitar</ABtn>
                <ABtn v="danger" onClick={() => onResolve(p.id, "negado")}>Negar</ABtn>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MatchDetail({ match, champ, isAdmin, onBack, onUpdateMatch }) {
  const isRiot = RIOT_GAMES.has(champ.jogo);
  const [pedTxt, setPedTxt] = useState("");
  const [pedSent, setPedSent] = useState(false);

  const getParticipant = nome => champ.participantes.find(p => p.nome === nome && p.estado === "aprovado");
  const p1 = getParticipant(match.time1);
  const p2 = getParticipant(match.time2);

  const handleUpdate = patch => onUpdateMatch(champ.id, match.id, patch);
  const handleResolve = (pedId, status) => onUpdateMatch(champ.id, match.id, {
    pedidos: match.pedidos.map(p => p.id !== pedId ? p : { ...p, status }),
  });

  return (
    <div className="animate-in">
      <button onClick={onBack} style={{ marginBottom: 16, color: "var(--muted)", border: "none", background: "none", padding: 0, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
        ← Voltar ao campeonato
      </button>

      <div style={{ ...card, marginBottom: 16, borderLeft: "4px solid var(--ac)" }}>
        <div style={{ ...row, justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
          <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{champ.nome}</p>
          <MatchBadge status={match.status} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
          {match.time1} <span style={{ color: "var(--muted)", fontSize: 16, fontWeight: 300 }}>vs</span> {match.time2}
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>{match.fase}</p>
      </div>

      <ScoreBoard match={match} onUpdate={handleUpdate} isAdmin={isAdmin} />

      {match.status === "agendada" && p1?.tipo === "solo" && p2?.tipo === "solo" && (
        <AvailabilityWindow time1data={p1} time2data={p2} />
      )}

      <SLabel>Composições das Equipes</SLabel>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <TeamCard nome={match.time1} jogadores={p1?.jogadores} capitao={p1?.capitao} isRiot={isRiot} isAdmin={isAdmin} side="left" />
        <TeamCard nome={match.time2} jogadores={p2?.jogadores} capitao={p2?.capitao} isRiot={isRiot} isAdmin={isAdmin} side="right" />
      </div>

      {match.observacoes && !isAdmin && (
        <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid var(--bd)", fontSize: 13, color: "var(--text)", marginBottom: 24 }}>
          <SLabel style={{ marginBottom: 8 }}>Observações da Partida</SLabel>
          <p style={{ lineHeight: "1.6" }}>{match.observacoes}</p>
        </div>
      )}

      <PedidosSection pedidos={match.pedidos || []} onResolve={handleResolve} isAdmin={isAdmin} />

      {!isAdmin && (match.status === "ao_vivo" || match.status === "encerrada") && !pedSent && (
        <div style={{ marginTop: 32, padding: "1.5rem", background: "rgba(251, 191, 36, 0.03)", borderRadius: 12, border: "1px solid rgba(251, 191, 36, 0.15)" }}>
          <SLabel style={{ color: "var(--warn)" }}>Solicitar Correção de Resultado</SLabel>
          <textarea value={pedTxt} onChange={e => setPedTxt(e.target.value)} placeholder="Descreva o problema com este resultado..." rows={3} style={{ marginBottom: 12, background: "var(--card)" }} />
          <ABtn v="warn" disabled={!pedTxt} style={{ width: "100%", fontWeight: 700 }} onClick={() => {
            if (!pedTxt) return;
            const ped = { id: Date.now(), solicitante: "Jogador", descricao: pedTxt, status: "pendente" };
            onUpdateMatch(champ.id, match.id, { pedidos: [...(match.pedidos || []), ped] });
            setPedSent(true);
          }}>Enviar Contestação</ABtn>
        </div>
      )}
      {pedSent && (
        <div style={{ marginTop: 24, padding: "12px", background: "var(--okbg)", borderRadius: 12, border: "1px solid var(--ok)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--ok)", fontWeight: 600 }}>✓ Solicitação enviada! O administrador analisará em breve.</p>
        </div>
      )}
    </div>
  );
}
