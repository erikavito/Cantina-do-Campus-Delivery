import { formatarTelefone } from '../../dominio/mascaras';
import { CampoTexto } from '../CampoTexto';
import type { PropsEtapa } from './tiposEtapa';

export function EtapaDados({ dados, erros, aoAlterar }: PropsEtapa) {
  return (
    <>
      <CampoTexto
        nome="nomeCliente"
        rotulo="Nome"
        valor={dados.nomeCliente}
        aoAlterar={(valor) => aoAlterar('nomeCliente', valor)}
        erro={erros.nomeCliente}
        autoComplete="name"
        placeholder="Como devemos te chamar?"
      />

      <CampoTexto
        nome="telefone"
        rotulo="Telefone com DDD"
        valor={dados.telefone}
        aoAlterar={(valor) => aoAlterar('telefone', formatarTelefone(valor))}
        erro={erros.telefone}
        tipo="tel"
        modoEntrada="tel"
        autoComplete="tel"
        placeholder="(99) 99999-9999"
        ajuda="Usamos o telefone só para falar sobre o seu pedido."
      />
    </>
  );
}
