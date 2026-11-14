import type { HTMLInputTypeAttribute } from 'react';

interface CampoTextoProps {
  nome: string;
  rotulo: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  erro?: string;
  ajuda?: string;
  tipo?: HTMLInputTypeAttribute;
  modoEntrada?: 'text' | 'numeric' | 'tel' | 'decimal';
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  obrigatorio?: boolean;
}

/**
 * Campo de formulário com rótulo, mensagem de erro e ajuda.
 * O id é "campo-<nome>" para o checkout conseguir focar o primeiro erro.
 */
export function CampoTexto({
  nome,
  rotulo,
  valor,
  aoAlterar,
  erro,
  ajuda,
  tipo = 'text',
  modoEntrada,
  autoComplete,
  placeholder,
  maxLength,
  obrigatorio = true,
}: CampoTextoProps) {
  const idCampo = `campo-${nome}`;
  const idErro = `erro-${nome}`;
  const idAjuda = `ajuda-${nome}`;

  const descritoPor =
    [erro ? idErro : '', ajuda ? idAjuda : ''].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className="campo">
      <label htmlFor={idCampo}>
        {rotulo}
        {!obrigatorio && <span className="campo-opcional"> (opcional)</span>}
      </label>

      <input
        id={idCampo}
        name={nome}
        type={tipo}
        inputMode={modoEntrada}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={maxLength}
        value={valor}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor}
        onChange={(evento) => aoAlterar(evento.target.value)}
      />

      {ajuda && (
        <p id={idAjuda} className="campo-ajuda">
          {ajuda}
        </p>
      )}

      {erro && (
        <p id={idErro} className="campo-erro">
          {erro}
        </p>
      )}
    </div>
  );
}
