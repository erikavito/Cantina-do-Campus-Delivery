
import { Link } from 'react-router-dom';

export function PaginaNaoEncontrada() {
  return (
    <section>
      <h2>Ops! Página não encontrada.</h2>

      <p>
        O endereço que você tentou acessar não existe.
      </p>

      <Link to="/">
        Voltar para o cardápio
      </Link>
    </section>
  );
}
