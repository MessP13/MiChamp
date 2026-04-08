// src/components/MatchFormatSelector.jsx
import { useState, useMemo } from "react";
import { row, Pill, ABtn } from "./ui.jsx";

export const MATCH_FORMATS = {
  SINGLE: { 
    id: 'single', 
    label: 'Partida Única', 
    icon: '🎯', 
    needsSeries: false,
    multiTeam: false,
    usesPoints: false,
    scoreTemplate: { type: 'simple', maxScore: null }
  },
  BO3: { 
    id: 'bo3', 
    label: 'Melhor de 3', 
    icon: '🥉', 
    needsSeries: true, 
    maxGames: 3, 
    winCondition: 2,
    multiTeam: false,
    usesPoints: false,
    scoreTemplate: { type: 'series', games: Array(3).fill(null) }
  },
  BO5: { 
    id: 'bo5', 
    label: 'Melhor de 5', 
    icon: '🏆', 
    needsSeries: true, 
    maxGames: 5, 
    winCondition: 3,
    multiTeam: false,
    usesPoints: false,
    scoreTemplate: { type: 'series', games: Array(5).fill(null) }
  },
  BATTLE_ROYALE: { 
    id: 'br', 
    label: 'Battle Royale', 
    icon: '👑', 
    needsSeries: false, 
    multiTeam: true,
    usesPoints: true,
    scoreTemplate: { type: 'br', rankings: [] }
  },
  ROUND_ROBIN: { 
    id: 'rr', 
    label: 'Pontos Corridos', 
    icon: '📊', 
    needsSeries: false,
    multiTeam: false,
    usesPoints: true,
    scoreTemplate: { type: 'points', teamA: 0, teamB: 0, draws: 0 }
  }
};

export const MatchFormatSelector = ({ match, onUpdate, readOnly = false }) => {
  const [format, setFormat] = useState(match?.format || 'single');
  const config = MATCH_FORMATS[format.toUpperCase()] || MATCH_FORMATS.SINGLE;

  const handleFormatChange = (newFormat) => {
    if (readOnly) return;
    const newConfig = MATCH_FORMATS[newFormat.toUpperCase()];
    onUpdate({ 
      format: newFormat, 
      score: newConfig.scoreTemplate,
      status: match?.status === 'encerrada' ? 'encerrada' : 'agendada'
    });
  };

  return (
    <div style={{ background:"var(--el)", borderRadius:10, padding:"12px 14px", border:"0.5px solid var(--bdm)", marginBottom:12 }}>
      {!readOnly && (
        <>
          <p style={{ fontSize:11, color:"var(--muted)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>
            Formato da Partida
          </p>
          <div style={{ ...row, gap:6, flexWrap:"wrap", marginBottom:12 }}>
            {Object.values(MATCH_FORMATS).map(f => (
              <button
                key={f.id}
                onClick={() => handleFormatChange(f.id)}
                style={{ 
                  fontSize:12, 
                  padding:"4px 10px",
                  borderColor: format === f.id ? "var(--ac)" : "var(--bdm)",
                  background: format === f.id ? "var(--acbg)" : "transparent",
                  color: format === f.id ? "var(--act)" : "var(--muted)",
                  display:"flex", alignItems:"center", gap:4
                }}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      
      {config.needsSeries && (
        <Pill clr="var(--nfo)" bg="var(--nfobg)">
          {config.icon} Primeiro a {config.winCondition} vitórias vence
        </Pill>
      )}
      {config.multiTeam && (
        <Pill clr="var(--warn)" bg="var(--warnbg)">
          {config.icon} Múltiplos times • Ranking por posição
        </Pill>
      )}
      {config.usesPoints && !config.multiTeam && (
        <Pill clr="var(--ok)" bg="var(--okbg)">
          {config.icon} Sistema de pontos: Vitória=3, Empate=1, Derrota=0
        </Pill>
      )}
    </div>
  );
};
