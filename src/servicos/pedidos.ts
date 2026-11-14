import type { Pedido } from '../tipos';

// O que o checkout manda: o pedido sem número, sem horário e sem "cancelado".
// Esses três campos quem preenche é o "servidor".
export type NovoPedido = Omit<Pedido, 'numero' | 'recebidoEm' | 'cancelado'>;

const CHAVE_NUMERO = 'cantina:ultimoNumeroPedido';
const ESPERA_MS = 1500;

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function lerUltimoNumero(): number {
  try {
    const valor = Number(localStorage.getItem(CHAVE_NUMERO));
    return Number.isInteger(valor) && valor > 0 ? valor : 0;
  } catch {
    return 0;
  }
}

export async function enviarPedido(dados: NovoPedido): Promise<Pedido> {
  await esperar(ESPERA_MS);

  if (dados.nomeCliente.trim().toLowerCase() === 'erro') {
    throw new Error('Não foi possível enviar o pedido. Tente de novo.');
  }

  const numero = lerUltimoNumero() + 1;
  localStorage.setItem(CHAVE_NUMERO, String(numero));

  return {
    ...dados,
    numero,
    recebidoEm: new Date().toISOString(),
    cancelado: false,
  };
}