import { Carrinho } from '../paginas/Carrinho';
import { Checkout } from '../paginas/Checkout';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { LayoutPrincipal } from '../layout/LayoutPrincipal';
import { PaginaNaoEncontrada } from '../paginas/PaginaNaoEncontrada';
import { Cardapio } from '../paginas/Cardapio';
import { Acompanhamento } from '../paginas/Acompanhamento';
import { MeusPedidos } from '../paginas/MeusPedidos';

export function AppRotas() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<LayoutPrincipal />}>
          <Route path="/" element={<Cardapio />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedidos" element={<MeusPedidos />} />
          <Route path="/pedidos/:numero" element={<Acompanhamento />} />
          <Route
            path="*"
            element={<PaginaNaoEncontrada />}
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}
