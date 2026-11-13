
import { Link } from 'react-router-dom';

export function Cabecalho() {
  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <Link to="/" className="marca">
          <h1>Cantina do Campus</h1>
          <span>Comida boa pertinho de você!</span>
        </Link>

        <nav aria-label="Navegação principal">
          <ul className="menu-navegacao">
            <li><Link to="/">Cardápio</Link></li>
            <li><Link to="/carrinho">Carrinho</Link></li>
            <li><Link to="/pedidos">Meus pedidos</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
