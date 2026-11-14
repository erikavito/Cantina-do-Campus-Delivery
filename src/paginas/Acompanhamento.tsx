import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { FormaPagamento } from '../tipos';
import { usePedidos } from '../contexto/PedidosContext';
import { etapasDoPedido, podeCancelar, situacaoDoPedido } from '../dominio/pedido';
import { formatarPreco } from '../servicos/formatacao';
import { EstadoVazio } from '../componentes/EstadoVazio';

const NOMES_PAGAMENTO: Record<FormaPagamento, string> = {
  pix: 'Pix',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
};

export function Acompanhamento() {
  const { numero } = useParams();
  const { buscarPedido, cancelarPedido } = usePedidos();
  const [agora, setAgora] = useState(() => new Date());
  const [aviso, setAviso] = useState('');

  const pedido = buscarPedido(Number(numero));
  const situacao = pedido ? situacaoDoPedido(pedido, agora) : null;
  const etapas = pedido ? etapasDoPedido(pedido.tipoEntrega) : [];
  const finalizado =
    situacao === null ||
    situacao === 'Cancelado' ||
    situacao === etapas[etapas.length - 1];

  useEffect(() => {
    if (finalizado) return;

    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, [finalizado]);

  if (!pedido || !situacao) {
    return (
      <section className="pagina-acompanhamento">
        <EstadoVazio mensagem="Pedido não encontrado." />
        <Link to="/pedidos">Ver meus pedidos</Link>
      </section>
    );
  }

  const numeroPedido = pedido.numero;
  const indiceAtual = etapas.indexOf(situacao);

  const aoCancelar = () => {
    const cancelou = cancelarPedido(numeroPedido);
    setAviso(cancelou ? '' : 'O pedido já está em preparo e não pode mais ser cancelado.');
  };

  return (
    <section className="pagina-acompanhamento">
      <h2>Pedido nº {pedido.numero}</h2>

      <p aria-live="polite">
        Situação: <strong>{situacao}</strong>
      </p>

      {situacao !== 'Cancelado' && (
        <ol className="etapas-pedido">
          {etapas.map((etapa, i) => (
            <li key={etapa} aria-current={i === indiceAtual ? 'step' : undefined}>
              {i < indiceAtual ? '✓ ' : ''}
              {etapa}
            </li>
          ))}
        </ol>
      )}

      <p>{pedido.tipoEntrega === 'entrega' ? 'Entrega em Balsas-MA' : 'Retirada no balcão'}</p>
      <p>Pagamento: {NOMES_PAGAMENTO[pedido.pagamento]}</p>
      <p>
        Total: <strong>{formatarPreco(pedido.resumo.total)}</strong>
      </p>

      {podeCancelar(pedido, agora) && (
        <button type="button" onClick={aoCancelar}>
          Cancelar pedido
        </button>
      )}

      {aviso && <p role="alert">{aviso}</p>}

      <Link to="/pedidos">Ver meus pedidos</Link>
    </section>
  );
}