
export function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape-conteudo">
        <h2>Cantina do Campus</h2>

        <p>
          Comida boa pertinho de você!
        </p>

        <p>
          © {new Date().getFullYear()} Cantina do Campus Delivery.
          Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
