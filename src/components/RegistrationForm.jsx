import { useState } from "react";
import { RIOT_GAMES, ROLES_BY_GAME, DIAS_SEMANA, FREQUENCIAS, ROLE_ICONS } from "../constants.js";
import { Chip, Divider, SLabel, row, ABtn } from "./ui.jsx";

export default function RegistrationForm({ champ, onClose, onSubmit }) {
  const roles  = ROLES_BY_GAME[champ.jogo] || [];
  const isRiot = RIOT_GAMES.has(champ.jogo);
  const [form, setForm] = useState({
    tipo_inscricao: champ.tipo === "por_time" ? "time" : champ.tipo === "individual" ? "solo" : "solo",
    nick: "", 
    riot_tag: "", 
    nome_time: "", 
    role: "",
    dias: [], 
    h_ini: "19:00", 
    h_fim: "22:00", 
    freq: "Semanal",
  });
  const [enviado, setEnviado] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleDia = d => set("dias", form.dias.includes(d) ? form.dias.filter(x => x !== d) : [...form.dias, d]);
  
  const valid = form.nick && form.riot_tag && form.dias.length > 0;

  if (enviado) return (
    <div className="animate-in" style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <div style={{ 
        fontSize: "48px", 
        marginBottom: "1rem", 
        background: "var(--okbg)", 
        width: "80px", 
        height: "80px", 
        borderRadius: "50%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        margin: "0 auto 1.5rem",
        color: "var(--ok)",
        border: "1px solid var(--ok)"
      }}>✓</div>
      <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "0.5rem" }}>Inscrição Recebida!</h2>
      <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "2rem", maxWidth: "300px", margin: "0 auto 2rem" }}>
        Sua solicitação foi enviada com sucesso. O administrador analisará seus dados em breve.
      </p>
      <ABtn onClick={onClose} style={{ width: "100%", padding: "12px" }}>Concluir</ABtn>
    </div>
  );

  return (
    <div className="animate-in">
      <header style={{ marginBottom: "2rem" }}>
        <div style={{ ...row, justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.01em" }}>Formulário de Inscrição</h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
              Torneio: <span style={{ color: "var(--ac)", fontWeight: 600 }}>{champ.nome}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ fontSize: "20px", color: "var(--muted)", background: "none", border: "none", padding: "4px" }}
          >
            &times;
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Step 1: Identidade */}
        <section style={{ background: "rgba(255,255,255,0.02)", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--bd)" }}>
          <SLabel style={{ color: "var(--ac)" }}>Etapa 1: Identificação</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>In-game Nick *</label>
                <input 
                  value={form.nick} 
                  onChange={e => set("nick", e.target.value)} 
                  placeholder="Ex: TenZ" 
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  {isRiot ? "Riot ID (Tag) *" : "Tag Identificadora *"}
                </label>
                <input 
                  value={form.riot_tag} 
                  onChange={e => set("riot_tag", e.target.value)} 
                  placeholder={isRiot ? "#NA1" : "#000"} 
                />
              </div>
            </div>
            
            {isRiot && (
              <p style={{ fontSize: "11px", color: "var(--muted)", fontStyle: "italic" }}>
                🔒 Sua Tag é usada apenas para validação e não será exibida publicamente.
              </p>
            )}

            {champ.tipo === "misto" && (
              <div style={{ marginTop: "0.5rem" }}>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "8px" }}>Como você irá participar?</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["solo", "time"].map(t => (
                    <button 
                      key={t} 
                      onClick={() => set("tipo_inscricao", t)} 
                      style={{ 
                        flex: 1,
                        padding: "10px",
                        fontSize: "13px",
                        borderColor: form.tipo_inscricao === t ? "var(--ac)" : "var(--bdm)",
                        background: form.tipo_inscricao === t ? "var(--acbg)" : "rgba(0,0,0,0.1)",
                        color: form.tipo_inscricao === t ? "var(--act)" : "var(--muted)",
                        fontWeight: form.tipo_inscricao === t ? 700 : 400 
                      }}
                    >
                      {t === "solo" ? "Individual (Solo)" : "Representar Time"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.tipo_inscricao === "time" && (
              <div className="animate-in">
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Nome do Time / Organização</label>
                <input 
                  value={form.nome_time} 
                  onChange={e => set("nome_time", e.target.value)} 
                  placeholder="Ex: Sentinels" 
                />
              </div>
            )}

            {roles.length > 0 && (
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "8px" }}>Sua Role Principal</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {roles.map(r => (
                    <Chip key={r} label={`${ROLE_ICONS[r] || ""} ${r}`} active={form.role === r} onClick={() => set("role", r)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <Divider mt={0} mb={0} />

        {/* Step 2: Disponibilidade */}
        <section style={{ background: "rgba(255,255,255,0.02)", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--bd)" }}>
          <SLabel style={{ color: "var(--ac)" }}>Etapa 2: Horários & Disponibilidade</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "8px" }}>Dias em que pode jogar *</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {DIAS_SEMANA.map(d => (
                  <Chip key={d} label={d} active={form.dias.includes(d)} onClick={() => toggleDia(d)} ok />
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Disponível de:</label>
                <input type="time" value={form.h_ini} onChange={e => set("h_ini", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Até:</label>
                <input type="time" value={form.h_fim} onChange={e => set("h_fim", e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "8px" }}>Frequência Preferencial</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {FREQUENCIAS.map(f => (
                  <Chip key={f} label={f} active={form.freq === f} onClick={() => set("freq", f)} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer style={{ marginTop: "1rem" }}>
          <ABtn 
            disabled={!valid}
            style={{ 
              width: "100%", 
              padding: "14px", 
              fontSize: "14px", 
              fontWeight: 800,
              background: valid ? "var(--ac)" : "var(--el)",
              borderColor: valid ? "var(--ac)" : "var(--bdm)",
              color: valid ? "#fff" : "var(--muted)",
              boxShadow: valid ? "0 4px 14px rgba(255, 70, 85, 0.4)" : "none",
              cursor: valid ? "pointer" : "not-allowed"
            }}
            onClick={() => {
              if (!valid) return;
              onSubmit({
                id: Date.now(), 
                tipo: form.tipo_inscricao,
                nick: form.nick, 
                nome: form.nome_time || form.nick,
                riot_tag: form.riot_tag, 
                role: form.role,
                estado: "pendente", 
                capitao: null, 
                jogadores: [],
                disponibilidade: { dias: form.dias, h_ini: form.h_ini, h_fim: form.h_fim, freq: form.freq },
              });
              setEnviado(true);
            }}
          >
            Confirmar Inscrição
          </ABtn>
          {!valid && (
            <p style={{ textAlign: "center", fontSize: "11px", color: "var(--muted)", marginTop: "12px" }}>
              * Preencha todos os campos obrigatórios para continuar.
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
