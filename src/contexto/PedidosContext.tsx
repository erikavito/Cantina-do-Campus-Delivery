import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Pedido } from '../tipos';
import { podeCancelar } from '../dominio/pedido';

const CHAVE_PEDIDOS = 'cantina-campus-pedidos-v1';

interface PedidosContextType {
  pedidos: Pedido[];
  registrarPedido: (pedido: Pedido) => void;
  cancelarPedido: (numero: number) => boolean;
  buscarPedido: (numero: number) => Pedido | undefined;
}

const PedidosContext = createContext<PedidosContextType | undefined>(undefined);

function validarPedido(valor: unknown): valor is Pedido {
  if (typeof valor !== 'object' || valor === null) return false;

  const p = valor as Record<string, unknown>;

  return (
    typeof p.numero === 'number' &&
    Number.isInteger(p.numero) &&
    p.numero > 0 &&
    typeof p.nomeCliente === 'string' &&
    Array.isArray(p.linhas) &&
    (p.tipoEntrega === 'entrega' || p.tipoEntrega === 'retirada') &&
    typeof p.recebidoEm === 'string' &&
    !Number.isNaN(Date.parse(p.recebidoEm)) &&
    typeof p.cancelado === 'boolean' &&
    typeof p.resumo === 'object' &&
    p.resumo !== null
  );
}

function carregarPedidos(): Pedido[] {
  try {
    const salvo = window.localStorage.getItem(CHAVE_PEDIDOS);
    if (!salvo) return [];

    const dados: unknown = JSON.parse(salvo);
    if (!Array.isArray(dados)) return [];

    return dados.filter(validarPedido);
  } catch {
    return [];
  }
}

interface PedidosProviderProps {
  children: ReactNode;
}

export function PedidosProvider({ children }: PedidosProviderProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>(carregarPedidos);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos));
    } catch {
      // Os pedidos continuam na tela mesmo se o armazenamento falhar.
    }
  }, [pedidos]);

  const registrarPedido = useCallback((pedido: Pedido) => {
    setPedidos((anteriores) => [pedido, ...anteriores]);
  }, []);

  const cancelarPedido = useCallback(
    (numero: number): boolean => {
      const pedido = pedidos.find((p) => p.numero === numero);
      if (!pedido || !podeCancelar(pedido, new Date())) return false;

      setPedidos((atuais) =>
        atuais.map((p) => (p.numero === numero ? { ...p, cancelado: true } : p))
      );
      return true;
    },
    [pedidos]
  );

  const buscarPedido = useCallback(
    (numero: number) => pedidos.find((p) => p.numero === numero),
    [pedidos]
  );

  const valor = useMemo(
    () => ({ pedidos, registrarPedido, cancelarPedido, buscarPedido }),
    [pedidos, registrarPedido, cancelarPedido, buscarPedido]
  );

  return <PedidosContext.Provider value={valor}>{children}</PedidosContext.Provider>;
}

export function usePedidos(): PedidosContextType {
  const contexto = useContext(PedidosContext);

  if (!contexto) {
    throw new Error('usePedidos deve ser utilizado dentro de PedidosProvider.');
  }

  return contexto;
}