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

      <p className="card-descricao">{item.descricao}</p>

      <p className="card-preco">{formatarPreco(precoUnitario)}</p>

      {item.disponivel ? (
        <>
          <SeletorAdicionais
            adicionais={item.adicionais}
            selecionados={adicionaisIds}
            idBase={item.id}
            aoAlterar={setAdicionaisIds}
          />

          <div className="campo-card">
            <span className="rotulo-card" id={`rotulo-qtd-${item.id}`}>
              Quantidade
            </span>

            <div
              className="seletor-quantidade"
              role="group"
              aria-labelledby={`rotulo-qtd-${item.id}`}
            >
              <button
                type="button"
                className="botao-quantidade"
                aria-label={`Diminuir quantidade de ${item.nome}`}
                disabled={quantidade <= 1}
                onClick={() => setQuantidade(quantidade - 1)}
              >
                −
              </button>

              <output aria-live="polite">{quantidade}</output>

              <button
                type="button"
                className="botao-quantidade"
                aria-label={`Aumentar quantidade de ${item.nome}`}
                disabled={quantidade >= 99}
                onClick={() => setQuantidade(quantidade + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="campo-card">
            <label
              className="rotulo-card"
              htmlFor={`observacao-${item.id}`}
            >
              Observações
            </label>

            <textarea
              id={`observacao-${item.id}`}
              maxLength={120}
              rows={2}
              value={observacao}
              onChange={(evento) => setObservacao(evento.target.value)}
              placeholder="Ex.: sem cebola"
            />
          </div>

          <button
            type="button"
            className="botao-adicionar"
            onClick={adicionarAoCarrinho}
          >
            Adicionar ao carrinho
          </button>

          <p className="card-mensagem" role="status" aria-live="polite">
            {mensagem}
          </p>
        </>
      ) : (
        <button type="button" className="botao-adicionar" disabled>
          Produto indisponível
        </button>
      )}
    </article>
  );
}