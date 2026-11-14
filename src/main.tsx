import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CarrinhoProvider } from './contexto/CarrinhoContext';
import { PedidosProvider } from './contexto/PedidosContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CarrinhoProvider>
      <PedidosProvider>
        <App />
      </PedidosProvider>
    </CarrinhoProvider>
  </StrictMode>,
);