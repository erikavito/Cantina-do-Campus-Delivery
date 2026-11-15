import type {
  ItemCardapio,
  LinhaCarrinho,
  ResumoValores,
} from '../../tipos';
import type { DadosCheckout } from '../../dominio/checkout';
import { calcularResumoCarrinho } from '../../dominio/carrinhoReducer';
import { reaisParaCentavos } from '../../dominio/mascaras';
import { formatarPreco } from '../../servicos/formatacao';
import { ResumoCheckout } from '../ResumoCheckout';

interface EtapaRevisaoProps {
  dados: DadosCheckout;
  linhas: LinhaCarrinho[];
  catalogo: ItemCardapio[];
  resumo: ResumoValores;
  aoEditar: (etapa: number) => void;
}

const NOMES_PAGAMENTO = {
  pix: 'Pix',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
} as const;

export function EtapaRevisao({
  dados,
  linhas,
  catalogo,
  resumo,
  aoEditar,
}: EtapaRevisaoProps) {
  const produtosPorId = new Map(catalogo.map((item) => [item.id, item]));
  const troco =
    dados.pagamento === 'dinheiro' ? reaisParaCentavos(dados.trocoPara) : null;

  return (
    <>
      <section className="bloco-revisao" aria-labelledby="rev-itens">
        <h4 id="rev-itens">Itens</h4>

        <ul className="lista-revisao">
          {linhas.map((linha, indice) => {
            const produto = produtosPorId.get(linha.itemId);
            if (!produto) return null;

            const adicionais = produto.adicionais
              .filter((adicional) => linha.adicionaisIds.includes(adicional.id))
              .map((adicional) => adicional.nome);

            return (
              <li key={`${linha.itemId}-${indice}`}>
                <span>
                  {linha.quantidade}× {produto.nome}
                  {adicionais.length > 0 && (
                    <small> + {adicionais.join(', ')}</small>
                  )}
                  {linha.observacao && <small>Obs.: {linha.observacao}</small>}
                </span>
                <strong>
                  {formatarPreco(calcularResumoCarrinho([linha], catalogo).subtotal)}
                </strong>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bloco-revisao" aria-labelledby="rev-dados">
        <h4 id="rev-dados">Seus dados</h4>
        <p>
          {dados.nomeCliente}
          <br />
          {dados.telefone}
        </p>
        <button
          type="button"
          className="botao-secundario"
          onClick={() => aoEditar(0)}
        >
          Editar dados
        </button>
      </section>

      <section className="bloco-revisao" aria-labelledby="rev-entrega">
        <h4 id="rev-entrega">
          {dados.tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada na cantina'}
        </h4>
        {dados.tipoEntrega === 'entrega' && (
          <p>
            {dados.rua}, {dados.numero}
            {dados.complemento && ` — ${dados.complemento}`}
            <br />
            {dados.bairro} — {dados.cidade}/{dados.uf}
            <br />
            CEP {dados.cep}
          </p>
        )}
        <button
          type="button"
          className="botao-secundario"
          onClick={() => aoEditar(1)}
        >
          Editar entrega
        </button>
      </section>

      <section className="bloco-revisao" aria-labelledby="rev-pagamento">
        <h4 id="rev-pagamento">Pagamento</h4>
        <p>
          {dados.pagamento === '' ? '—' : NOMES_PAGAMENTO[dados.pagamento]}
          {troco !== null && (
            <>
              <br />
              Troco para {formatarPreco(troco)}
            </>
          )}
        </p>
        <button
          type="button"
          className="botao-secundario"
          onClick={() => aoEditar(2)}
        >
          Editar pagamento
        </button>
      </section>

      <ResumoCheckout resumo={resumo} />
    </>
  );
}
