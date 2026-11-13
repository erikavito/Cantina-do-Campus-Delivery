
export function formatarPreco(valorEmCentavos: number): string {
  return (valorEmCentavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
