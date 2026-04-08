export const generateMatches = (champ) => {
  const approved = champ.participantes.filter(p => p.estado === "aprovado");
  const names    = approved.map(p => p.nome);
  const matches  = [];
  let   mid      = 1;

  if (champ.formato === "mata_mata") {
    const n = names.length;
    for (let i = 0; i < Math.floor(n / 2); i++) {
      matches.push({
        id: mid++, fase: "Chave — Round 1",
        time1: names[i], time2: names[n - 1 - i],
        resultado: null, placar_vivo: null, status: "agendada",
        transmissao: false, observacoes: "", pedidos: [],
      });
    }
  } else if (champ.formato === "pontos_corridos") {
    let round = 1;
    let prev  = names.length % 2 === 0 ? [...names] : [...names, "BYE"];
    const rounds = prev.length - 1;
    for (let r = 0; r < rounds; r++) {
      const label = `Rodada ${round++}`;
      for (let i = 0; i < prev.length / 2; i++) {
        const t1 = prev[i], t2 = prev[prev.length - 1 - i];
        if (t1 !== "BYE" && t2 !== "BYE") {
          matches.push({
            id: mid++, fase: label,
            time1: t1, time2: t2,
            resultado: null, placar_vivo: null, status: "agendada",
            transmissao: false, observacoes: "", pedidos: [],
          });
        }
      }
      prev = [prev[0], ...prev.slice(2), prev[1]];
    }
  } else if (champ.formato === "suico") {
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.floor(shuffled.length / 2); i++) {
      matches.push({
        id: mid++, fase: "Rodada Swiss 1",
        time1: shuffled[i * 2], time2: shuffled[i * 2 + 1],
        resultado: null, placar_vivo: null, status: "agendada",
        transmissao: false, observacoes: "", pedidos: [],
      });
    }
  } else {
    const half = Math.ceil(names.length / 2);
    const gA = names.slice(0, half);
    const gB = names.slice(half);
    [[gA, "A"], [gB, "B"]].forEach(([grp, lbl]) => {
      for (let i = 0; i < grp.length; i++) {
        for (let j = i + 1; j < grp.length; j++) {
          matches.push({
            id: mid++, fase: `Grupo ${lbl}`,
            time1: grp[i], time2: grp[j],
            resultado: null, placar_vivo: null, status: "agendada",
            transmissao: false, observacoes: "", pedidos: [],
          });
        }
      }
    });
  }
  return matches;
};
