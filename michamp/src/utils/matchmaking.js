// src/utils/matchmaking.js - SUBSTITUIR a função suggestSoloTeams por esta:

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
