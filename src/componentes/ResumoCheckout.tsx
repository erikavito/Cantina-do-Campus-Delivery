import type { ResumoValores } from '../tipos';
import { formatarPreco } from '../servicos/formatacao';

interface ResumoCheckoutProps {
  resumo: ResumoValores;
}

/** Quadro com subtotal, descontos, taxa e total do pedido. */
export function ResumoCheckout({ resumo }: ResumoCheckoutProps) {
  return (
    <dl className="resumo-valores">
      <div>
        <dt>Subtotal</dt>
        <dd>{formatarPreco(resumo.subtotal)}</dd>
      </div>

      {resumo.descontoCombo > 0 && (
        <div>
          <dt>Desconto do combo</dt>
          <dd>− {formatarPreco(resumo.descontoCombo)}</dd>
        </div>
      )}

      {resumo.descontoPix > 0 && (
        <div>
          <dt>Desconto no Pix</dt>
          <dd>− {formatarPreco(resumo.descontoPix)}</dd>
        </div>
      )}

      <div>
        <dt>Taxa de entrega</dt>
        <dd>
          {resumo.taxaEntrega > 0
            ? formatarPreco(resumo.taxaEntrega)
            : 'Grátis'}
        </dd>
      </div>

      <div className="resumo-total">
        <dt>Total</dt>
        <dd>{formatarPreco(resumo.total)}</dd>
      </div>
    </dl>
  );
}
