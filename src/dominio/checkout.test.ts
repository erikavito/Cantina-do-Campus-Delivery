import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  DADOS_INICIAIS,
  DESCONTO_PIX_PERCENTUAL,
  PEDIDO_MINIMO_ENTREGA,
  TAXA_ENTREGA,
  calcularValores,
  etapaDoCampo,
  montarNovoPedido,
  primeiroCampoComErro,
  validarCep,
  validarCidadeEUf,
  validarDadosPessoais,
  validarEntrega,
  validarPagamento,
  validarTudo,
  type DadosCheckout,
} from './checkout';
import {
  formatarCep,
  formatarTelefone,
  reaisParaCentavos,
} from './mascaras';
import {
  buscarEnderecoPorCep,
  precisaPreencherEnderecoManualmente,
} from '../servicos/viacep';

const SUBTOTAL_OK = PEDIDO_MINIMO_ENTREGA + 500;

const dadosCompletos: DadosCheckout = {
  nomeCliente: 'Maria Souza',
  telefone: '(99) 99999-9999',
  tipoEntrega: 'entrega',
  cep: '65800-000',
  rua: 'Rua das Flores',
  numero: '120',
  complemento: '',
  bairro: 'Centro',
  cidade: 'Balsas',
  uf: 'MA',
  pagamento: 'pix',
  trocoPara: '',
};

describe('Dados pessoais', () => {
  it('exige nome e telefone com DDD', () => {
    const erros = validarDadosPessoais({
      ...DADOS_INICIAIS,
      nomeCliente: 'Jo',
      telefone: '123',
    });

    expect(erros.nomeCliente).toBeDefined();
    expect(erros.telefone).toBeDefined();
  });

  it('aceita telefone com 10 ou 11 dígitos', () => {
    expect(
      validarDadosPessoais({ ...dadosCompletos, telefone: '(99) 3541-1234' })
    ).toEqual({});
    expect(validarDadosPessoais(dadosCompletos)).toEqual({});
  });
});

describe('CEP', () => {
  it('exige exatamente 8 números', () => {
    expect(validarCep('65800-000')).toBeNull();
    expect(validarCep('65800000')).toBeNull();
    expect(validarCep('6580-000')).not.toBeNull();
    expect(validarCep('65800-0001')).not.toBeNull();
    expect(validarCep('')).not.toBeNull();
  });

  it('formata o CEP enquanto digita', () => {
    expect(formatarCep('65800000')).toBe('65800-000');
    expect(formatarCep('658')).toBe('658');
    expect(formatarCep('65800-000999')).toBe('65800-000');
  });
});

describe('Entrega só em Balsas', () => {
  it('aceita Balsas/MA, ignorando acento e maiúsculas', () => {
    expect(validarCidadeEUf('Balsas', 'MA')).toEqual({});
    expect(validarCidadeEUf(' balsas ', 'ma')).toEqual({});
  });

  it('recusa outra cidade ou outro estado', () => {
    expect(validarCidadeEUf('Teresina', 'MA').cidade).toBeDefined();
    expect(validarCidadeEUf('Balsas', 'PI').uf).toBeDefined();
  });

  it('exige os campos do endereço quando é entrega', () => {
    const erros = validarEntrega(
      { ...DADOS_INICIAIS, tipoEntrega: 'entrega' },
      SUBTOTAL_OK
    );

    expect(Object.keys(erros)).toEqual(
      expect.arrayContaining(['cep', 'rua', 'numero', 'bairro', 'cidade', 'uf'])
    );
  });

  it('não pede endereço na retirada', () => {
    expect(
      validarEntrega({ ...DADOS_INICIAIS, tipoEntrega: 'retirada' }, 100)
    ).toEqual({});
  });
});

describe('Pedido mínimo', () => {
  it('bloqueia entrega abaixo do mínimo', () => {
    const erros = validarEntrega(dadosCompletos, PEDIDO_MINIMO_ENTREGA - 1);

    expect(erros.tipoEntrega).toBeDefined();
  });

  it('libera entrega no valor mínimo', () => {
    expect(validarEntrega(dadosCompletos, PEDIDO_MINIMO_ENTREGA)).toEqual({});
  });

  it('não aplica mínimo na retirada', () => {
    expect(
      validarEntrega({ ...dadosCompletos, tipoEntrega: 'retirada' }, 100)
    ).toEqual({});
  });
});

describe('Pagamento e troco', () => {
  const dinheiro: DadosCheckout = { ...dadosCompletos, pagamento: 'dinheiro' };

  it('exige escolher a forma de pagamento', () => {
    expect(
      validarPagamento({ ...dadosCompletos, pagamento: '' }, 2000).pagamento
    ).toBeDefined();
  });

  it('recusa troco menor que o total', () => {
    expect(
      validarPagamento({ ...dinheiro, trocoPara: '10,00' }, 2000).trocoPara
    ).toBeDefined();
  });

  it('aceita troco igual ou maior que o total', () => {
    expect(validarPagamento({ ...dinheiro, trocoPara: '20,00' }, 2000)).toEqual(
      {}
    );
    expect(validarPagamento({ ...dinheiro, trocoPara: '50' }, 2000)).toEqual({});
  });

  it('recusa valor de troco inválido', () => {
    expect(
      validarPagamento({ ...dinheiro, trocoPara: 'abc' }, 2000).trocoPara
    ).toBeDefined();
  });

  it('ignora o troco quando o pagamento não é dinheiro', () => {
    expect(
      validarPagamento(
        { ...dadosCompletos, pagamento: 'cartao', trocoPara: 'abc' },
        2000
      )
    ).toEqual({});
  });

  it('converte reais em centavos', () => {
    expect(reaisParaCentavos('50')).toBe(5000);
    expect(reaisParaCentavos('50,5')).toBe(5050);
    expect(reaisParaCentavos('R$ 1.250,00')).toBe(125000);
    expect(reaisParaCentavos('0')).toBeNull();
    expect(reaisParaCentavos('')).toBeNull();
  });
});

describe('Valores do pedido', () => {
  it('soma a taxa de entrega só na entrega', () => {
    expect(calcularValores(2000, 'entrega', 'cartao').total).toBe(
      2000 + TAXA_ENTREGA
    );
    expect(calcularValores(2000, 'retirada', 'cartao').total).toBe(2000);
  });

  it('aplica desconto no Pix', () => {
    const resumo = calcularValores(2000, 'retirada', 'pix');
    const desconto = Math.round((2000 * DESCONTO_PIX_PERCENTUAL) / 100);

    expect(resumo.descontoPix).toBe(desconto);
    expect(resumo.total).toBe(2000 - desconto);
  });

  it('não dá desconto fora do Pix', () => {
    expect(calcularValores(2000, 'retirada', 'dinheiro').descontoPix).toBe(0);
  });

  it('frete grátis a partir de R$ 50,00 em produtos', () => {
    expect(calcularValores(5000, 'entrega', 'cartao').taxaEntrega).toBe(0);
    expect(calcularValores(4999, 'entrega', 'cartao').taxaEntrega).toBe(
      TAXA_ENTREGA
    );
  });
});

describe('Foco no primeiro erro', () => {
  it('acha o primeiro campo com erro na ordem da tela', () => {
    expect(
      primeiroCampoComErro({ telefone: 'x', nomeCliente: 'y' }, 0)
    ).toBe('nomeCliente');
    expect(primeiroCampoComErro({})).toBeNull();
  });

  it('diz em qual etapa fica cada campo', () => {
    expect(etapaDoCampo('telefone')).toBe(0);
    expect(etapaDoCampo('cidade')).toBe(1);
    expect(etapaDoCampo('trocoPara')).toBe(2);
  });

  it('validarTudo junta os erros de todas as etapas', () => {
    const erros = validarTudo(DADOS_INICIAIS, SUBTOTAL_OK);

    expect(erros.nomeCliente).toBeDefined();
    expect(erros.cep).toBeDefined();
    expect(erros.pagamento).toBeDefined();
    expect(primeiroCampoComErro(erros)).toBe('nomeCliente');
  });

  it('dados completos não têm erro', () => {
    expect(validarTudo(dadosCompletos, SUBTOTAL_OK)).toEqual({});
  });
});

describe('Montagem do pedido', () => {
  const resumo = calcularValores(SUBTOTAL_OK, 'entrega', 'pix');

  it('inclui o endereço na entrega', () => {
    const pedido = montarNovoPedido(dadosCompletos, [], resumo);

    expect(pedido.endereco?.cidade).toBe('Balsas');
    expect(pedido.trocoPara).toBeNull();
  });

  it('endereço fica nulo na retirada', () => {
    const pedido = montarNovoPedido(
      { ...dadosCompletos, tipoEntrega: 'retirada' },
      [],
      resumo
    );

    expect(pedido.endereco).toBeNull();
  });

  it('guarda o troco em centavos só no dinheiro', () => {
    const pedido = montarNovoPedido(
      { ...dadosCompletos, pagamento: 'dinheiro', trocoPara: '50,00' },
      [],
      resumo
    );

    expect(pedido.trocoPara).toBe(5000);
  });
});

describe('Máscara de telefone', () => {
  it('formata celular e fixo', () => {
    expect(formatarTelefone('99999999999')).toBe('(99) 99999-9999');
    expect(formatarTelefone('9935411234')).toBe('(99) 3541-1234');
    expect(formatarTelefone('99')).toBe('99');
  });
});

describe('Cenários de aceitação (parte 3)', () => {
  const dinheiro: DadosCheckout = { ...dadosCompletos, pagamento: 'dinheiro' };
  const TOTAL_C05 = 5400; // 3 marmitas de R$ 18,00, frete grátis

  it('C05: o total de 3 marmitas na entrega é R$ 54,00 (frete grátis)', () => {
    expect(calcularValores(5400, 'entrega', 'dinheiro').total).toBe(TOTAL_C05);
  });

  it('C05: recusa troco que não cobre o total', () => {
    const erros = validarPagamento({ ...dinheiro, trocoPara: '50' }, TOTAL_C05);

    expect(erros.trocoPara).toBe('O troco não cobre o total do pedido');
  });

  it('C06: aceita troco para R$ 60 e o troco devolvido é R$ 6,00', () => {
    const erros = validarPagamento({ ...dinheiro, trocoPara: '60' }, TOTAL_C05);

    expect(erros).toEqual({});
    expect(reaisParaCentavos('60')! - TOTAL_C05).toBe(600);
  });

  it('C05/C06: no dinheiro o troco é obrigatório', () => {
    const erros = validarPagamento({ ...dinheiro, trocoPara: '' }, TOTAL_C05);

    expect(erros.trocoPara).toBeDefined();
  });

  it('C07: entrega de R$ 9,50 em produtos é recusada pelo mínimo', () => {
    const erros = validarEntrega(dadosCompletos, 700 + 250);

    expect(erros.tipoEntrega?.replace(/\s/g, ' ')).toBe(
      'Pedido mínimo para entrega: R$ 15,00'
    );
  });

  it('C09: CEP de Balsas libera rua e bairro para digitar', () => {
    const balsas = {
      cep: '65800-000',
      logradouro: '',
      complemento: '',
      bairro: '',
      localidade: 'Balsas',
      uf: 'MA',
    };

    expect(precisaPreencherEnderecoManualmente(balsas)).toBe(true);
  });

  it('C10: CEP de São Paulo é recusado', () => {
    const erros = validarCidadeEUf('São Paulo', 'SP');

    expect(erros.cidade).toBe('Entregamos apenas em Balsas-MA');
  });

  it('C12: CEP com 5 dígitos é recusado', () => {
    expect(validarCep('12345')).toBe('O CEP deve ter 8 dígitos');
  });

  describe('ViaCEP simulada', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

        it('C11: CEP inexistente (erro "true") vira "CEP não encontrado"', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ erro: 'true' }),
        })
      );

      await expect(buscarEnderecoPorCep('99999-999')).rejects.toThrow(
        'CEP não encontrado'
      );
    });

    it('C12: CEP com 5 dígitos não chama a API', async () => {
      const fetchSimulado = vi.fn();
      vi.stubGlobal('fetch', fetchSimulado);

      await expect(buscarEnderecoPorCep('12345')).rejects.toThrow(
        'O CEP deve ter 8 dígitos'
      );
      expect(fetchSimulado).not.toHaveBeenCalled();
    });
  });
});