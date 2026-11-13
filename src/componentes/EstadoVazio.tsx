
interface EstadoVazioProps {
  mensagem?: string;
}

export function EstadoVazio({
  mensagem = 'Nenhum resultado encontrado.',
}: EstadoVazioProps) {
  return (
    <div role="status">
      <p>{mensagem}</p>
    </div>
  );
}
