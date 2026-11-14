import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { ItemCardapio, Pedido } from '../tipos';
import { usePedidos } from '../contexto/PedidosContext';
import { useCarrinho } from '../contexto/CarrinhoContext';
import { situacaoDoPedido } from '../dominio/pedido';
import { prepararPedirDeNovo } from '../dominio/pedirDeNovo';
import { buscarCardapio } from '../servicos/cardapio';
import { formatarPreco } from '../servicos/formatacao';

import { Carregando } from '../componentes/Carregando';
import { Erro } from '../componentes/Erro';
import { EstadoVazio } from '../componentes/EstadoVazio';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function MeusPedidos() {
  const { pedidos } = usePedidos();
  const { adicionarItem } = useCarrinho();

  const [catalogo, setCatalogo] = useState<ItemCardapio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  const carregarCatalogo = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');
      setCatalogo(await buscarCardapio());
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : 'Não foi possível carregar o cardápio.'
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarCatalogo();
  }, [carregarCatalogo]);

  function pedirDeNovo(pedido: Pedido) {
    const { linhas, ficaramDeFora } = prepararPedirDeNovo(pedido, catalogo);

    if (linhas.length === 0) {
      setAviso('Nenhum item deste pedido está disponível agora.');
      return;
    }

    linhas.forEach((linha) => adicionarItem(linha));

    setAviso(
      ficaramDeFora.length > 0
        ? `Itens adicionados ao carrinho. Ficaram de fora por estarem indisponíveis: ${ficaramDeFora.join(', ')}.`
        : 'Itens adicionados ao carrinho.'
    );
  }

  if (pedidos.length === 0) {
    return (
      <section className="pagina-pedidos">
        <h2>Meus pedidos</h2>
        <EstadoVazio mensagem="Você ainda não fez nenhum pedido." />
        <Link to="/">Ver o cardápio</Link>
      </section>
    );
  }

  if (carregando) {
    return <Carregando mensagem="Carregando seus pedidos..." />;
  }

  if (erro) {
    return <Erro mensagem={erro} aoTentarNovamente={carregarCatalogo} />;
  }

  return (
    <section className="pagina-pedidos">
      <h2>Meus pedidos</h2>

      {aviso && (
        <div role="status">
          <p>{aviso}</p>
          <Link to="/carrinho">Ir para o carrinho</Link>
        </div>
      )}

      <ul className="lista-pedidos">
        {pedidos.map((pedido) => (
          <li key={pedido.numero}>
            <h3>
              <Link to={`/pedidos/${pedido.numero}`}>Pedido nº {pedido.numero}</Link>
            </h3>
            <p>{formatarData(pedido.recebidoEm)}</p>
            <p>Situação: {situacaoDoPedido(pedido, new Date())}</p>
            <p>
              Total: <strong>{formatarPreco(pedido.resumo.total)}</strong>
            </p>
            <button
              type="button"
              onClick={() => pedirDeNovo(pedido)}
              aria-label={`Pedir de novo o pedido nº ${pedido.numero}`}
            >
              Pedir de novo
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}