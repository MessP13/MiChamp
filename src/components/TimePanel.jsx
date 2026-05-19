import { useState } from "react";
import { fd } from "../utils/dates.js";
import { row, card, SLabel, Pill } from "./ui.jsx";

export default function TimePanel({ simDate, setSimDate, alwaysShow = false, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  const hidden = !alwaysShow && import.meta.env.PROD && import.meta.env.VITE_ENABLE_SIM !== 'true';
  if (hidden) return null;

  const addDays = n => {
    const d = new Date(simDate);
    d.setDate(d.getDate() + n);
    setSimDate(d);
  };

  const jumps = [
    { l: "-7d", n: -7 }, { l: "-1d", n: -1 },
    { l: "+1d", n: 1 }, { l: "+7d", n: 7 }, { l: "+14d", n: 14 },
  ];

  return (
    <div style={{
      ...card,
      padding: 0,
      background: "var(--el)",
      overflow: "hidden",
      border: open ? "1px solid var(--warn)" : "1px solid var(--bdm)",
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          ...row,
          padding: "12px 16px",
          cursor: "pointer",
          justifyContent: "space-between",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ ...row, gap: 10 }}>
          <Pill clr="var(--warn)" bg="var(--warnbg)" className="pulse">
            ⏱ SIMULAÇÃO DE TEMPO
          </Pill>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
            {fd(simDate)}
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "var(--muted)", transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▼
        </span>
      </div>

      {open && (
        <div className="animate-in" style={{ padding: "16px", borderTop: "1px solid var(--bd)", background: "rgba(0,0,0,0.08)" }}>
          <SLabel>Ajuste Rápido</SLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {jumps.map(j => (
              <button
                key={j.l}
                onClick={() => addDays(j.n)}
                style={{
                  fontSize: "12px", padding: "6px 12px", minWidth: "50px",
                  borderColor: j.n < 0 ? "var(--err)" : "var(--ok)",
                  color: j.n < 0 ? "var(--err)" : "var(--ok)",
                  background: j.n < 0 ? "var(--errbg)" : "var(--okbg)",
                }}
              >
                {j.l}
              </button>
            ))}
            <button
              onClick={() => setSimDate(new Date(2026, 3, 1))}
              style={{ fontSize: "12px", padding: "6px 12px", marginLeft: "auto", color: "var(--muted)" }}
            >
              Resetar
            </button>
          </div>

          <div style={{ ...row, gap: 12 }}>
            <div style={{ flex: 1 }}>
              <SLabel>Data Específica</SLabel>
              <input
                type="date"
                defaultValue="2026-04-01"
                onChange={e => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-');
                    setSimDate(new Date(+y, +m - 1, +d));
                  }
                }}
                style={{ fontSize: "12px" }}
              />
            </div>
          </div>

          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "12px", fontStyle: "italic" }}>
            💡 Dica: Use este painel para testar a expiração de inscrições e o início de partidas.
          </p>
        </div>
      )}
    </div>
  );
}
