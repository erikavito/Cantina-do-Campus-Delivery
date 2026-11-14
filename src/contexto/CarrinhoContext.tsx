
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import type { LinhaCarrinho } from '../tipos';
import { carrinhoReducer } from '../dominio/carrinhoReducer';

const CHAVE_CARRINHO = 'cantina-campus-carrinho-v1';

interface CarrinhoContextType {
  linhas: LinhaCarrinho[];
  quantidadeItens: number;
  adicionarItem: (linha: LinhaCarrinho) => void;
  alterarQuantidade: (indice: number, quantidade: number) => void;
  removerItem: (indice: number) => void;
  limparCarrinho: () => void;
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(
  undefined
);

function validarLinha(valor: unknown): valor is LinhaCarrinho {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }

  const registro = valor as Record<string, unknown>;

  return (
    typeof registro.itemId === 'string' &&
    Array.isArray(registro.adicionaisIds) &&
    registro.adicionaisIds.every(
      (id: unknown) => typeof id === 'string'
    ) &&
    typeof registro.observacao === 'string' &&
    typeof registro.quantidade === 'number' &&
    Number.isInteger(registro.quantidade) &&
    registro.quantidade > 0
  );
}

function carregarCarrinho(): LinhaCarrinho[] {
  try {
    const salvo = window.localStorage.getItem(CHAVE_CARRINHO);

    if (!salvo) return [];

    const dados: unknown = JSON.parse(salvo);

    if (!Array.isArray(dados)) return [];

    return dados.filter(validarLinha).map((linha) => ({
      ...linha,
      adicionaisIds: [...new Set(linha.adicionaisIds)].sort(),
      observacao: linha.observacao.trim(),
    }));
  } catch {
    return [];
  }
}

interface CarrinhoProviderProps {
  children: ReactNode;
}

export function CarrinhoProvider({
  children,
}: CarrinhoProviderProps) {
  const [linhas, dispatch] = useReducer(
    carrinhoReducer,
    undefined,
    carregarCarrinho
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CHAVE_CARRINHO,
        JSON.stringify(linhas)
      );
    } catch {
      // O carrinho continua funcionando mesmo se o armazenamento falhar.
    }
  }, [linhas]);

  const adicionarItem = useCallback((linha: LinhaCarrinho) => {
    dispatch({ tipo: 'adicionar', linha });
  }, []);

  const alterarQuantidade = useCallback(
    (indice: number, quantidade: number) => {
      dispatch({ tipo: 'alterarQuantidade', indice, quantidade });
    },
    []
  );

  const removerItem = useCallback((indice: number) => {
    dispatch({ tipo: 'remover', indice });
  }, []);

  const limparCarrinho = useCallback(() => {
    dispatch({ tipo: 'limpar' });
  }, []);

  const quantidadeItens = useMemo(
    () => linhas.reduce((total, linha) => total + linha.quantidade, 0),
    [linhas]
  );

  const valor = useMemo(
    () => ({
      linhas,
      quantidadeItens,
      adicionarItem,
      alterarQuantidade,
      removerItem,
      limparCarrinho,
    }),
    [
      linhas,
      quantidadeItens,
      adicionarItem,
      alterarQuantidade,
      removerItem,
      limparCarrinho,
    ]
  );

  return (
    <CarrinhoContext.Provider value={valor}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho(): CarrinhoContextType {
  const contexto = useContext(CarrinhoContext);

  if (!contexto) {
    throw new Error(
      'useCarrinho deve ser utilizado dentro de CarrinhoProvider.'
    );
  }

  return contexto;
}
