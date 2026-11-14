import type { Categoria, ItemCardapio } from '../tipos';

export type FiltroCategoria = 'todas' | Categoria;

export type Ordenacao =
  | 'nome'
  | 'menor-preco'
  | 'maior-preco';

// Tira acentos e deixa minúsculo: "Água" e "agua" ficam iguais na busca
function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function filtrarEOrdenarItens(
  itens: ItemCardapio[],
  busca: string,
  categoria: FiltroCategoria,
  ordenacao: Ordenacao
): ItemCardapio[] {
  const termoBusca = normalizarTexto(busca);

  const resultado = itens.filter((item) => {
    const correspondeCategoria =
      categoria === 'todas' || item.categoria === categoria;

    const correspondeBusca = normalizarTexto(item.nome).includes(
      termoBusca
    );

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