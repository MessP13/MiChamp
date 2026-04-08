# MiChamp

Plataforma de gerenciamento de campeonatos de eSports.

## Setup rápido

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo desenvolvimento
npm run dev

# 3. Build para produção
npm run build
```

## Deploy no Vercel

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Deploy
vercel
```

Ou conecte o repositório GitHub diretamente em vercel.com → New Project.

## Estrutura

```
src/
├── App.jsx                  # Roteador principal
├── constants.js             # Constantes globais
├── main.jsx                 # Ponto de entrada
├── data/
│   └── sampleData.js        # Dados de exemplo
├── utils/
│   ├── dates.js             # Datas e cálculo de status
│   ├── matchmaking.js       # Disponibilidade e sugestão de grupos
│   └── championship.js      # Geração de partidas por formato
├── styles/
│   └── dark.css             # Tema escuro global
└── components/
    ├── ui.jsx               # Primitivos (Badge, Chip, ABtn, etc.)
    ├── TimePanel.jsx        # Painel de simulação de tempo
    ├── ChampDetail.jsx      # Tela de detalhe do campeonato
    ├── MatchDetail.jsx      # Tela de detalhe da partida ← NOVA
    ├── MatchList.jsx        # Lista de partidas clicável
    ├── ParticipantList.jsx  # Lista de participantes
    ├── views.jsx            # BracketView + StandingsTable + ParticipantList
    ├── RegistrationForm.jsx # Formulário de inscrição
    ├── AdminPanel.jsx       # Painel admin (5 abas)
    └── AdminLogin.jsx       # Login do admin
```

## Credenciais de teste

- Admin: senha `admin`

## Status dos campeonatos

O status é calculado automaticamente pela data simulada no Painel de Tempo:

| Status | Condição |
|--------|----------|
| Inscrições abertas | Antes de `data_inicio - dias_para_fechar` |
| Em breve | Entre o fechamento e `data_inicio` |
| Em andamento | Entre `data_inicio` e `data_fim` |
| Encerrado | Após `data_fim` |

Admins podem fazer override manual de qualquer status.
