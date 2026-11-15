import type { DadosCheckout, ErrosCheckout } from '../../dominio/checkout';

export type AlterarCampo = <C extends keyof DadosCheckout>(
  campo: C,
  valor: DadosCheckout[C]
) => void;

export interface PropsEtapa {
  dados: DadosCheckout;
  erros: ErrosCheckout;
  aoAlterar: AlterarCampo;
}
