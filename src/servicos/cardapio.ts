
import type { ItemCardapio } from '../tipos';

const URL_CARDAPIO = '/dados/cardapio.json';

export async function buscarCardapio(): Promise<ItemCardapio[]> {
  const resposta = await fetch(URL_CARDAPIO);

  if (!resposta.ok) {
    throw new Error('Não foi possível carregar o cardápio.');
  }

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error('O formato do cardápio é inválido.');
  }

  return dados as ItemCardapio[];
}
