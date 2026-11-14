import { useState } from 'react';
import type { ItemCardapio } from '../tipos';
import { useCarrinho } from '../contexto/CarrinhoContext';
import { formatarPreco } from '../servicos/formatacao';
import { SeletorAdicionais } from './SeletorAdicionais';

interface CardProdutoProps {
  item: ItemCardapio;
}

export function CardProduto({ item }: CardProdutoProps) {
  const { adicionarItem } = useCarrinho();

  const [adicionaisIds, setAdicionaisIds] = useState<string[]>([]);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');
  const [mensagem, setMensagem] = useState('');

  const precoAdicionais = item.adicionais
    .filter((adicional) => adicionaisIds.includes(adicional.id))
    .reduce((total, adicional) => total + adicional.preco, 0);

  const precoUnitario = item.preco + precoAdicionais;

  function adicionarAoCarrinho() {
    if (!item.disponivel) return;

    adicionarItem({
      itemId: item.id,
      adicionaisIds,
      observacao,
      quantidade,
    });

    setAdicionaisIds([]);
    setQuantidade(1);
    setObservacao('');
    setMensagem(`${item.nome} adicionado ao carrinho!`);
  }

  return (
    <article className="card-produto">
      <h3>{item.nome}</h3>

      <p>{item.descricao}</p>

      <p>
        Preço: <strong>{formatarPreco(precoUnitario)}</strong>
      </p>

      {item.disponivel ? (
        <>
          <SeletorAdicionais
            adicionais={item.adicionais}
            selecionados={adicionaisIds}
            idBase={item.id}
            aoAlterar={setAdicionaisIds}
          />

          <label htmlFor={`quantidade-${item.id}`}>
            Quantidade:
          </label>

          <input
            id={`quantidade-${item.id}`}
            type="number"
            min="1"
            max="99"
            value={quantidade}
            onChange={(evento) => {
              const valor = Number(evento.target.value);

              if (
                Number.isInteger(valor) &&
                valor >= 1 &&
                valor <= 99
              ) {
                setQuantidade(valor);
              }
            }}
          />

          <label htmlFor={`observacao-${item.id}`}>
            Observações:
          </label>

          <textarea
            id={`observacao-${item.id}`}
            maxLength={120}
            value={observacao}
            onChange={(evento) => setObservacao(evento.target.value)}
            placeholder="Ex.: sem cebola"
          />

          <button type="button" onClick={adicionarAoCarrinho}>
            Adicionar ao carrinho
          </button>

          <p role="status" aria-live="polite">
            {mensagem}
          </p>
        </>
      ) : (
        <button type="button" disabled>
          Produto indisponível
        </button>
      )}
    </article>
  );
}