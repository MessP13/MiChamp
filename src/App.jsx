import { useState, useEffect } from "react";
import { INIT_DATA } from "./data/sampleData.js";
import { STATUS_CFG } from "./constants.js";
import { computeStatus } from "./utils/dates.js";
import { Chip, Badge, Pill, SLabel, ThemeToggle, Modal, card, row } from "./components/ui.jsx";
import { FORMAT_LABEL } from "./constants.js";
import TimePanel from "./components/TimePanel.jsx";
import ChampDetail from "./components/ChampDetail.jsx";
import MatchDetail from "./components/MatchDetail.jsx";
import RegistrationForm from "./components/RegistrationForm.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import AdminLogin from "./components/AdminLogin.jsx";
import { isBetaMode } from './utils/betaTime.js';

if (isBetaMode()) console.log('🧪 MiChamp BETA MODE ATIVO');

const FILTER_KEYS = ["todos", "inscricoes_abertas", "em_andamento", "em_breve", "encerrado"];
const FILTER_LBL  = {
  todos: "Todos",
  inscricoes_abertas: "Inscrições",
  em_andamento: "Em andamento",
  em_breve: "Em breve",
  encerrado: "Encerrados",
};

// ── Admin quick bar (shown on home/time_lab when admin is logged in) ──────────
function AdminQuickBar({ data, onOpenPanel, onLogout }) {
  const pending = data.flatMap(c => c.participantes.filter(p => p.estado === 'pendente'));
  const corrections = data.flatMap(c => [
    ...(c.pedidos || []).filter(p => p.status === 'pendente'),
    ...(c.partidas || []).flatMap(m => (m.pedidos || []).filter(p => p.status === 'pendente')),
  ]);

  return (
    <div style={{
      background: 'var(--warnbg)', border: '1px solid rgba(251,191,36,0.3)',
      borderRadius: 12, padding: '10px 16px', marginTop: 12,
      ...row, justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
    }}>
      <div style={{ ...row, gap: 10, flexWrap: 'wrap' }}>
        <Pill clr="var(--warn)" bg="var(--warnbg)">⚡ ADMIN ATIVO</Pill>
        {pending.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--warn)' }}>
            {pending.length} inscrição{pending.length > 1 ? 'ões' : ''} pendente{pending.length > 1 ? 's' : ''}
          </span>
        )}
        {corrections.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--err)' }}>
            {corrections.length} correção{corrections.length > 1 ? 'ões' : ''} pendente{corrections.length > 1 ? 's' : ''}
          </span>
        )}
        {pending.length === 0 && corrections.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Nenhuma ação pendente</span>
        )}
      </div>
      <div style={{ ...row, gap: 8 }}>
        <button
          onClick={onOpenPanel}
          style={{ fontSize: 12, padding: '5px 12px', borderColor: 'var(--warn)', color: 'var(--warn)', background: 'var(--warnbg)' }}
        >
          ⚙ Painel Completo
        </button>
        <button
          onClick={onLogout}
          style={{ fontSize: 12, padding: '5px 12px', color: 'var(--muted)' }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}

// ── Championship card ─────────────────────────────────────────────────────────
function ChampCard({ champ, status, onClick, isAdmin, onSetOverride }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...card,
        cursor: "pointer",
        borderColor: hov ? "var(--bdm)" : "var(--bd)",
        transition: "border-color 0.12s, box-shadow 0.12s",
        borderLeft: isAdmin ? '3px solid var(--warn)' : undefined,
      }}
    >
      {/* Main clickable area */}
      <div onClick={() => onClick(champ)}>
        <div style={{ ...row, justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
          <div>
            <p style={{ fontWeight: 500, fontSize: 15 }}>{champ.nome}</p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              {champ.jogo} · {FORMAT_LABEL[champ.formato]}
            </p>
          </div>
          <Badge status={status} />
        </div>
        <div style={{ ...row, fontSize: 12, color: "var(--muted)", gap: 16 }}>
          <span>{champ.data_inicio} → {champ.data_fim}</span>
          <span style={{ marginLeft: "auto" }}>
            {champ.tipo === "por_time" ? "Times" : champ.tipo === "individual" ? "Individual" : "Misto"}
          </span>
        </div>
      </div>

      {/* Admin inline controls */}
      {isAdmin && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            marginTop: 10, paddingTop: 10,
            borderTop: '1px solid var(--bd)',
            ...row, gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>Override:</span>
          <select
            value={champ.status_override || ''}
            onChange={e => onSetOverride(champ.id, e.target.value)}
            style={{ fontSize: 11, padding: '3px 8px', flex: 1, maxWidth: 220 }}
          >
            <option value="">Automático ({STATUS_CFG[status]?.label})</option>
            {Object.keys(STATUS_CFG).map(s => (
              <option key={s} value={s}>{STATUS_CFG[s].label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('michamp_theme') || 'dark');
  const [simDate, setSimDate] = useState(new Date(2026, 3, 1));
  const [data, setData]       = useState(INIT_DATA);
  // views: home | detail | match | register | time_lab
  const [view, setView]       = useState("home");
  const [selChampId, setSelChampId] = useState(null);
  const [selMatchId, setSelMatchId] = useState(null);
  const [filter, setFilter]   = useState("todos");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin]         = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('michamp_theme', theme);
  }, [theme]);

  const selChamp = selChampId ? data.find(c => c.id === selChampId) : null;
  const selMatch = selChamp && selMatchId ? selChamp.partidas?.find(m => m.id === selMatchId) : null;
  const selStatus = selChamp ? computeStatus(selChamp, simDate) : null;

  const enriched = data.map(c => ({ ...c, _st: computeStatus(c, simDate) }));
  const filtered = filter === "todos" ? enriched : enriched.filter(c => c._st === filter);

  // ── Mutators ──────────────────────────────────────────────────────────────
  const addParticipant = p =>
    setData(prev => prev.map(c => c.id !== selChampId ? c : { ...c, participantes: [...c.participantes, p] }));

  const addPedido = (champId, ped) =>
    setData(prev => prev.map(c => c.id !== champId ? c : { ...c, pedidos: [...(c.pedidos || []), ped] }));

  const updateMatch = (champId, matchId, patch) =>
    setData(prev => prev.map(c => c.id !== champId ? c : {
      ...c,
      partidas: (c.partidas || []).map(m => m.id !== matchId ? m : { ...m, ...patch }),
    }));

  const setStatusOverride = (champId, val) =>
    setData(prev => prev.map(c => c.id !== champId ? c : { ...c, status_override: val || null }));

  const isOnHomeScreen = view === 'home' || view === 'time_lab';

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <header className="animate-in" style={{ marginBottom: "2rem" }}>
        <div style={{ ...row, justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ ...row, gap: 12, alignItems: 'flex-start' }}>
            <div>
              <h1
                onClick={() => setView('home')}
                style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ac)", cursor: 'pointer' }}
              >
                MiChamp
              </h1>
              <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
                The Future of eSports Tournaments
              </p>
            </div>
            {isBetaMode() && (
              <Pill clr="#fff" bg="linear-gradient(135deg, #ff4655, #ff858f)">🧪 BETA</Pill>
            )}
          </div>

          <div style={{ ...row, gap: 8 }}>
            <ThemeToggle theme={theme} onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
            {!isAdmin ? (
              <button
                onClick={() => setShowLogin(true)}
                style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, border: "1px solid var(--bdm)" }}
              >
                🔒 Admin
              </button>
            ) : (
              <button
                onClick={() => setShowAdminPanel(true)}
                style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, borderColor: 'var(--warn)', color: 'var(--warn)', background: 'var(--warnbg)' }}
              >
                ⚙ Admin
              </button>
            )}
          </div>
        </div>

        {/* Admin quick bar — visible on any home-type screen when admin */}
        {isAdmin && isOnHomeScreen && (
          <AdminQuickBar
            data={data}
            onOpenPanel={() => setShowAdminPanel(true)}
            onLogout={() => setIsAdmin(false)}
          />
        )}
      </header>

      {/* ── Time Panel ── */}
      <div className="animate-in" style={{ animationDelay: "0.05s" }}>
        <TimePanel
          simDate={simDate}
          setSimDate={setSimDate}
          alwaysShow={view === 'time_lab'}
          defaultOpen={view === 'time_lab'}
        />
      </div>

      {/* ── Main content ── */}
      <main className="animate-in" style={{ animationDelay: "0.15s", marginTop: "1.75rem" }}>

        {/* Home / Time Lab */}
        {isOnHomeScreen && (
          <>
            {view === 'time_lab' && (
              <div style={{ ...row, marginBottom: 16, gap: 8 }}>
                <button
                  onClick={() => setView('home')}
                  style={{ fontSize: 12, padding: '5px 12px', color: 'var(--muted)', border: 'none', background: 'none' }}
                >
                  ← Sair do Simulador
                </button>
                <Pill clr="var(--nfo)" bg="var(--nfobg)">🔬 Modo Simulador</Pill>
              </div>
            )}

            <div style={{ ...row, justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <SLabel style={{ margin: 0 }}>Campeonatos Disponíveis</SLabel>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.25rem" }}>
              {FILTER_KEYS.map(s => (
                <Chip key={s} label={FILTER_LBL[s]} active={filter === s} onClick={() => setFilter(s)} />
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.length === 0 && (
                <div style={{ ...card, textAlign: "center", padding: "3rem 1rem", color: "var(--muted)" }}>
                  <p>Nenhum campeonato encontrado para este filtro.</p>
                </div>
              )}
              {filtered.map(c => (
                <ChampCard
                  key={c.id}
                  champ={c}
                  status={c._st}
                  isAdmin={isAdmin}
                  onSetOverride={setStatusOverride}
                  onClick={ch => { setSelChampId(ch.id); setView("detail"); }}
                />
              ))}
            </div>
          </>
        )}

        {/* Championship detail */}
        {view === "detail" && selChamp && (
          <ChampDetail
            champ={selChamp} status={selStatus} isAdmin={isAdmin}
            onBack={() => setView("home")}
            onInscricao={() => setView("register")}
            onPedido={addPedido}
            onSelectMatch={m => { setSelMatchId(m.id); setView("match"); }}
          />
        )}

        {/* Match detail */}
        {view === "match" && selChamp && selMatch && (
          <MatchDetail
            match={selMatch} champ={selChamp} isAdmin={isAdmin}
            onBack={() => setView("detail")}
            onUpdateMatch={updateMatch}
            onAddPedido={addPedido}
          />
        )}

        {/* Registration */}
        {view === "register" && selChamp && (
          <div style={card}>
            <RegistrationForm
              champ={selChamp}
              onClose={() => setView("detail")}
              onSubmit={p => { addParticipant(p); setView("detail"); }}
            />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ marginTop: "4rem", textAlign: "center", borderTop: "1px solid var(--bd)", padding: "2rem 0" }}>
        <p style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.05em" }}>
          &copy; 2026 MiChamp • Tournament Management System
        </p>
        {view !== 'time_lab' && (
          <button
            onClick={() => setView('time_lab')}
            style={{ marginTop: 8, fontSize: 10, color: 'var(--faint)', border: 'none', background: 'none', opacity: 0.6 }}
          >
            🔬 Simulador de Tempo
          </button>
        )}
      </footer>

      {/* ── Login Modal ── */}
      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <AdminLogin onLogin={() => { setIsAdmin(true); setShowLogin(false); }} />
        </Modal>
      )}

      {/* ── Admin Panel Modal ── */}
      {showAdminPanel && (
        <Modal onClose={() => setShowAdminPanel(false)} wide>
          <AdminPanel
            data={data}
            setData={setData}
            simDate={simDate}
            onClose={() => { setIsAdmin(false); setShowAdminPanel(false); }}
            onUpdateMatch={updateMatch}
          />
        </Modal>
      )}
    </div>
  );
}
