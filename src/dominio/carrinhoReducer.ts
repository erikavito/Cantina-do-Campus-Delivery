
import type {
  AcaoCarrinho,
  ItemCardapio,
  LinhaCarrinho,
} from '../tipos';

export interface ResumoCarrinho {
  quantidadeItens: number;
  subtotal: number;
}

function normalizarAdicionais(ids: string[]): string[] {
  return [...new Set(ids)].sort();
}

function mesmaConfiguracao(
  a: LinhaCarrinho,
  b: LinhaCarrinho
): boolean {
  return (
    a.itemId === b.itemId &&
    a.observacao.trim() === b.observacao.trim() &&
    normalizarAdicionais(a.adicionaisIds).join('|') ===
      normalizarAdicionais(b.adicionaisIds).join('|')
  );
}

/**
 * Reducer puro: não utiliza React, DOM ou armazenamento local.
 */
export function carrinhoReducer(
  estado: LinhaCarrinho[],
  acao: AcaoCarrinho
): LinhaCarrinho[] {
  switch (acao.tipo) {
    case 'adicionar': {
      const quantidade = Math.floor(acao.linha.quantidade);

      if (
        !acao.linha.itemId.trim() ||
        !Number.isFinite(quantidade) ||
        quantidade < 1
      ) {
        return estado;
      }

      const novaLinha: LinhaCarrinho = {
        ...acao.linha,
        adicionaisIds: normalizarAdicionais(
          acao.linha.adicionaisIds
        ),
        observacao: acao.linha.observacao.trim(),
        quantidade,
      };

      const indiceExistente = estado.findIndex((linha) =>
        mesmaConfiguracao(linha, novaLinha)
      );

      if (indiceExistente === -1) {
        return [...estado, novaLinha];
      }

      return estado.map((linha, indice) =>
        indice === indiceExistente
          ? {
              ...linha,
              quantidade: linha.quantidade + quantidade,
            }
          : linha
      );
    }

    case 'alterarQuantidade': {
      if (
        !Number.isInteger(acao.indice) ||
        acao.indice < 0 ||
        acao.indice >= estado.length ||
        !Number.isFinite(acao.quantidade)
      ) {
        return estado;
      }

      if (acao.quantidade <= 0) {
        return estado.filter(
          (_, indice) => indice !== acao.indice
        );
      }

      if (!Number.isInteger(acao.quantidade)) {
        return estado;
      }

      return estado.map((linha, indice) =>
        indice === acao.indice
          ? { ...linha, quantidade: acao.quantidade }
          : linha
      );
    }

    case 'remover': {
      if (
        !Number.isInteger(acao.indice) ||
        acao.indice < 0 ||
        acao.indice >= estado.length
      ) {
        return estado;
      }

      return estado.filter(
        (_, indice) => indice !== acao.indice
      );
    }

    case 'limpar':
      return [];

    default: {
      const acaoNaoTratada: never = acao;
      return acaoNaoTratada;
    }
  }
}

/**
 * Calcula a quantidade total e o subtotal em centavos.
 */
export function calcularResumoCarrinho(
  linhas: LinhaCarrinho[],
  catalogo: ItemCardapio[]
): ResumoCarrinho {
  const produtosPorId = new Map(
    catalogo.map((produto) => [produto.id, produto])
  );

  return linhas.reduce<ResumoCarrinho>(
    (resumo, linha) => {
      const produto = produtosPorId.get(linha.itemId);

      if (
        !produto ||
        !Number.isInteger(linha.quantidade) ||
        linha.quantidade <= 0
      ) {
        return resumo;
      }

      const adicionaisSelecionados = new Set(
        linha.adicionaisIds
      );

      const precoAdicionais = produto.adicionais
        .filter((adicional) =>
          adicionaisSelecionados.has(adicional.id)
        )
        .reduce(
          (total, adicional) => total + adicional.preco,
          0
        );

      return {
        quantidadeItens:
          resumo.quantidadeItens + linha.quantidade,
        subtotal:
          resumo.subtotal +
          (produto.preco + precoAdicionais) * linha.quantidade,
      };
    },
    {
      quantidadeItens: 0,
      subtotal: 0,
    }
  );
}
