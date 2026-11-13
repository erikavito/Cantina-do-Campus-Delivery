
interface ErroProps {
  mensagem: string;
  aoTentarNovamente?: () => void;
}

export function Erro({
  mensagem,
  aoTentarNovamente,
}: ErroProps) {
  return (
    <div role="alert">
      <p>{mensagem}</p>

      {aoTentarNovamente && (
        <button onClick={aoTentarNovamente}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
