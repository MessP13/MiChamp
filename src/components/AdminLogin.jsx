import { useState } from "react";
import { ADMIN_PASS } from "../constants.js";
import { card } from "./ui.jsx";

export default function AdminLogin({ onLogin }) {
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState(false);
  const go = () => { if (pass === ADMIN_PASS) { onLogin(); } else { setErr(true); } };

  return (
    <div style={{ maxWidth:320, margin:"3rem auto" }}>
      <div style={card}>
        <p style={{ fontWeight:500, fontSize:16, marginBottom:4 }}>Acesso Admin</p>
        <p style={{ fontSize:13, color:"var(--muted)", marginBottom:20 }}>
          Senha: <code style={{ color:"var(--warn)", fontFamily:"monospace" }}>admin</code>
        </p>
        <input
          type="password" value={pass}
          onChange={e => { setPass(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && go()}
          placeholder="Senha"
          style={{ marginBottom:8 }}
        />
        {err && <p style={{ fontSize:12, color:"var(--err)", marginBottom:8 }}>Senha incorreta.</p>}
        <button onClick={go}
          style={{ width:"100%", borderColor:"var(--ac)", color:"var(--act)", background:"var(--acbg)" }}>
          Entrar
        </button>
      </div>
    </div>
  );
}
