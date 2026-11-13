
import type { Categoria, ItemCardapio } from '../tipos';

export type FiltroCategoria = 'todas' | Categoria;

export type Ordenacao =
  | 'nome'
  | 'menor-preco'
  | 'maior-preco';

export function filtrarEOrdenarItens(
  itens: ItemCardapio[],
  busca: string,
  categoria: FiltroCategoria,
  ordenacao: Ordenacao
): ItemCardapio[] {
  const termoBusca = busca.toLocaleLowerCase('pt-BR');

  const resultado = itens.filter((item) => {
    const correspondeCategoria =
      categoria === 'todas' || item.categoria === categoria;

    const correspondeBusca = item.nome
      .toLocaleLowerCase('pt-BR')
      .includes(termoBusca);

    return correspondeCategoria && correspondeBusca;
  });

  return resultado.sort((a, b) => {
    if (ordenacao === 'menor-preco') {
      return a.preco - b.preco;
    }

    if (ordenacao === 'maior-preco') {
      return b.preco - a.preco;
    }

    return a.nome.localeCompare(b.nome, 'pt-BR');
  });
}
