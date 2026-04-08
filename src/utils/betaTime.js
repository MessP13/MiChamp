//src/utils/betaTime.js
const BETA_MULTIPLIER = 1440; // 1 minuto real = 1 dia beta (1440 minutos)

export const isBetaMode = () => {
  return window.location.pathname.startsWith('/beta') || 
         import.meta.env.VITE_ENV === 'beta';
};

export const toBetaDate = (realDate = new Date()) => {
  if (!isBetaMode()) return realDate;
  
  const beta = new Date(realDate);
  // Acelerar: cada minuto real = 1 dia beta
  const minutesSinceEpoch = Math.floor(realDate.getTime() / 60000);
  const betaMinutes = minutesSinceEpoch * BETA_MULTIPLIER;
  return new Date(betaMinutes * 60000);
};

export const useBetaTime = () => {
  // Hook simplificado - em produção real, usar useEffect com intervalo
  return {
    now: toBetaDate(new Date()),
    format: (date, opts) => new Intl.DateTimeFormat('pt-BR', opts).format(date),
    isBeta: isBetaMode()
  };
};
