// Funções de texto usadas nos campos do checkout.

export function apenasDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

// 12345678 -> 12345-678
export function formatarCep(texto: string): string {
  const digitos = apenasDigitos(texto).slice(0, 8);

  if (digitos.length <= 5) return digitos;

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

// 99988887777 -> (99) 98888-7777
export function formatarTelefone(texto: string): string {
  const digitos = apenasDigitos(texto).slice(0, 11);

  if (digitos.length <= 2) return digitos;

  if (digitos.length <= 6) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  }

  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }

  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/**
 * Converte o que a pessoa digitou ("50", "50,5", "1.250,00") em centavos.
 * Devolve null se o texto não for um valor em reais válido e maior que zero.
 */
export function reaisParaCentavos(texto: string): number | null {
  const limpo = texto.replace(/R\$/gi, '').replace(/\s/g, '');

  if (limpo === '') return null;

  const normalizado = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo;

  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return null;

  const centavos = Math.round(Number(normalizado) * 100);

  return centavos > 0 ? centavos : null;
}
