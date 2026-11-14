import type {
  Endereco,
  FormaPagamento,
  LinhaCarrinho,
  ResumoValores,
  TipoEntrega,
} from '../tipos';
import type { NovoPedido } from '../servicos/pedidos';
import { formatarPreco } from '../servicos/formatacao';
import { apenasDigitos, reaisParaCentavos } from './mascaras';

/* ------------------------------------------------------------------ */
/* Regras do negócio                                                   */
/* ATENÇÃO: confira estes valores com o enunciado da atividade.        */
/* ------------------------------------------------------------------ */

export const CIDADE_ATENDIDA = 'Balsas';
export const UF_ATENDIDA = 'MA';

/** Pedido mínimo para ENTREGA, em centavos (retirada não tem mínimo). */
export const PEDIDO_MINIMO_ENTREGA = 1500;

/** Taxa de entrega, em centavos. */
export const TAXA_ENTREGA = 500;

/** Desconto para pagamento no Pix, em porcentagem do subtotal. */
export const DESCONTO_PIX_PERCENTUAL = 5;

/* ------------------------------------------------------------------ */
/* Dados do formulário                                                 */
/* ------------------------------------------------------------------ */

export type CampoCheckout =
  | 'nomeCliente'
  | 'telefone'
  | 'tipoEntrega'
  | 'cep'
  | 'rua'
  | 'numero'
  | 'bairro'
  | 'cidade'
  | 'uf'
  | 'pagamento'
  | 'trocoPara';

export interface DadosCheckout {
  nomeCliente: string;
  telefone: string;
  tipoEntrega: TipoEntrega;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  pagamento: FormaPagamento | '';
  trocoPara: string;
}

export type ErrosCheckout = Partial<Record<CampoCheckout, string>>;

export const DADOS_INICIAIS: DadosCheckout = {
  nomeCliente: '',
  telefone: '',
  tipoEntrega: 'entrega',
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  pagamento: '',
  trocoPara: '',
};

/* ------------------------------------------------------------------ */
/* Etapas                                                              */
/* ------------------------------------------------------------------ */

export const NOMES_ETAPAS = [
  'Seus dados',
  'Entrega',
  'Pagamento',
  'Revisão',
] as const;

/** Campos de cada etapa, na ordem em que aparecem na tela. */
export const CAMPOS_POR_ETAPA: CampoCheckout[][] = [
  ['nomeCliente', 'telefone'],
  ['tipoEntrega', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'uf'],
  ['pagamento', 'trocoPara'],
  [],
];

export function primeiroCampoComErro(
  erros: ErrosCheckout,
  etapa?: number
): CampoCheckout | null {
  const campos =
    etapa === undefined ? CAMPOS_POR_ETAPA.flat() : CAMPOS_POR_ETAPA[etapa];

  return campos.find((campo) => erros[campo]) ?? null;
}

export function etapaDoCampo(campo: CampoCheckout): number {
  return CAMPOS_POR_ETAPA.findIndex((campos) => campos.includes(campo));
}

/* ------------------------------------------------------------------ */
/* Valores do pedido                                                   */
/* ------------------------------------------------------------------ */

/**
 * Calcula os valores do pedido a partir do subtotal do carrinho.
 * O desconto de combo fica em 0 até a regra do combo ser definida
 * (parte do cálculo de valores do carrinho).
 */
export function calcularValores(
  subtotal: number,
  tipoEntrega: TipoEntrega,
  pagamento: FormaPagamento | ''
): ResumoValores {
  const descontoCombo = 0;

  const descontoPix =
    pagamento === 'pix'
      ? Math.round((subtotal * DESCONTO_PIX_PERCENTUAL) / 100)
      : 0;

  const taxaEntrega = tipoEntrega === 'entrega' ? TAXA_ENTREGA : 0;

  return {
    subtotal,
    descontoCombo,
    descontoPix,
    taxaEntrega,
    total: subtotal - descontoCombo - descontoPix + taxaEntrega,
  };
}

/* ------------------------------------------------------------------ */
/* Validações                                                          */
/* ------------------------------------------------------------------ */

function semAcento(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

export function cidadeEhBalsas(cidade: string): boolean {
  return semAcento(cidade) === semAcento(CIDADE_ATENDIDA);
}

export function validarNome(nome: string): string | null {
  return nome.trim().length >= 3
    ? null
    : 'Informe seu nome (mínimo de 3 letras).';
}

export function validarTelefone(telefone: string): string | null {
  const digitos = apenasDigitos(telefone);

  return digitos.length === 10 || digitos.length === 11
    ? null
    : 'Informe o telefone com DDD, por exemplo (99) 99999-9999.';
}

export function validarCep(cep: string): string | null {
  return apenasDigitos(cep).length === 8
    ? null
    : 'O CEP deve ter exatamente 8 números.';
}

/** Só entregamos em Balsas, MA. */
export function validarCidadeEUf(
  cidade: string,
  uf: string
): Pick<ErrosCheckout, 'cidade' | 'uf'> {
  const erros: Pick<ErrosCheckout, 'cidade' | 'uf'> = {};

  if (cidade.trim() === '') {
    erros.cidade = 'Informe a cidade.';
  } else if (!cidadeEhBalsas(cidade)) {
    erros.cidade = 'Entregamos apenas em Balsas.';
  }

  if (uf.trim() === '') {
    erros.uf = 'Informe o estado (UF).';
  } else if (uf.trim().toUpperCase() !== UF_ATENDIDA) {
    erros.uf = `Entregamos apenas em Balsas, ${UF_ATENDIDA}.`;
  }

  return erros;
}

export function validarDadosPessoais(dados: DadosCheckout): ErrosCheckout {
  const erros: ErrosCheckout = {};

  const erroNome = validarNome(dados.nomeCliente);
  if (erroNome) erros.nomeCliente = erroNome;

  const erroTelefone = validarTelefone(dados.telefone);
  if (erroTelefone) erros.telefone = erroTelefone;

  return erros;
}

/** Retirada não tem regras; entrega exige mínimo e endereço em Balsas. */
export function validarEntrega(
  dados: DadosCheckout,
  subtotal: number
): ErrosCheckout {
  if (dados.tipoEntrega === 'retirada') return {};

  const erros: ErrosCheckout = {};

  if (subtotal < PEDIDO_MINIMO_ENTREGA) {
    erros.tipoEntrega = `O pedido mínimo para entrega é ${formatarPreco(
      PEDIDO_MINIMO_ENTREGA
    )}. Adicione mais itens ou escolha retirada.`;
  }

  const erroCep = validarCep(dados.cep);
  if (erroCep) erros.cep = erroCep;

  if (dados.rua.trim() === '') erros.rua = 'Informe a rua.';
  if (dados.numero.trim() === '') erros.numero = 'Informe o número.';
  if (dados.bairro.trim() === '') erros.bairro = 'Informe o bairro.';

  Object.assign(erros, validarCidadeEUf(dados.cidade, dados.uf));

  return erros;
}

/** Troco é opcional, mas se for informado precisa cobrir o total. */
export function validarPagamento(
  dados: DadosCheckout,
  total: number
): ErrosCheckout {
  const erros: ErrosCheckout = {};

  if (dados.pagamento === '') {
    erros.pagamento = 'Escolha uma forma de pagamento.';
    return erros;
  }

  if (dados.pagamento === 'dinheiro' && dados.trocoPara.trim() !== '') {
    const valor = reaisParaCentavos(dados.trocoPara);

    if (valor === null) {
      erros.trocoPara = 'Informe um valor válido, por exemplo 50,00.';
    } else if (valor < total) {
      erros.trocoPara = `O valor para troco deve ser pelo menos ${formatarPreco(
        total
      )}, o total do pedido.`;
    }
  }

  return erros;
}

/** Valida só os campos da etapa informada. */
export function validarEtapa(
  etapa: number,
  dados: DadosCheckout,
  subtotal: number
): ErrosCheckout {
  switch (etapa) {
    case 0:
      return validarDadosPessoais(dados);
    case 1:
      return validarEntrega(dados, subtotal);
    case 2:
      return validarPagamento(
        dados,
        calcularValores(subtotal, dados.tipoEntrega, dados.pagamento).total
      );
    default:
      return {};
  }
}

/** Valida todas as etapas de uma vez (usado ao confirmar o pedido). */
export function validarTudo(
  dados: DadosCheckout,
  subtotal: number
): ErrosCheckout {
  return {
    ...validarEtapa(0, dados, subtotal),
    ...validarEtapa(1, dados, subtotal),
    ...validarEtapa(2, dados, subtotal),
  };
}

/* ------------------------------------------------------------------ */
/* Montagem do pedido                                                  */
/* ------------------------------------------------------------------ */

export function montarNovoPedido(
  dados: DadosCheckout,
  linhas: LinhaCarrinho[],
  resumo: ResumoValores
): NovoPedido {
  if (dados.pagamento === '') {
    throw new Error('A forma de pagamento é obrigatória.');
  }

  const endereco: Endereco | null =
    dados.tipoEntrega === 'entrega'
      ? {
          cep: dados.cep,
          rua: dados.rua.trim(),
          numero: dados.numero.trim(),
          bairro: dados.bairro.trim(),
          complemento: dados.complemento.trim(),
          cidade: dados.cidade.trim(),
          uf: dados.uf.trim().toUpperCase(),
        }
      : null;

  const trocoPara =
    dados.pagamento === 'dinheiro' ? reaisParaCentavos(dados.trocoPara) : null;

  return {
    nomeCliente: dados.nomeCliente.trim(),
    telefone: dados.telefone,
    linhas,
    tipoEntrega: dados.tipoEntrega,
    endereco,
    pagamento: dados.pagamento,
    trocoPara,
    resumo,
  };
}
