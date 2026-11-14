
import type { ItemCardapio, LinhaCarrinho } from '../tipos';
import { useCarrinho } from '../contexto/CarrinhoContext';
import { formatarPreco } from '../servicos/formatacao';

interface ItemCarrinhoProps {
  linha: LinhaCarrinho;
  produto: ItemCardapio;
  indice: number;
}

export function ItemCarrinho({
  linha,
  produto,
  indice,
}: ItemCarrinhoProps) {
  const { alterarQuantidade, removerItem } = useCarrinho();

  const adicionaisSelecionados = produto.adicionais.filter(
    (adicional) => linha.adicionaisIds.includes(adicional.id)
  );

  const precoAdicionais = adicionaisSelecionados.reduce(
    (total, adicional) => total + adicional.preco,
    0
  );

  const precoUnitario = produto.preco + precoAdicionais;
  const totalLinha = precoUnitario * linha.quantidade;

  return (
    <article className="item-carrinho">
      <h3>{produto.nome}</h3>

      {adicionaisSelecionados.length > 0 && (
        <div>
          <strong>Adicionais:</strong>
          <ul>
            {adicionaisSelecionados.map((adicional) => (
              <li key={adicional.id}>
                {adicional.nome} — {formatarPreco(adicional.preco)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {linha.observacao.trim() !== '' && (
        <p>
          <strong>Observação:</strong> {linha.observacao}
        </p>
      )}

      <p>
        Preço unitário: {formatarPreco(precoUnitario)}
      </p>

      <p>
        **Total deste item:** {formatarPreco(totalLinha)}
      </p>

      <div className="controles-quantidade">
        <button
          type="button"
          aria-label={`Diminuir quantidade de ${produto.nome}`}
          disabled={linha.quantidade <= 1}
          onClick={() =>
            alterarQuantidade(indice, linha.quantidade - 1)
          }
        >
          −
        </button>

        <span aria-live="polite">
          {linha.quantidade}
        </span>

        <button
          type="button"
          aria-label={`Aumentar quantidade de ${produto.nome}`}
          disabled={linha.quantidade >= 99}
          onClick={() =>
            alterarQuantidade(indice, linha.quantidade + 1)
          }
        >
          +
        </button>

        <button
          type="button"
          onClick={() => removerItem(indice)}
          aria-label={`Remover ${produto.nome} do carrinho`}
        >
          Remover
        </button>
      </div>
    </article>
  );
}
