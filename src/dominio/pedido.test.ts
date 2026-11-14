import { describe, it, expect } from 'vitest';
import { situacaoDoPedido, podeCancelar } from './pedido';
import type { Pedido, TipoEntrega } from '../tipos';

const RECEBIDO = '2026-11-09T19:00:00.000Z';

function criarPedido(tipoEntrega: TipoEntrega, cancelado = false): Pedido {
  return {
    numero: 1, nomeCliente: 'Ana', telefone: '99999999999',
    linhas: [], tipoEntrega, endereco: null, pagamento: 'cartao',
    trocoPara: null, recebidoEm: RECEBIDO, cancelado,
    resumo: { subtotal: 0, descontoCombo: 0, descontoPix: 0, taxaEntrega: 0, total: 0 },
  };
}

function depois(segundos: number): Date {
  return new Date(new Date(RECEBIDO).getTime() + segundos * 1000);
}

describe('situacaoDoPedido (C7)', () => {
  it('começa como Recebido', () => {
    expect(situacaoDoPedido(criarPedido('entrega'), depois(0))).toBe('Recebido');
  });
  it('passa para Em preparo depois de 10 segundos', () => {
    expect(situacaoDoPedido(criarPedido('entrega'), depois(15))).toBe('Em preparo');
  });
  it('na entrega, a terceira etapa é Saiu para entrega', () => {
    expect(situacaoDoPedido(criarPedido('entrega'), depois(25))).toBe('Saiu para entrega');
  });
  it('na retirada, a terceira etapa é Pronto para retirada', () => {
    expect(situacaoDoPedido(criarPedido('retirada'), depois(25))).toBe('Pronto para retirada');
  });
  it('para na última etapa', () => {
    expect(situacaoDoPedido(criarPedido('entrega'), depois(300))).toBe('Entregue');
  });
  it('pedido cancelado fica como Cancelado', () => {
    expect(situacaoDoPedido(criarPedido('entrega', true), depois(5))).toBe('Cancelado');
  });
});

describe('podeCancelar (C14)', () => {
  it('pode cancelar enquanto está Recebido', () => {
    expect(podeCancelar(criarPedido('entrega'), depois(5))).toBe(true);
  });
  it('não pode cancelar depois de Em preparo', () => {
    expect(podeCancelar(criarPedido('entrega'), depois(15))).toBe(false);
  });
});