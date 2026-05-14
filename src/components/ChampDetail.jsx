import { useState } from "react";
import { FORMAT_LABEL } from "../constants.js";
import { Badge, ABtn, Divider, SLabel, card, row } from "./ui.jsx";
import { ParticipantList, StandingsTable, BracketView } from "./views.jsx";
import MatchList from "./MatchList.jsx";

export default function ChampDetail({ champ, status, isAdmin, onBack, onInscricao, onPedido, onSelectMatch }) {
  const [pedidoTxt, setPedidoTxt] = useState("");
  const [sent, setSent]           = useState(false);

  const showPart        = status === "inscricoes_abertas" || status === "em_breve";
  const showProbBracket = status === "em_breve" && champ.bracket?.provavel;
  const showTable       = status === "em_andamento" && champ.tabela;
  const showBracket     = (status === "em_andamento" || status === "encerrado") && champ.bracket && !champ.bracket?.provavel;
  const showMatches     = champ.partidas?.length > 0;

  return (
    <div className="animate-in">
      <button 
        onClick={onBack}
        style={{ 
          marginBottom: 16, 
          color: "var(--muted)", 
          border: "none", 
          background: "none", 
          padding: 0, 
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 6
        }}
      >
        ← Voltar para a lista
      </button>

      <div style={card}>
        <header style={{ marginBottom: "1.5rem" }}>
          <div style={{ ...row, justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{champ.nome}</h2>
            <Badge status={status} />
          </div>
          <div style={{ ...row, gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "var(--ac)", fontWeight: 600 }}>{champ.jogo}</span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>•</span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{FORMAT_LABEL[champ.formato]}</span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>•</span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {champ.tipo === "por_time" ? "Competição por Equipes" : champ.tipo === "individual" ? "Individual" : "Misto"}
            </span>
          </div>
        </header>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
          gap: "1rem",
          background: "rgba(0,0,0,0.15)",
          padding: "1rem",
          borderRadius: "12px",
          marginBottom: "1.5rem",
          border: "1px solid var(--bd)"
        }}>
          <div>
            <SLabel>Início</SLabel>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{champ.data_inicio}</p>
          </div>
          <div>
            <SLabel>Término Estimado</SLabel>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{champ.data_fim}</p>
          </div>
          <div>
            <SLabel>Encerramento Inscrições</SLabel>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--warn)" }}>{champ.dias_para_fechar}d antes</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {showPart && <ParticipantList participantes={champ.participantes} jogo={champ.jogo} isAdmin={isAdmin} />}
          {showProbBracket && <BracketView bracket={champ.bracket} provavel />}
          {showTable && <StandingsTable tabela={champ.tabela} />}
          {showBracket && <BracketView bracket={champ.bracket} />}
          {showMatches && <MatchList partidas={champ.partidas} onSelectMatch={onSelectMatch} />}
        </div>

        {status === "inscricoes_abertas" && !isAdmin && (
          <button 
            onClick={onInscricao}
            style={{ 
              marginTop: 24, 
              width: "100%", 
              padding: "12px 0", 
              fontWeight: 700,
              fontSize: "14px",
              borderColor: "var(--ac)", 
              color: "#fff", 
              background: "var(--ac)",
              boxShadow: "0 4px 14px rgba(255, 70, 85, 0.4)"
            }}
          >
            Garantir Minha Vaga
          </button>
        )}

        {status === "em_breve" && (
          <div style={{ 
            marginTop: 24, 
            padding: "12px", 
            background: "var(--el)",
            borderRadius: 12, 
            color: "var(--muted)", 
            textAlign: "center",
            border: "1px dashed var(--bdm)"
          }}>
            <p style={{ fontSize: 13, fontWeight: 500 }}>Inscrições encerradas • O torneio começa em breve</p>
          </div>
        )}

        {(status === "em_andamento" || status === "encerrado") && !isAdmin && !sent && (
          <div style={{ marginTop: 32, padding: "1.25rem", background: "rgba(251, 191, 36, 0.03)", borderRadius: 12, border: "1px solid rgba(251, 191, 36, 0.15)" }}>
            <SLabel style={{ color: "var(--warn)" }}>Solicitar Suporte / Correção</SLabel>
            <textarea 
              value={pedidoTxt} 
              onChange={e => setPedidoTxt(e.target.value)}
              placeholder="Ex: Resultado da Rodada 2 está incorreto..." 
              rows={3} 
              style={{ marginBottom: 12, background: "var(--card)" }} 
            />
            <ABtn 
              v="warn" 
              disabled={!pedidoTxt} 
              style={{ width: "100%", fontWeight: 600 }}
              onClick={() => {
                if (!pedidoTxt) return;
                onPedido(champ.id, { 
                  id: Date.now(), 
                  champId: champ.id, 
                  partida_desc: "Geral", 
                  solicitante: "Jogador", 
                  descricao: pedidoTxt, 
                  status: "pendente" 
                });
                setSent(true);
              }}
            >
              Enviar Solicitação
            </ABtn>
          </div>
        )}

        {sent && (
          <div style={{ 
            marginTop: 24, 
            padding: "12px", 
            background: "var(--okbg)", 
            borderRadius: 12, 
            border: "1px solid var(--ok)",
            textAlign: "center"
          }}>
            <p style={{ fontSize: 13, color: "var(--ok)", fontWeight: 600 }}>✓ Solicitação enviada com sucesso!</p>
          </div>
        )}
      </div>
    </div>
  );
}
