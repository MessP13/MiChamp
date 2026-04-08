import { useState } from "react";
import { INIT_DATA } from "./data/sampleData.js";
import { STATUS_CFG } from "./constants.js";
import { computeStatus } from "./utils/dates.js";
import { fd } from "./utils/dates.js";
import { Chip, Badge, card, row } from "./components/ui.jsx";
import { FORMAT_LABEL } from "./constants.js";
import TimePanel from "./components/TimePanel.jsx";
import ChampDetail from "./components/ChampDetail.jsx";
import MatchDetail from "./components/MatchDetail.jsx";
import RegistrationForm from "./components/RegistrationForm.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import AdminLogin from "./components/AdminLogin.jsx";
import { isBetaMode } from './utils/betaTime.js';
import { storage } from './utils/storage.js';

// Inicializar prefixo de storage
if (isBetaMode()) {
  console.log('🧪 MiChamp BETA MODE ATIVO');
  window.__MICHAAMP_STORAGE_PREFIX = 'beta_';
}

// Usar storage em vez de localStorage direto em todo o app:
// Exemplo: const data = storage.get('michamp_data') || initialData;
const FILTER_KEYS = ["todos","inscricoes_abertas","em_andamento","em_breve","encerrado"];
const FILTER_LBL  = { todos:"Todos", inscricoes_abertas:"Inscrições", em_andamento:"Em andamento", em_breve:"Em breve", encerrado:"Encerrados" };

function ChampCard({ champ, status, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => onClick(champ)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...card, cursor:"pointer", borderColor: hov ? "var(--bdm)" : "var(--bd)", transition:"border-color 0.12s" }}>
      <div style={{ ...row, justifyContent:"space-between", gap:12, marginBottom:8 }}>
        <div>
          <p style={{ fontWeight:500, fontSize:15 }}>{champ.nome}</p>
          <p style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{champ.jogo} · {FORMAT_LABEL[champ.formato]}</p>
        </div>
        <Badge status={status} />
      </div>
      <div style={{ ...row, fontSize:12, color:"var(--muted)", gap:16 }}>
        <span>{champ.data_inicio} → {champ.data_fim}</span>
        <span style={{ marginLeft:"auto" }}>
          {champ.tipo === "por_time" ? "Times" : champ.tipo === "individual" ? "Individual" : "Misto"}
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [simDate, setSimDate] = useState(new Date(2026, 3, 1));
  const [data, setData]       = useState(INIT_DATA);
  const [view, setView]       = useState("home");   // home|detail|match|register|admin|admin_login
  const [selChampId, setSelChampId] = useState(null);
  const [selMatchId, setSelMatchId] = useState(null);
  const [filter, setFilter]   = useState("todos");
  const [isAdmin, setIsAdmin] = useState(false);

  const selChamp = selChampId ? data.find(c => c.id === selChampId) : null;
  const selMatch = selChamp && selMatchId ? selChamp.partidas?.find(m => m.id === selMatchId) : null;
  const selStatus = selChamp ? computeStatus(selChamp, simDate) : null;

  const enriched = data.map(c => ({ ...c, _st: computeStatus(c, simDate) }));
  const filtered = filter === "todos" ? enriched : enriched.filter(c => c._st === filter);

  // ── mutators ──────────────────────────────────────────────────────
  const addParticipant = p =>
    setData(prev => prev.map(c => c.id !== selChampId ? c : { ...c, participantes: [...c.participantes, p] }));

  const addPedido = (champId, ped) =>
    setData(prev => prev.map(c => c.id !== champId ? c : { ...c, pedidos: [...(c.pedidos || []), ped] }));

  const updateMatch = (champId, matchId, patch) =>
    setData(prev => prev.map(c => c.id !== champId ? c : {
      ...c,
      partidas: c.partidas.map(m => m.id !== matchId ? m : { ...m, ...patch }),
    }));

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"1.5rem 1rem", minHeight:"100vh" }}>
      <TimePanel simDate={simDate} setSimDate={setSimDate} />

      {/* ── Home ── */}
      {view === "home" && (
        <>
          <div style={{ ...row, justifyContent:"space-between", marginBottom:"1.5rem" }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:500, letterSpacing:"-0.01em" }}>MiChamp</h1>
              <p style={{ fontSize:13, color:"var(--muted)", marginTop:3 }}>Campeonatos de eSports</p>
            </div>
            <button onClick={() => setView(isAdmin ? "admin" : "admin_login")}
              style={{ fontSize:12, padding:"5px 12px",
                borderColor: isAdmin ? "var(--warn)" : "var(--bdm)",
                color: isAdmin ? "var(--warn)" : "var(--muted)" }}>
              {isAdmin ? "⚙ Admin" : "🔒 Admin"}
            </button>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:"1.25rem" }}>
            {FILTER_KEYS.map(s => <Chip key={s} label={FILTER_LBL[s]} active={filter === s} onClick={() => setFilter(s)} />)}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.length === 0 && <p style={{ color:"var(--muted)", fontSize:13 }}>Nenhum campeonato encontrado.</p>}
            {filtered.map(c => (
              <ChampCard key={c.id} champ={c} status={c._st} onClick={ch => { setSelChampId(ch.id); setView("detail"); }} />
            ))}
          </div>
        </>
      )}

      {/* ── Champ detail ── */}
      {view === "detail" && selChamp && (
        <ChampDetail
          champ={selChamp} status={selStatus} isAdmin={isAdmin}
          onBack={() => setView("home")}
          onInscricao={() => setView("register")}
          onPedido={addPedido}
          onSelectMatch={m => { setSelMatchId(m.id); setView("match"); }}
        />
      )}

      {/* ── Match detail ── */}
      {view === "match" && selChamp && selMatch && (
        <MatchDetail
          match={selMatch} champ={selChamp} isAdmin={isAdmin}
          onBack={() => setView("detail")}
          onUpdateMatch={updateMatch}
          onAddPedido={addPedido}
        />
      )}

      {/* ── Registration ── */}
      {view === "register" && selChamp && (
        <div style={card}>
          <RegistrationForm champ={selChamp}
            onClose={() => setView("detail")}
            onSubmit={p => { addParticipant(p); setView("detail"); }} />
        </div>
      )}

      {/* ── Admin login ── */}
      {view === "admin_login" && (
        <AdminLogin onLogin={() => { setIsAdmin(true); setView("admin"); }} />
      )}

      {/* ── Admin panel ── */}
      {view === "admin" && isAdmin && (
        <>
          <button onClick={() => setView("home")}
            style={{ marginBottom:16, color:"var(--muted)", border:"none", background:"none", padding:0, fontSize:13 }}>
            ← Início
          </button>
          <div style={card}>
            <AdminPanel data={data} setData={setData} simDate={simDate}
              onClose={() => { setIsAdmin(false); setView("home"); }}
              onUpdateMatch={updateMatch} />
          </div>
        </>
      )}
    </div>
  );
}
