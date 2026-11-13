import type { Adicional } from '../tipos';

interface SeletorAdicionaisProps {
  adicionais: Adicional[];
  selecionados: string[];
  idBase: string;
  aoAlterar: (ids: string[]) => void;
}

export function SeletorAdicionais({
  adicionais,
  selecionados,
  idBase,
  aoAlterar,
}: SeletorAdicionaisProps) {
  function alternarAdicional(id: string, marcado: boolean) {
    if (marcado) {
      aoAlterar([...selecionados, id]);
    } else {
      aoAlterar(selecionados.filter((item) => item !== id));
    }
  }

  if (adicionais.length === 0) return null;

  return (
    <fieldset>
      <legend>Escolha seus adicionais</legend>

      {adicionais.map((adicional) => {
        const idCampo = `${idBase}-${adicional.id}`;

        return (
          <div key={adicional.id}>
            <input
              id={idCampo}
              type="checkbox"
              checked={selecionados.includes(adicional.id)}
              onChange={(evento) =>
                alternarAdicional(adicional.id, evento.target.checked)
              }
            />

            <label htmlFor={idCampo}>
              {adicional.nome} —{' '}
              {(adicional.preco / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}