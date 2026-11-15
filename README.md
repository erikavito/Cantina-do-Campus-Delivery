# Cantina do Campus Delivery

Loja online da Cantina do Campus com entrega em Balsas-MA: cardápio com adicionais, carrinho, checkout em 4 etapas, endereço por CEP, acompanhamento do pedido e histórico para pedir de novo.

**Aplicação publicada:** https://cantina-do-campus-delivery.vercel.app
**Tema:** C

## Equipe

| Integrante | Responsável por |
|---|---|
| Erika | Estrutura, rotas, layout, cardápio e serviços do cardápio e da ViaCEP |
| Thierry  | Detalhe do produto, adicionais, carrinho com Context e reducer |
| Maicon | Checkout em 4 etapas, validação, regras de entrega e pagamento |
| Emilly | Envio do pedido, Context dos pedidos, acompanhamento, cancelamento, histórico e pedir de novo |

## Como rodar

    npm install
    npm run dev
    npm test

## Telas

- `/` Cardápio
- `/carrinho` Carrinho
- `/checkout` Checkout
- `/pedidos` Meus pedidos
- `/pedidos/:numero` Acompanhamento

## Regras de negócio

- Carrinho (C2, C3): `src/dominio/carrinhoReducer.ts`
- Checkout, combo, Pix, entrega e troco (C4 a C6): `src/dominio/checkout.ts`
- Situação e cancelamento do pedido (C7): `src/dominio/pedido.ts`
- Pedir de novo (C8): `src/dominio/pedirDeNovo.ts`

75 testes em Vitest.

## Decisões técnicas

Regras em funções puras em `src/dominio`, testadas com Vitest. Estado compartilhado com Context (carrinho com useReducer). Dados persistidos no localStorage com leitura defensiva. A situação do pedido é calculada a partir da hora de recebimento, para não se perder ao recarregar.

## Créditos

Endereços: API ViaCEP (viacep.com.br).
