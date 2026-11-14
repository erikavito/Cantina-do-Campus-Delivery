import type { Pedido, SituacaoPedido } from '../tipos';

const ETAPAS_ENTREGA: SituacaoPedido[] = [
  'Recebido', 'Em preparo', 'Saiu para entrega', 'Entregue',
];
const ETAPAS_RETIRADA: SituacaoPedido[] = [
  'Recebido', 'Em preparo', 'Pronto para retirada', 'Retirado',
];

export const SEGUNDOS_POR_ETAPA = 10;

export function situacaoDoPedido(pedido: Pedido, agora: Date): SituacaoPedido {
  if (pedido.cancelado) return 'Cancelado';

  const etapas = pedido.tipoEntrega === 'entrega' ? ETAPAS_ENTREGA : ETAPAS_RETIRADA;
  const passou = (agora.getTime() - new Date(pedido.recebidoEm).getTime()) / 1000;
  const indice = Math.floor(passou / SEGUNDOS_POR_ETAPA);

  return etapas[Math.min(Math.max(indice, 0), etapas.length - 1)];
}

export function podeCancelar(pedido: Pedido, agora: Date): boolean {
  return situacaoDoPedido(pedido, agora) === 'Recebido';
}