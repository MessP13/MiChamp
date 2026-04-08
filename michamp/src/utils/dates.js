export const pd = s => {
  const [d, m, y] = s.split('/');
  return new Date(+y, +m - 1, +d);
};

export const fd = d =>
  `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;

export const computeStatus = (champ, sim) => {
  if (champ.status_override) return champ.status_override;
  const start = pd(champ.data_inicio);
  const end   = pd(champ.data_fim);
  const close = new Date(start);
  close.setDate(close.getDate() - champ.dias_para_fechar);
  if (sim > end)    return "encerrado";
  if (sim >= start) return "em_andamento";
  if (sim >= close) return "em_breve";
  return "inscricoes_abertas";
};
