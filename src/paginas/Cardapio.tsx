
import { useCallback, useEffect, useState } from 'react';
import type { ItemCardapio } from '../tipos';
import {
  filtrarEOrdenarItens,
  type FiltroCategoria,
  type Ordenacao,
} from '../servicos/filtrosCardapio';
import { buscarCardapio } from '../servicos/cardapio';
import { formatarPreco } from '../servicos/formatacao';
import { Carregando } from '../componentes/Carregando';
import { Erro } from '../componentes/Erro';
import { EstadoVazio } from '../componentes/EstadoVazio';


export function Cardapio() {
  const [itens, setItens] = useState<ItemCardapio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] =
    useState<FiltroCategoria>('todas');
  const [ordenacao, setOrdenacao] =
    useState<Ordenacao>('nome');

  const carregarCardapio = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      const dados = await buscarCardapio();
      setItens(dados);
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível carregar o cardápio.'
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarCardapio();
  }, [carregarCardapio]);

 const itensFiltrados = filtrarEOrdenarItens(
  itens,
  busca,
  categoria,
  ordenacao
);
  if (carregando) {
    return <Carregando mensagem="Carregando cardápio..." />;
  }

  if (erro) {
    return (
      <Erro
        mensagem={erro}
        aoTentarNovamente={carregarCardapio}
      />
    );
  }

  return (
    <section>
      <h2>Nosso cardápio</h2>
      <p>Confira nossas opções e escolha seu pedido!</p>

      <label htmlFor="busca">Pesquisar produto:</label>
      <input
        id="busca"
        type="search"
        placeholder="Digite o nome do produto"
        value={busca}
        onChange={(evento) => setBusca(evento.target.value)}
      />

      <label htmlFor="categoria">Categoria:</label>
      <select
        id="categoria"
        value={categoria}
        onChange={(evento) =>
          setCategoria(evento.target.value as FiltroCategoria)
        }
      >
        <option value="todas">Todas</option>
        <option value="salgado">Salgados</option>
        <option value="bebida">Bebidas</option>
        <option value="doce">Doces</option>
        <option value="refeicao">Refeições</option>
      </select>

      <label htmlFor="ordenacao">Ordenar por:</label>
      <select
        id="ordenacao"
        value={ordenacao}
        onChange={(evento) =>
          setOrdenacao(evento.target.value as Ordenacao)
        }
      >
        <option value="nome">Nome (A-Z)</option>
        <option value="menor-preco">Menor preço</option>
        <option value="maior-preco">Maior preço</option>
      </select>

      {itensFiltrados.length === 0 ? (
        <EstadoVazio mensagem="Nenhum produto encontrado." />
      ) : (
        <div>
          {itensFiltrados.map((item) => (
            <article key={item.id}>
              <h3>{item.nome}</h3>
              <p>{item.descricao}</p>
              <p>{formatarPreco(item.preco)}</p>

              {!item.disponivel && (
                <p>Produto indisponível no momento.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
