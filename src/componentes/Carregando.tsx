
interface CarregandoProps {
  mensagem?: string;
}

export function Carregando({
  mensagem = 'Carregando...',
}: CarregandoProps) {
  return (
    <div role="status" aria-live="polite">
      <p>{mensagem}</p>
    </div>
  );
}
