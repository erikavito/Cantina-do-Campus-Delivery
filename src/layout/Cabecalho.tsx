
import { Link } from 'react-router-dom';

export function Cabecalho() {
  return (
    <header>
      <div>
        <Link to="/">
          <h1>Cantina do Campus</h1>
        </Link>

        <nav aria-label="Navegação principal">
          <ul>
            <li>
              <Link to="/">Cardápio</Link>
            </li>

            <li>
              <Link to="/carrinho">Carrinho</Link>
            </li>

            <li>
              <Link to="/pedidos">Meus pedidos</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
