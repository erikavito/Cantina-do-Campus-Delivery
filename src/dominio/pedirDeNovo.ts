import type { ItemCardapio, LinhaCarrinho, Pedido } from '../tipos';

export interface ResultadoPedirDeNovo {
  linhas: LinhaCarrinho[];
  ficaramDeFora: string[];
}

export function prepararPedirDeNovo(
  pedido: Pedido,
  catalogo: ItemCardapio[]
): ResultadoPedirDeNovo {
  const porId = new Map(catalogo.map((item) => [item.id, item]));
  const linhas: LinhaCarrinho[] = [];
  const ficaramDeFora: string[] = [];

  for (const linha of pedido.linhas) {
    const item = porId.get(linha.itemId);

    if (!item || !item.disponivel) {
      const nome = item ? item.nome : 'Item que saiu do cardápio';
      if (!ficaramDeFora.includes(nome)) ficaramDeFora.push(nome);
      continue;
    }

    const adicionaisValidos = linha.adicionaisIds.filter((id) =>
      item.adicionais.some((adicional) => adicional.id === id)
    );

    linhas.push({ ...linha, adicionaisIds: adicionaisValidos });
  }

  return { linhas, ficaramDeFora };
}