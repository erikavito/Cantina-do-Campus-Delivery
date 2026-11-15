
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ItemCardapio } from '../tipos';
import { useCarrinho } from '../contexto/CarrinhoContext';
import { usePedidos } from '../contexto/PedidosContext';
import { calcularResumoCarrinho } from '../dominio/carrinhoReducer';
import {
  DADOS_INICIAIS,
  NOMES_ETAPAS,
  calcularDescontoCombo,
  calcularValores,
  cidadeEhBalsas,
  etapaDoCampo,
  montarNovoPedido,
  primeiroCampoComErro,
  validarCidadeEUf,
  validarEtapa,
  validarTudo,
  type CampoCheckout,
  type DadosCheckout,
  type ErrosCheckout,
} from '../dominio/checkout';
import { apenasDigitos } from '../dominio/mascaras';
import { buscarCardapio } from '../servicos/cardapio';
import { enviarPedido } from '../servicos/pedidos';
import { buscarEnderecoPorCep } from '../servicos/viacep';
import { Carregando } from '../componentes/Carregando';
import { Erro } from '../componentes/Erro';
import { EstadoVazio } from '../componentes/EstadoVazio';
import { IndicadorEtapas } from '../componentes/IndicadorEtapas';
import { EtapaDados } from '../componentes/checkout/EtapaDados';
import { EtapaEntrega } from '../componentes/checkout/EtapaEntrega';
import { EtapaPagamento } from '../componentes/checkout/EtapaPagamento';
import { EtapaRevisao } from '../componentes/checkout/EtapaRevisao';
import type { AlterarCampo } from '../componentes/checkout/tiposEtapa';
import './Checkout.css';

const ULTIMA_ETAPA = NOMES_ETAPAS.length - 1;

export function Checkout() {
  const navigate = useNavigate();
  const { linhas, limparCarrinho } = useCarrinho();
  const { registrarPedido } = usePedidos();

  const [catalogo, setCatalogo] = useState<ItemCardapio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCatalogo, setErroCatalogo] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [etapa, setEtapa] = useState(0);
  const [dados, setDados] = useState<DadosCheckout>(DADOS_INICIAIS);
  const [erros, setErros] = useState<ErrosCheckout>({});
  const [foco, setFoco] = useState<{
    campo: CampoCheckout;
    n: number;
  } | null>(null);

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [avisoCep, setAvisoCep] = useState('');
  const ultimoCep = useRef('');

  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const tituloEtapa = useRef<HTMLHeadingElement>(null);
  const jaMontou = useRef(false);

  useEffect(() => {
    let ativo = true;

    buscarCardapio()
      .then((itens) => {
        if (!ativo) return;
        setCatalogo(itens);
        setCarregando(false);
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        setErroCatalogo(
          erro instanceof Error
            ? erro.message
            : 'Não foi possível carregar os produtos.'
        );
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  useEffect(() => {
    if (!jaMontou.current) {
      jaMontou.current = true;
      return;
    }

    tituloEtapa.current?.focus();
  }, [etapa]);

  useEffect(() => {
    if (foco) {
      document.getElementById(`campo-${foco.campo}`)?.focus();
    }
  }, [foco]);

  const subtotal = useMemo(
    () => calcularResumoCarrinho(linhas, catalogo).subtotal,
    [linhas, catalogo]
  );

  const descontoCombo = useMemo(
    () => calcularDescontoCombo(linhas, catalogo),
    [linhas, catalogo]
  );

  const resumo = useMemo(
    () =>
      calcularValores(
        subtotal,
        dados.tipoEntrega,
        dados.pagamento,
        descontoCombo
      ),
    [
      subtotal,
      dados.tipoEntrega,
      dados.pagamento,
      descontoCombo,
    ]
  );

  const itensInvalidos = useMemo(() => {
    const ids = new Set(catalogo.map((item) => item.id));
    return linhas.some((linha) => !ids.has(linha.itemId));
  }, [linhas, catalogo]);

  function recarregarCatalogo() {
    setErroCatalogo('');
    setCarregando(true);
    setTentativa((valor) => valor + 1);
  }

  function pedirFoco(campo: CampoCheckout | null) {
    if (campo) setFoco({ campo, n: Date.now() });
  }

  const alterar: AlterarCampo = (campo, valor) => {
    setDados((atual) => ({ ...atual, [campo]: valor }));

    setErros((atuais) => {
      if (!(campo in atuais)) return atuais;

      const proximos = { ...atuais };
      delete proximos[campo as CampoCheckout];
      return proximos;
    });
  };

  async function alterarCep(cepFormatado: string) {
    alterar('cep', cepFormatado);

    const digitos = apenasDigitos(cepFormatado);
    ultimoCep.current = digitos;
    setAvisoCep('');

    if (digitos.length !== 8) {
      setBuscandoCep(false);
      return;
    }

    setBuscandoCep(true);

    try {
      const endereco = await buscarEnderecoPorCep(digitos);

      if (ultimoCep.current !== digitos) return;

      setDados((atual) => ({
        ...atual,
        rua: endereco.logradouro || atual.rua,
        bairro: endereco.bairro || atual.bairro,
        cidade: endereco.localidade,
        uf: endereco.uf,
        complemento: atual.complemento || endereco.complemento,
      }));

      setErros((atuais) => {
        const proximos = { ...atuais };

        delete proximos.cep;
        delete proximos.rua;
        delete proximos.bairro;
        delete proximos.cidade;
        delete proximos.uf;

        if (
          !cidadeEhBalsas(endereco.localidade) ||
          endereco.uf !== 'MA'
        ) {
          Object.assign(
            proximos,
            validarCidadeEUf(endereco.localidade, endereco.uf)
          );
        }

        return proximos;
      });
    } catch (erro) {
      if (ultimoCep.current !== digitos) return;

      setAvisoCep(
        `${
          erro instanceof Error
            ? erro.message
            : 'Não foi possível buscar o CEP.'
        } Preencha o endereço manualmente.`
      );
    } finally {
      if (ultimoCep.current === digitos) {
        setBuscandoCep(false);
      }
    }
  }

  function avancar() {
    const errosEtapa = validarEtapa(
      etapa,
      dados,
      subtotal,
      descontoCombo
    );

    if (Object.keys(errosEtapa).length > 0) {
      setErros(errosEtapa);
      pedirFoco(primeiroCampoComErro(errosEtapa, etapa));
      return;
    }

    setErros({});
    setEtapa(etapa + 1);
  }

  function voltar() {
    setErros({});
    setEtapa(Math.max(0, etapa - 1));
  }

  async function confirmar() {
    const errosTodos = validarTudo(
      dados,
      subtotal,
      descontoCombo
    );

    const primeiro = primeiroCampoComErro(errosTodos);

    if (primeiro) {
      setErros(errosTodos);
      setEtapa(etapaDoCampo(primeiro));
      pedirFoco(primeiro);
      return;
    }

    setEnviando(true);
    setErroEnvio('');

    try {
      const pedido = await enviarPedido(
        montarNovoPedido(dados, linhas, resumo)
      );

      registrarPedido(pedido);
      limparCarrinho();
      navigate(`/pedidos/${pedido.numero}`);
    } catch (erro) {
      setErroEnvio(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível enviar o pedido. Tente de novo.'
      );

      setEnviando(false);
    }
  }

  if (carregando) {
    return <Carregando mensagem="Carregando seu pedido..." />;
  }

  if (erroCatalogo) {
    return (
      <Erro
        mensagem={erroCatalogo}
        aoTentarNovamente={recarregarCatalogo}
      />
    );
  }

  if (linhas.length === 0) {
    return (
      <section className="pagina-checkout">
        <h2>Finalizar pedido</h2>
        <EstadoVazio mensagem="Seu carrinho está vazio." />
        <Link to="/">Voltar ao cardápio</Link>
      </section>
    );
  }

  if (itensInvalidos) {
    return (
      <section className="pagina-checkout">
        <h2>Finalizar pedido</h2>
        <p className="aviso aviso-atencao">
          Há itens no carrinho que não existem mais no cardápio. Volte ao
          carrinho e remova esses itens para continuar.
        </p>
        <Link to="/carrinho">Voltar ao carrinho</Link>
      </section>
    );
  }

  const ehUltima = etapa === ULTIMA_ETAPA;
  const quantidadeErros = Object.keys(erros).length;

  return (
    <section className="pagina-checkout">
      <h2>Finalizar pedido</h2>

      <IndicadorEtapas etapas={NOMES_ETAPAS} etapaAtual={etapa} />

      <form
        noValidate
        onSubmit={(evento) => {
          evento.preventDefault();

          if (ehUltima) {
            void confirmar();
          } else {
            avancar();
          }
        }}
      >
        <h3 ref={tituloEtapa} tabIndex={-1} className="titulo-etapa">
          Etapa {etapa + 1} de {NOMES_ETAPAS.length}:{' '}
          {NOMES_ETAPAS[etapa]}
        </h3>

        {quantidadeErros > 0 && (
          <p className="aviso aviso-erro" role="alert">
            {quantidadeErros === 1
              ? 'Corrija o campo destacado para continuar.'
              : `Corrija os ${quantidadeErros} campos destacados para continuar.`}
          </p>
        )}

        {etapa === 0 && (
          <EtapaDados
            dados={dados}
            erros={erros}
            aoAlterar={alterar}
          />
        )}

        {etapa === 1 && (
          <EtapaEntrega
            dados={dados}
            erros={erros}
            aoAlterar={alterar}
            subtotal={subtotal - descontoCombo}
            aoAlterarCep={(cep) => void alterarCep(cep)}
            buscandoCep={buscandoCep}
            avisoCep={avisoCep}
          />
        )}

        {etapa === 2 && (
          <EtapaPagamento
            dados={dados}
            erros={erros}
            aoAlterar={alterar}
            total={resumo.total}
          />
        )}

        {etapa === 3 && (
          <EtapaRevisao
            dados={dados}
            linhas={linhas}
            catalogo={catalogo}
            resumo={resumo}
            aoEditar={(destino) => {
              setErros({});
              setEtapa(destino);
            }}
          />
        )}

        {erroEnvio && (
          <p className="aviso aviso-erro" role="alert">
            {erroEnvio}
          </p>
        )}

        <div className="acoes-checkout">
          {etapa > 0 ? (
            <button
              type="button"
              className="botao-secundario"
              onClick={voltar}
              disabled={enviando}
            >
              Voltar
            </button>
          ) : (
            <Link to="/carrinho" className="link-voltar">
              Voltar ao carrinho
            </Link>
          )}

          <button type="submit" disabled={enviando}>
            {ehUltima
              ? enviando
                ? 'Enviando pedido...'
                : 'Confirmar pedido'
              : 'Avançar'}
          </button>
        </div>
      </form>
    </section>
  );
}
