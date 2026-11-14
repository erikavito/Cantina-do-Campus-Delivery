import { describe, it, expect } from 'vitest';
import { prepararPedirDeNovo } from './pedirDeNovo';
import type { ItemCardapio, LinhaCarrinho, Pedido } from '../tipos';

const COXINHA: ItemCardapio = {
  id: 'coxinha', nome: 'Coxinha de frango', categoria: 'salgado', preco: 650,
  disponivel: true, descricao: '',
  adicionais: [{ id: 'catupiry', nome: 'Catupiry', preco: 150 }],
};
const SUCO: ItemCardapio = {
  id: 'suco', nome: 'Suco de cupuaçu', categoria: 'bebida', preco: 700,
  disponivel: true, descricao: '', adicionais: [],
};
const BRIGADEIRO_ESGOTADO: ItemCardapio = {
  id: 'brigadeiro', nome: 'Brigadeiro', categoria: 'doce', preco: 250,
  disponivel: false, descricao: '', adicionais: [],
};
const CATALOGO = [COXINHA, SUCO, BRIGADEIRO_ESGOTADO];

function linha(itemId: string, adicionaisIds: string[] = [], quantidade = 1): LinhaCarrinho {
  return { itemId, adicionaisIds, observacao: '', quantidade };
}

function pedidoCom(linhas: LinhaCarrinho[]): Pedido {
  return {
    numero: 1, nomeCliente: 'Ana', telefone: '99999999999', linhas,
    tipoEntrega: 'retirada', endereco: null, pagamento: 'cartao', trocoPara: null,
    recebidoEm: '2026-11-09T19:00:00.000Z', cancelado: false,
    resumo: { subtotal: 0, descontoCombo: 0, descontoPix: 0, taxaEntrega: 0, total: 0 },
  };
}

describe('prepararPedirDeNovo (C8 e C15)', () => {
  it('repõe todas as linhas quando tudo está disponível', () => {
    const r = prepararPedirDeNovo(
      pedidoCom([linha('coxinha', ['catupiry'], 2), linha('suco')]), CATALOGO
    );
    expect(r.linhas).toEqual([linha('coxinha', ['catupiry'], 2), linha('suco')]);
    expect(r.ficaramDeFora).toEqual([]);
  });

  it('deixa de fora o item esgotado e avisa o nome', () => {
    const r = prepararPedirDeNovo(pedidoCom([linha('coxinha'), linha('brigadeiro')]), CATALOGO);
    expect(r.linhas.map((l) => l.itemId)).toEqual(['coxinha']);
    expect(r.ficaramDeFora).toEqual(['Brigadeiro']);
  });

  it('deixa de fora o item que saiu do cardápio', () => {
    const r = prepararPedirDeNovo(pedidoCom([linha('pastel')]), CATALOGO);
    expect(r.linhas).toEqual([]);
    expect(r.ficaramDeFora).toEqual(['Item que saiu do cardápio']);
  });

  it('remove adicional que não existe mais no cardápio', () => {
    const r = prepararPedirDeNovo(pedidoCom([linha('coxinha', ['catupiry', 'cheddar'])]), CATALOGO);
    expect(r.linhas[0].adicionaisIds).toEqual(['catupiry']);
  });
});