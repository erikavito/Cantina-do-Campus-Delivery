import {
  CIDADE_ATENDIDA,
  PEDIDO_MINIMO_ENTREGA,
  TAXA_ENTREGA,
  UF_ATENDIDA,
} from '../../dominio/checkout';
import { formatarCep } from '../../dominio/mascaras';
import { formatarPreco } from '../../servicos/formatacao';
import { CampoTexto } from '../CampoTexto';
import type { PropsEtapa } from './tiposEtapa';

interface EtapaEntregaProps extends PropsEtapa {
  subtotal: number;
  aoAlterarCep: (cep: string) => void;
  buscandoCep: boolean;
  avisoCep: string;
}

export function EtapaEntrega({
  dados,
  erros,
  aoAlterar,
  subtotal,
  aoAlterarCep,
  buscandoCep,
  avisoCep,
}: EtapaEntregaProps) {
  const abaixoDoMinimo = subtotal < PEDIDO_MINIMO_ENTREGA;

  return (
    <>
      <fieldset className="grupo-opcoes">
        <legend>Como você quer receber?</legend>

        <label className="opcao">
          <input
            id="campo-tipoEntrega"
            type="radio"
            name="tipoEntrega"
            checked={dados.tipoEntrega === 'entrega'}
            aria-invalid={erros.tipoEntrega ? true : undefined}
            aria-describedby={erros.tipoEntrega ? 'erro-tipoEntrega' : undefined}
            onChange={() => aoAlterar('tipoEntrega', 'entrega')}
          />
          <span>
            <strong>Entrega</strong>
            <small>
              Só em {CIDADE_ATENDIDA}, {UF_ATENDIDA}. Taxa de{' '}
              {formatarPreco(TAXA_ENTREGA)} e pedido mínimo de{' '}
              {formatarPreco(PEDIDO_MINIMO_ENTREGA)}.
            </small>
          </span>
        </label>

        <label className="opcao">
          <input
            type="radio"
            name="tipoEntrega"
            checked={dados.tipoEntrega === 'retirada'}
            onChange={() => aoAlterar('tipoEntrega', 'retirada')}
          />
          <span>
            <strong>Retirada na cantina</strong>
            <small>Sem taxa e sem pedido mínimo.</small>
          </span>
        </label>

        {erros.tipoEntrega && (
          <p id="erro-tipoEntrega" className="campo-erro">
            {erros.tipoEntrega}
          </p>
        )}
      </fieldset>

      {dados.tipoEntrega === 'retirada' ? (
        <p className="aviso">
          Você retira o pedido na cantina quando ele estiver pronto.
        </p>
      ) : (
        <>
          {abaixoDoMinimo && !erros.tipoEntrega && (
            <p className="aviso aviso-atencao">
              Seu subtotal é {formatarPreco(subtotal)}. Para entrega, o mínimo
              é {formatarPreco(PEDIDO_MINIMO_ENTREGA)}.
            </p>
          )}

          <CampoTexto
            nome="cep"
            rotulo="CEP"
            valor={dados.cep}
            aoAlterar={(valor) => aoAlterarCep(formatarCep(valor))}
            erro={erros.cep}
            modoEntrada="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            ajuda={
              buscandoCep
                ? 'Buscando endereço...'
                : avisoCep || 'Ao digitar o CEP, preenchemos o endereço.'
            }
          />

          <CampoTexto
            nome="rua"
            rotulo="Rua"
            valor={dados.rua}
            aoAlterar={(valor) => aoAlterar('rua', valor)}
            erro={erros.rua}
            autoComplete="address-line1"
          />

          <div className="campos-linha">
            <CampoTexto
              nome="numero"
              rotulo="Número"
              valor={dados.numero}
              aoAlterar={(valor) => aoAlterar('numero', valor)}
              erro={erros.numero}
              maxLength={10}
            />

            <CampoTexto
              nome="complemento"
              rotulo="Complemento"
              valor={dados.complemento}
              aoAlterar={(valor) => aoAlterar('complemento', valor)}
              obrigatorio={false}
              placeholder="Apto, bloco..."
            />
          </div>

          <CampoTexto
            nome="bairro"
            rotulo="Bairro"
            valor={dados.bairro}
            aoAlterar={(valor) => aoAlterar('bairro', valor)}
            erro={erros.bairro}
          />

          <div className="campos-linha">
            <CampoTexto
              nome="cidade"
              rotulo="Cidade"
              valor={dados.cidade}
              aoAlterar={(valor) => aoAlterar('cidade', valor)}
              erro={erros.cidade}
              autoComplete="address-level2"
            />

            <CampoTexto
              nome="uf"
              rotulo="UF"
              valor={dados.uf}
              aoAlterar={(valor) => aoAlterar('uf', valor.toUpperCase())}
              erro={erros.uf}
              maxLength={2}
              autoComplete="address-level1"
            />
          </div>
        </>
      )}
    </>
  );
}
