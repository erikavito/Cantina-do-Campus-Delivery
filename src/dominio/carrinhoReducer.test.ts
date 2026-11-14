
import { describe, expect, it } from 'vitest';
import type { ItemCardapio, LinhaCarrinho } from '../tipos';
import {
  carrinhoReducer,
  calcularResumoCarrinho,
} from './carrinhoReducer';

const catalogo: ItemCardapio[] = [
  {
    id: 'coxinha',
    nome: 'Coxinha de Frango',
    categoria: 'salgado',
    preco: 700,
    disponivel: true,
    descricao: 'Coxinha de frango.',
    adicionais: [
      { id: 'catupiry', nome: 'Catupiry', preco: 200 },
      { id: 'cheddar', nome: 'Cheddar', preco: 200 },
    ],
  },
];

const linha: LinhaCarrinho = {
  itemId: 'coxinha',
  adicionaisIds: [],
  observacao: '',
  quantidade: 1,
};

describe('carrinhoReducer', () => {
  it('adiciona produto ao carrinho vazio', () => {
    const resultado = carrinhoReducer([], {
      tipo: 'adicionar',
      linha,
    });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].quantidade).toBe(1);
  });

  it('soma quantidades de configurações iguais', () => {
    const resultado = carrinhoReducer([linha], {
      tipo: 'adicionar',
      linha: { ...linha, quantidade: 2 },
    });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].quantidade).toBe(3);
  });

  it('mantém linhas separadas quando os adicionais são diferentes', () => {
    const resultado = carrinhoReducer([linha], {
      tipo: 'adicionar',
      linha: { ...linha, adicionaisIds: ['catupiry'] },
    });

    expect(resultado).toHaveLength(2);
  });

  it('mantém linhas separadas quando as observações são diferentes', () => {
    const resultado = carrinhoReducer([linha], {
      tipo: 'adicionar',
      linha: { ...linha, observacao: 'Sem molho' },
    });

    expect(resultado).toHaveLength(2);
  });

  it('remove adicionais repetidos e organiza seus IDs', () => {
    const resultado = carrinhoReducer([], {
      tipo: 'adicionar',
      linha: {
        ...linha,
        adicionaisIds: ['cheddar', 'catupiry', 'catupiry'],
      },
    });

    expect(resultado[0].adicionaisIds).toEqual([
      'catupiry',
      'cheddar',
    ]);
  });

  it('ignora quantidade zero ou negativa', () => {
    expect(
      carrinhoReducer([], {
        tipo: 'adicionar',
        linha: { ...linha, quantidade: 0 },
      })
    ).toEqual([]);

    expect(
      carrinhoReducer([], {
        tipo: 'adicionar',
        linha: { ...linha, quantidade: -1 },
      })
    ).toEqual([]);
  });

  it('altera a quantidade de uma linha existente', () => {
    const resultado = carrinhoReducer([linha], {
      tipo: 'alterarQuantidade',
      indice: 0,
      quantidade: 5,
    });

    expect(resultado[0].quantidade).toBe(5);
  });

  it('remove a linha quando a quantidade chega a zero', () => {
    const resultado = carrinhoReducer([linha], {
      tipo: 'alterarQuantidade',
      indice: 0,
      quantidade: 0,
    });

    expect(resultado).toHaveLength(0);
  });

  it('remove somente o item no índice informado', () => {
    const estado = [
      linha,
      { ...linha, observacao: 'Sem molho' },
    ];

    const resultado = carrinhoReducer(estado, {
      tipo: 'remover',
      indice: 0,
    });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].observacao).toBe('Sem molho');
  });

  it('ignora índices inválidos', () => {
    const estado = [linha];

    expect(
      carrinhoReducer(estado, {
        tipo: 'remover',
        indice: 5,
      })
    ).toBe(estado);

    expect(
      carrinhoReducer(estado, {
        tipo: 'alterarQuantidade',
        indice: -1,
        quantidade: 3,
      })
    ).toBe(estado);
  });

  it('limpa todas as linhas do carrinho', () => {
    expect(
      carrinhoReducer([linha], { tipo: 'limpar' })
    ).toEqual([]);
  });

  it('não modifica o estado anterior', () => {
    const estado = [{ ...linha }];

    carrinhoReducer(estado, {
      tipo: 'alterarQuantidade',
      indice: 0,
      quantidade: 4,
    });

    expect(estado[0].quantidade).toBe(1);
  });
});

describe('calcularResumoCarrinho', () => {
  it('calcula quantidade e subtotal em centavos', () => {
    const linhas: LinhaCarrinho[] = [
      {
        ...linha,
        adicionaisIds: ['catupiry'],
        quantidade: 2,
      },
    ];

    const resultado = calcularResumoCarrinho(
      linhas,
      catalogo
    );

    expect(resultado).toEqual({
      quantidadeItens: 2,
      subtotal: 1800,
    });
  });

  it('ignora produtos que não existem no catálogo', () => {
    const resultado = calcularResumoCarrinho(
      [{ ...linha, itemId: 'produto-inexistente' }],
      catalogo
    );

    expect(resultado).toEqual({
      quantidadeItens: 0,
      subtotal: 0,
    });
  });
});
