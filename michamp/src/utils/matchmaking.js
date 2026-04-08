export const toMin = h => {
  const [hh, mm] = (h || "00:00").split(":").map(Number);
  return hh * 60 + mm;
};

export const availScore = (a = {}, b = {}) => {
  const dias = (a.dias || []).filter(d => (b.dias || []).includes(d)).length;
  const s = Math.max(toMin(a.h_ini), toMin(b.h_ini));
  const e = Math.min(toMin(a.h_fim), toMin(b.h_fim));
  return dias * 100 + Math.max(0, e - s);
};

export const overlapWindow = (a = {}, b = {}) => {
  const dias = (a.dias || []).filter(d => (b.dias || []).includes(d));
  const hIni = Math.max(toMin(a.h_ini), toMin(b.h_ini));
  const hFim = Math.min(toMin(a.h_fim), toMin(b.h_fim));
  if (!dias.length || hFim <= hIni) return null;
  const fmt = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
  return { dias, janela: `${fmt(hIni)}–${fmt(hFim)}` };
};

export const suggestSoloTeams = (solos, size) => {
  const used  = new Set();
  const teams = [];
  const pool  = [...solos];
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
    if (team.length === size) teams.push(team);
  }
  return { teams, leftover: solos.filter(s => !used.has(s.id)) };
};
