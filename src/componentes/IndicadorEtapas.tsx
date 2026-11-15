interface IndicadorEtapasProps {
  etapas: readonly string[];
  etapaAtual: number;
}

export function IndicadorEtapas({
  etapas,
  etapaAtual,
}: IndicadorEtapasProps) {
  return (
    <ol className="etapas" aria-label="Etapas do checkout">
      {etapas.map((nome, indice) => {
        const situacao =
          indice === etapaAtual
            ? 'atual'
            : indice < etapaAtual
              ? 'concluida'
              : 'pendente';

        return (
          <li
            key={nome}
            className={`etapa etapa-${situacao}`}
            aria-current={indice === etapaAtual ? 'step' : undefined}
          >
            <span className="etapa-numero" aria-hidden="true">
              {indice < etapaAtual ? '✓' : indice + 1}
            </span>
            <span className="etapa-nome">{nome}</span>
          </li>
        );
      })}
    </ol>
  );
}
