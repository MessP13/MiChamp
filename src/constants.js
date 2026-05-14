export const RIOT_GAMES = new Set(["Valorant", "League of Legends"]);

export const TEAM_SIZE = {
  "Valorant": 5,
};

export const ROLES_BY_GAME = {
  "Valorant":          ["Duelista","Iniciador","Sentinela","Controlador","Flex"],
};

export const ROLE_ICONS = {
  "Iniciador":  "⚡",
  "Sentinela":  "🛡️",
  "Controlador": "⏫",
  "Duelista":    "✖️",
  "Flex":        "🔄",
};

export const FORMAT_LABEL = {
  mata_mata:        "Mata-mata",
  pontos_corridos:  "Pontos corridos",
  grupos_mata_mata: "Grupos + Mata-mata",
  suico:            "Suíço",
};

export const STATUS_CFG = {
  inscricoes_abertas: { label: "Inscrições abertas", clr: "#4ade80", bg: "rgba(74,222,128,0.1)"  },
  em_breve:           { label: "Em breve",            clr: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
  em_andamento:       { label: "Em andamento",         clr: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  encerrado:          { label: "Encerrado",            clr: "#606080", bg: "rgba(96,96,128,0.1)"   },
};

export const MATCH_STATUS_CFG = {
  agendada:    { label: "Agendada",    clr: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
  ao_vivo:     { label: "Ao vivo",     clr: "#f87171", bg: "rgba(248,113,113,0.13)"},
  encerrada:   { label: "Encerrada",   clr: "#4ade80", bg: "rgba(74,222,128,0.1)"  },
  adiada:      { label: "Adiada",      clr: "#6464a0", bg: "rgba(100,100,160,0.1)" },
};

export const DIAS_SEMANA  = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
export const FREQUENCIAS  = ["Diária","Semanal","Quinzenal"];
export const ADMIN_PASS   = "admin";
