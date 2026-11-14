import { Carrinho } from '../paginas/Carrinho';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LayoutPrincipal } from '../layout/LayoutPrincipal';
import { PaginaNaoEncontrada } from '../paginas/PaginaNaoEncontrada';
import { Cardapio } from '../paginas/Cardapio';

export function AppRotas() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutPrincipal />}>
          <Route path="/" element={<Cardapio />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route
            path="*"
            element={<PaginaNaoEncontrada />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
