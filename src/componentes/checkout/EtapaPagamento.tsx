import { DESCONTO_PIX_PERCENTUAL } from '../../dominio/checkout';
import { formatarPreco } from '../../servicos/formatacao';
import { CampoTexto } from '../CampoTexto';
import type { PropsEtapa } from './tiposEtapa';

interface EtapaPagamentoProps extends PropsEtapa {
  total: number;
}

export function EtapaPagamento({
  dados,
  erros,
  aoAlterar,
  total,
}: EtapaPagamentoProps) {
  return (
    <>
      <fieldset className="grupo-opcoes">
        <legend>Forma de pagamento</legend>

        <label className="opcao">
          <input
            id="campo-pagamento"
            type="radio"
            name="pagamento"
            checked={dados.pagamento === 'pix'}
            aria-invalid={erros.pagamento ? true : undefined}
            aria-describedby={erros.pagamento ? 'erro-pagamento' : undefined}
            onChange={() => aoAlterar('pagamento', 'pix')}
          />
          <span>
            <strong>Pix</strong>
            <small>{DESCONTO_PIX_PERCENTUAL}% de desconto no subtotal.</small>
          </span>
        </label>

        <label className="opcao">
          <input
            type="radio"
            name="pagamento"
            checked={dados.pagamento === 'cartao'}
            onChange={() => aoAlterar('pagamento', 'cartao')}
          />
          <span>
            <strong>Cartão</strong>
          </span>
        </label>

        <label className="opcao">
          <input
            type="radio"
            name="pagamento"
            checked={dados.pagamento === 'dinheiro'}
            onChange={() => aoAlterar('pagamento', 'dinheiro')}
          />
          <span>
            <strong>Dinheiro</strong>
            <small>Você pode pedir troco.</small>
          </span>
        </label>

        {erros.pagamento && (
          <p id="erro-pagamento" className="campo-erro">
            {erros.pagamento}
          </p>
        )}
      </fieldset>

      {dados.pagamento === 'dinheiro' && (
        <CampoTexto
          nome="trocoPara"
          rotulo="Troco para quanto?"
          valor={dados.trocoPara}
          aoAlterar={(valor) => aoAlterar('trocoPara', valor)}
          erro={erros.trocoPara}
          modoEntrada="decimal"
          placeholder="Ex.: 50,00"
          obrigatorio={false}
          ajuda={`O total do pedido é ${formatarPreco(
            total
          )}. Deixe em branco se não precisar de troco.`}
        />
      )}
    </>
  );
}
