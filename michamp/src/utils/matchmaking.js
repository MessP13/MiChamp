// src/utils/matchmaking.js
// MiChamp - Utilitários de matchmaking por disponibilidade

/**
 * Converte hora "HH:MM" para minutos desde 00:00
 */
export const toMin = h => {
  const [hh, mm] = (h || "00:00").split(":").map(Number);
  return hh * 60 + mm;
};

/**
 * Calcula score de compatibilidade entre duas disponibilidades
 * @param {Object} a - Disponibilidade do jogador/time A
 * @param {Object} b - Disponibilidade do jogador/time B
 * @returns {number} Score: dias em comum * 100 + minutos de janela sobreposta
 */
export const availScore = (a = {}, b = {}) => {
  const dias = (a.dias || []).filter(d => (b.dias || []).includes(d)).length;
  const s = Math.max(toMin(a.h_ini), toMin(b.h_ini));
  const e = Math.min(toMin(a.h_fim), toMin(b.h_fim));
  return dias * 100 + Math.max(0, e - s);
};

/**
 * Calcula janela de disponibilidade sobreposta entre dois participantes
 * @param {Object} a - Disponibilidade A
 * @param {Object} b - Disponibilidade B
 * @returns {Object|null} { dias: [], janela: "HH:MM–HH:MM" } ou null se sem overlap
 */
export const overlapWindow = (a = {}, b = {}) => {
  const dias = (a.dias || []).filter(d => (b.dias || []).includes(d));
  const hIni = Math.max(toMin(a.h_ini), toMin(b.h_ini));
  const hFim = Math.min(toMin(a.h_fim), toMin(b.h_fim));
  if (!dias.length || hFim <= hIni) return null;
  const fmt = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
  return { dias, janela: `${fmt(hIni)}–${fmt(hFim)}` };
};

/**
 * Sugere formação de times a partir de jogadores solo baseado em compatibilidade
 * @param {Array} solos - Lista de jogadores solo aprovados
 * @param {number} size - Tamanho alvo do time (ex: 5 para Valorant)
 * @param {Object} options - Opções: { allowLeftoverAsTeams, minTeamSize }
 * @returns {Object} { teams: [], leftover: [], actionRequired: boolean, suggestedAction: Object|null, stats: Object }
 */
export const suggestSoloTeams = (solos, size, options = {}) => {
  const { 
    allowLeftoverAsTeams = false,  // se true, solos restantes viram times 1v1
    minTeamSize = 2                // tamanho mínimo para formar time
  } = options;

  const used  = new Set();
  const teams = [];
  const pool  = [...solos];
  
  // Fase 1: Formar times completos com base em compatibilidade
  while (pool.filter(s => !used.has(s.id)).length >= size) {
    const pivot = pool.find(s => !used.has(s.id));
    if (!pivot) break;
    used.add(pivot.id);
    const team = [pivot];
    
    const rest = pool
      .filter(s => !used.has(s.id))
      .map(s => ({ s, score: availScore(pivot.disponibilidade, s.disponibilidade) }))
      .sort((a, b) => b.score - a.score);
      
    for (const { s } of rest) {
      if (team.length >= size) break;
      team.push(s);
      used.add(s.id);
    }
    
    if (team.length === size) {
      teams.push({
        players: team,
        compatibility: team.reduce((acc, p, i, arr) => {
          if (i === 0) return 0;
          return acc + availScore(arr[0].disponibilidade, p.disponibilidade);
        }, 0) / (team.length - 1)
      });
    }
  }
  
  const leftover = solos.filter(s => !used.has(s.id));
  
  // Fase 2: Decidir o que fazer com leftovers
  let actionRequired = false;
  let suggestedAction = null;
  
  if (leftover.length > 0) {
    actionRequired = true;
    
    if (leftover.length >= minTeamSize && !allowLeftoverAsTeams) {
      suggestedAction = {
        type: 'suggest_merge',
        message: `${leftover.length} jogador(es) sem time completo. Agrupar em time aleatório?`,
        options: [
          { id: 'merge', label: 'Agrupar como time', icon: '🔀' },
          { id: 'discard', label: 'Descartar solos', icon: '🗑️' },
          { id: 'postpone', label: 'Aguardar mais jogadores', icon: '⏳' }
        ]
      };
    } else if (allowLeftoverAsTeams) {
      // Converte leftovers em times 1v1 se permitido
      teams.push(...leftover.map(s => ({
        players: [s],
        isSoloTeam: true,
        compatibility: 0
      })));
      actionRequired = false;
    } else {
      suggestedAction = {
        type: 'leftover_info',
        message: `Jogadores sem time: ${leftover.map(s => s.nick).join(', ')}`,
        options: [
          { id: 'allow_solo_teams', label: 'Permitir como times 1v1', icon: '👤' },
          { id: 'discard', label: 'Descartar', icon: '🗑️' }
        ]
      };
    }
  }
  
  return { 
    teams: teams.map(t => t.players), 
    leftover,
    actionRequired,
    suggestedAction,
    stats: {
      total: solos.length,
      grouped: teams.reduce((acc, t) => acc + t.players.length, 0),
      leftover: leftover.length
    }
  };
};
