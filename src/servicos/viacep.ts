
export interface DadosViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

interface RespostaViaCEP extends DadosViaCEP {
  erro?: boolean;
}

export async function buscarEnderecoPorCep(
  cep: string
): Promise<DadosViaCEP> {
  const cepLimpo = cep.replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    throw new Error('O CEP deve conter exatamente 8 números.');
  }

  const resposta = await fetch(
    `https://viacep.com.br/ws/${cepLimpo}/json/`
  );

  if (!resposta.ok) {
    throw new Error('Não foi possível consultar o CEP.');
  }

  const dados: RespostaViaCEP = await resposta.json();

  if (dados.erro) {
    throw new Error('CEP não encontrado.');
  }

  return {
    cep: dados.cep,
    logradouro: dados.logradouro,
    complemento: dados.complemento,
    bairro: dados.bairro,
    localidade: dados.localidade,
    uf: dados.uf,
  };
}

export function precisaPreencherEnderecoManualmente(
  dados: DadosViaCEP
): boolean {
  return dados.localidade === 'Balsas' && dados.uf === 'MA';
}
