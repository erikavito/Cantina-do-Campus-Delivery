
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { ItemCardapio } from '../tipos';
import { useCarrinho } from '../contexto/CarrinhoContext';
import {
  calcularResumoCarrinho,
} from '../dominio/carrinhoReducer';
import { buscarCardapio } from '../servicos/cardapio';
import { formatarPreco } from '../servicos/formatacao';

import { ItemCarrinho } from '../componentes/ItemCarrinho';
import { Carregando } from '../componentes/Carregando';
import { Erro } from '../componentes/Erro';
import { EstadoVazio } from '../componentes/EstadoVazio';

export function Carrinho() {
  const {
    linhas,
    quantidadeItens,
    removerItem,
    limparCarrinho,
  } = useCarrinho();

  const [catalogo, setCatalogo] = useState<ItemCardapio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarCatalogo = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      const dados = await buscarCardapio();
      setCatalogo(dados);
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível carregar os produtos.'
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarCatalogo();
  }, [carregarCatalogo]);

  const produtosPorId = useMemo(
    () => new Map(catalogo.map((produto) => [produto.id, produto])),
    [catalogo]
  );

  const resumo = useMemo(
    () => calcularResumoCarrinho(linhas, catalogo),
    [linhas, catalogo]
  );

  if (carregando) {
    return <Carregando mensagem="Carregando seu carrinho..." />;
  }

  if (erro) {
    return (
      <Erro
        mensagem={erro}
        aoTentarNovamente={carregarCatalogo}
      />
    );
  }

  return (
    <section className="pagina-carrinho">
      <h2>Meu carrinho</h2>

      {linhas.length === 0 ? (
        <>
          <EstadoVazio mensagem="Seu carrinho está vazio." />

          <Link to="/">Voltar ao cardápio</Link>
        </>
      ) : (
        <>
          <p>
            Você possui {quantidadeItens}{' '}
            {quantidadeItens === 1 ? 'item' : 'itens'} no carrinho.
          </p>

          <div className="lista-carrinho">
            {linhas.map((linha, indice) => {
              const produto = produtosPorId.get(linha.itemId);

              if (!produto) {
                return (
                  <article key={`${linha.itemId}-${indice}`}>
                    <p>
                      Um produto deste carrinho não foi encontrado
                      no catálogo.
                    </p>

                    <button
                      type="button"
                      onClick={() => removerItem(indice)}
                    >
                      Remover item
                    </button>
                  </article>
                );
              }

              return (
                <ItemCarrinho
                  key={`${linha.itemId}-${indice}`}
                  linha={linha}
                  produto={produto}
                  indice={indice}
                />
              );
            })}
          </div>

          <div className="resumo-carrinho">
            <h3>Resumo do pedido</h3>

            <p>
              Quantidade de itens: {resumo.quantidadeItens}
            </p>

            <p>
              Subtotal:{' '}
              <strong>{formatarPreco(resumo.subtotal)}</strong>
            </p>

            <p>
              Taxa de entrega e descontos serão calculados
              durante o checkout.
            </p>

            <button
              type="button"
              onClick={limparCarrinho}
            >
              Limpar carrinho
            </button>

            <Link to="/">Continuar comprando</Link>
          </div>
        </>
      )}
    </section>
  );
}
