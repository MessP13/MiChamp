import { useState } from "react";
import { FORMAT_LABEL } from "../constants.js";
import { Badge, ABtn, Divider, SLabel, card, row } from "./ui.jsx";
import { ParticipantList, StandingsTable, BracketView } from "./views.jsx";
import MatchList from "./MatchList.jsx";

export default function ChampDetail({ champ, status, isAdmin, onBack, onInscricao, onPedido, onSelectMatch }) {
  const [pedidoTxt, setPedidoTxt] = useState("");
  const [sent, setSent]           = useState(false);

  const showPart       = status === "inscricoes_abertas" || status === "em_breve";
  const showProbBracket= status === "em_breve" && champ.bracket?.provavel;
  const showTable      = status === "em_andamento" && champ.tabela;
  const showBracket    = (status === "em_andamento" || status === "encerrado") && champ.bracket && !champ.bracket?.provavel;
  const showMatches    = champ.partidas?.length > 0;

  return (
    <div>
      <button onClick={onBack}
        style={{ marginBottom:16, color:"var(--muted)", border:"none", background:"none", padding:0, fontSize:13 }}>
        ← Voltar
      </button>
      <div style={card}>
        <div style={{ ...row, justifyContent:"space-between", gap:12, marginBottom:4 }}>
          <h2 style={{ fontSize:20, fontWeight:500 }}>{champ.nome}</h2>
          <Badge status={status} />
        </div>
        <p style={{ fontSize:13, color:"var(--muted)" }}>
          {champ.jogo} · {FORMAT_LABEL[champ.formato]} · {champ.tipo==="por_time"?"Por times":champ.tipo==="individual"?"Individual":"Misto"}
        </p>
        <Divider mt={12} mb={12} />
        <div style={{ ...row, gap:20, fontSize:13, color:"var(--muted)", flexWrap:"wrap" }}>
          <span>Início: <span style={{ color:"var(--text)", fontWeight:500 }}>{champ.data_inicio}</span></span>
          <span>Fim: <span style={{ color:"var(--text)", fontWeight:500 }}>{champ.data_fim}</span></span>
          <span style={{ marginLeft:"auto", fontSize:11 }}>Inscrições fecham {champ.dias_para_fechar}d antes</span>
        </div>

        {showPart && <ParticipantList participantes={champ.participantes} jogo={champ.jogo} isAdmin={isAdmin} />}
        {showProbBracket && <BracketView bracket={champ.bracket} provavel />}
        {showTable && <StandingsTable tabela={champ.tabela} />}
        {showBracket && <BracketView bracket={champ.bracket} />}
        {showMatches && <MatchList partidas={champ.partidas} onSelectMatch={onSelectMatch} />}

        {status === "inscricoes_abertas" && !isAdmin && (
          <button onClick={onInscricao}
            style={{ marginTop:20, width:"100%", padding:"10px 0", fontWeight:500,
              borderColor:"var(--ac)", color:"var(--act)", background:"var(--acbg)" }}>
            Inscrever-se neste campeonato
          </button>
        )}
        {status === "em_breve" && (
          <p style={{ marginTop:16, fontSize:12, padding:"8px 12px", background:"var(--el)",
            borderRadius:8, color:"var(--muted)", textAlign:"center" }}>
            Inscrições encerradas · Aguardando início
          </p>
        )}

        {(status === "em_andamento" || status === "encerrado") && !isAdmin && !sent && (
          <div style={{ marginTop:20 }}>
            <Divider mt={0} mb={12} />
            <SLabel>Solicitar correção</SLabel>
            <textarea value={pedidoTxt} onChange={e => setPedidoTxt(e.target.value)}
              placeholder="Descreva o problema..." rows={3} style={{ marginBottom:8 }} />
            <ABtn v="warn" disabled={!pedidoTxt} onClick={() => {
              if (!pedidoTxt) return;
              onPedido(champ.id, { id:Date.now(), champId:champ.id, partida_desc:"Geral", solicitante:"jogador", descricao:pedidoTxt, status:"pendente" });
              setSent(true);
            }}>
              Enviar pedido
            </ABtn>
          </div>
        )}
        {sent && (
          <p style={{ marginTop:12, fontSize:12, color:"var(--ok)", padding:"8px 12px", background:"var(--okbg)", borderRadius:8 }}>
            Pedido enviado!
          </p>
        )}
      </div>
    </div>
  );
}
