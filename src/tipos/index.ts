// Do enunciado
export type Categoria = 'salgado' | 'bebida' | 'doce' | 'refeicao';

export interface Adicional { id: string; nome: string; preco: number }

export interface ItemCardapio {
  id: string;
  nome: string;
  categoria: Categoria;
  preco: number;          // centavos
  disponivel: boolean;
  descricao: string;
  adicionais: Adicional[];
}

export interface LinhaCarrinho {
  itemId: string;
  adicionaisIds: string[];
  observacao: string;
  quantidade: number;
}

// Ações do reducer do carrinho (regra C2: união discriminada)
export type AcaoCarrinho =
  | { tipo: 'adicionar'; linha: LinhaCarrinho }
  | { tipo: 'alterarQuantidade'; indice: number; quantidade: number }
  | { tipo: 'remover'; indice: number }
  | { tipo: 'limpar' };

// Checkout
export type TipoEntrega = 'entrega' | 'retirada';
export type FormaPagamento = 'pix' | 'cartao' | 'dinheiro';

export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
  uf: string;
}

export interface ResumoValores {
  subtotal: number;
  descontoCombo: number;
  descontoPix: number;
  taxaEntrega: number;
  total: number;
}

// Pedido
export type SituacaoPedido =
  | 'Recebido' | 'Em preparo'
  | 'Saiu para entrega' | 'Entregue'
  | 'Pronto para retirada' | 'Retirado'
  | 'Cancelado';

export interface Pedido {
  numero: number;
  nomeCliente: string;
  telefone: string;
  linhas: LinhaCarrinho[];
  tipoEntrega: TipoEntrega;
  endereco: Endereco | null;   // null na retirada
  pagamento: FormaPagamento;
  trocoPara: number | null;    // só no dinheiro, em centavos
  resumo: ResumoValores;
  recebidoEm: string;          // ISO, a situação é calculada a partir dele
  cancelado: boolean;
}