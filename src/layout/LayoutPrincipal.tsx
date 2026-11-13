
import { Outlet } from 'react-router-dom';
import { Cabecalho } from './Cabecalho';
import { Rodape } from './Rodape';

export function LayoutPrincipal() {
  return (
    <>
      <Cabecalho />

      <main>
        <Outlet />
      </main>

      <Rodape />
    </>
  );
}
