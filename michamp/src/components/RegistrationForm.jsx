import { useState } from "react";
import { RIOT_GAMES, ROLES_BY_GAME, DIAS_SEMANA, FREQUENCIAS } from "../constants.js";
import { Chip, Divider, SLabel, row } from "./ui.jsx";

export default function RegistrationForm({ champ, onClose, onSubmit }) {
  const roles  = ROLES_BY_GAME[champ.jogo] || [];
  const isRiot = RIOT_GAMES.has(champ.jogo);
  const [form, setForm] = useState({
    tipo_inscricao: champ.tipo === "por_time" ? "time" : champ.tipo === "individual" ? "solo" : "solo",
    nick:"", riot_tag:"", nome_time:"", role:"",
    dias:[], h_ini:"19:00", h_fim:"22:00", freq:"Semanal",
  });
  const [enviado, setEnviado] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleDia = d => set("dias", form.dias.includes(d) ? form.dias.filter(x => x !== d) : [...form.dias, d]);
  const valid = form.nick && form.riot_tag && form.dias.length > 0;

  if (enviado) return (
    <div style={{ textAlign:"center", padding:"2.5rem 1rem" }}>
      <div style={{ fontSize:36, marginBottom:12 }}>✓</div>
      <p style={{ fontWeight:500, marginBottom:6 }}>Inscrição enviada!</p>
      <p style={{ color:"var(--muted)", fontSize:13, marginBottom:20 }}>Aguardando aprovação do administrador.</p>
      <button onClick={onClose}>Voltar</button>
    </div>
  );

  return (
    <div>
      <div style={{ ...row, justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:500 }}>Inscrição</h2>
          <p style={{ fontSize:13, color:"var(--muted)", marginTop:2 }}>{champ.nome} · {champ.jogo}</p>
        </div>
        <button onClick={onClose} style={{ fontSize:12, color:"var(--muted)" }}>Cancelar</button>
      </div>

      {champ.tipo === "misto" && (
        <div style={{ marginBottom:18 }}>
          <SLabel>Tipo de inscrição</SLabel>
          <div style={{ display:"flex", gap:8 }}>
            {["solo","time"].map(t => (
              <button key={t} onClick={() => set("tipo_inscricao", t)} style={{ flex:1,
                borderColor: form.tipo_inscricao===t ? "var(--ac)" : "var(--bdm)",
                background:  form.tipo_inscricao===t ? "var(--acbg)" : "transparent",
                color:       form.tipo_inscricao===t ? "var(--act)" : "var(--muted)",
                fontWeight:  form.tipo_inscricao===t ? 500 : 400 }}>
                {t === "solo" ? "Jogador Solo" : "Representar Time"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", display:"block", marginBottom:5 }}>Nick *</label>
            <input value={form.nick} onChange={e => set("nick", e.target.value)} placeholder="Seu nick" />
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", display:"block", marginBottom:5 }}>
              {isRiot ? "Riot Tag *" : "Tag *"}
            </label>
            <input value={form.riot_tag} onChange={e => set("riot_tag", e.target.value)} placeholder={isRiot ? "#BR1" : "#TAG"} />
            {isRiot && <p style={{ fontSize:11, color:"var(--warn)", marginTop:4 }}>Não exibida publicamente</p>}
          </div>
        </div>

        {form.tipo_inscricao === "time" && (
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", display:"block", marginBottom:5 }}>Nome do time</label>
            <input value={form.nome_time} onChange={e => set("nome_time", e.target.value)} placeholder="Nome do time" />
          </div>
        )}

        {roles.length > 0 && (
          <div>
            <SLabel>Role</SLabel>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {roles.map(r => <Chip key={r} label={r} active={form.role === r} onClick={() => set("role", r)} />)}
            </div>
          </div>
        )}

        <Divider mt={4} mb={4} />
        <p style={{ fontSize:14, fontWeight:500 }}>Disponibilidade</p>

        <div>
          <SLabel>Dias *</SLabel>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {DIAS_SEMANA.map(d => <Chip key={d} label={d} active={form.dias.includes(d)} onClick={() => toggleDia(d)} ok />)}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", display:"block", marginBottom:5 }}>Início</label>
            <input type="time" value={form.h_ini} onChange={e => set("h_ini", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", display:"block", marginBottom:5 }}>Fim</label>
            <input type="time" value={form.h_fim} onChange={e => set("h_fim", e.target.value)} />
          </div>
        </div>

        <div>
          <SLabel>Frequência</SLabel>
          <div style={{ display:"flex", gap:6 }}>
            {FREQUENCIAS.map(f => <Chip key={f} label={f} active={form.freq === f} onClick={() => set("freq", f)} />)}
          </div>
        </div>

        {valid && (
          <div style={{ fontSize:12, color:"var(--muted)", padding:"8px 12px", background:"var(--el)", borderRadius:8, border:"0.5px solid var(--bd)" }}>
            Disponível: {form.dias.join(", ")} · {form.h_ini}–{form.h_fim} · {form.freq}
          </div>
        )}

        <button disabled={!valid}
          onClick={() => {
            if (!valid) return;
            onSubmit({
              id: Date.now(), tipo: form.tipo_inscricao,
              nick: form.nick, nome: form.nome_time || form.nick,
              riot_tag: form.riot_tag, role: form.role,
              estado: "pendente", capitao: null, jogadores: [],
              disponibilidade: { dias: form.dias, h_ini: form.h_ini, h_fim: form.h_fim, freq: form.freq },
            });
            setEnviado(true);
          }}
          style={{ padding:"10px 0", fontWeight:500, borderColor:"var(--ac)", color:"var(--act)", background:"var(--acbg)" }}>
          Enviar inscrição
        </button>
      </div>
    </div>
  );
}
