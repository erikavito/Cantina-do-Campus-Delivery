
import { describe, it, expect } from 'vitest';
import { filtrarEOrdenarItens } from './filtrosCardapio';
import type { ItemCardapio } from '../tipos';

const produtos: ItemCardapio[] = [
  {
    id: 'coxinha',
    nome: 'Coxinha de Frango',
    categoria: 'salgado',
    preco: 700,
    disponivel: true,
    descricao: 'Coxinha crocante',
    adicionais: [],
  },
  {
    id: 'agua',
    nome: 'Água Mineral',
    categoria: 'bebida',
    preco: 300,
    disponivel: true,
    descricao: 'Água gelada',
    adicionais: [],
  },
  {
    id: 'bolo',
    nome: 'Bolo de Chocolate',
    categoria: 'doce',
    preco: 900,
    disponivel: true,
    descricao: 'Bolo caseiro',
    adicionais: [],
  },
];

describe('Filtros e ordenação do cardápio', () => {
  it('deve pesquisar produtos pelo nome', () => {
    const resultado = filtrarEOrdenarItens(
      produtos,
      'coxinha',
      'todas',
      'nome'
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('coxinha');
  });

  it('deve filtrar produtos pela categoria', () => {
    const resultado = filtrarEOrdenarItens(
      produtos,
      '',
      'bebida',
      'nome'
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('agua');
  });

  it('deve ordenar pelo menor preço', () => {
    const resultado = filtrarEOrdenarItens(
      produtos,
      '',
      'todas',
      'menor-preco'
    );

    expect(resultado.map((item) => item.preco)).toEqual([
      300, 700, 900,
    ]);
  });

  it('deve ordenar pelo maior preço', () => {
    const resultado = filtrarEOrdenarItens(
      produtos,
      '',
      'todas',
      'maior-preco'
    );

    expect(resultado.map((item) => item.preco)).toEqual([
      900, 700, 300,
    ]);
  });

  it('deve retornar lista vazia quando não encontrar produtos', () => {
    const resultado = filtrarEOrdenarItens(
      produtos,
      'pizza',
      'todas',
      'nome'
    );

    expect(resultado).toHaveLength(0);
  });

    it('deve pesquisar sem diferenciar letras maiúsculas e minúsculas', () => {
    const resultado = filtrarEOrdenarItens(
      produtos, 'COXINHA', 'todas', 'nome'
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('coxinha');
  });

  it('deve encontrar produtos usando apenas parte do nome', () => {
    const resultado = filtrarEOrdenarItens(
      produtos, 'chocolate', 'todas', 'nome'
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('bolo');
  });

  it('deve combinar pesquisa por nome e categoria', () => {
    const resultado = filtrarEOrdenarItens(
      produtos, 'água', 'bebida', 'nome'
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('agua');
  });

  it('deve ordenar os produtos por nome em ordem alfabética', () => {
    const resultado = filtrarEOrdenarItens(
      produtos, '', 'todas', 'nome'
    );

    expect(resultado.map((item) => item.nome)).toEqual([
      'Água Mineral',
      'Bolo de Chocolate',
      'Coxinha de Frango',
    ]);
  });

  it('não deve alterar a lista original ao ordenar', () => {
    filtrarEOrdenarItens(
      produtos, '', 'todas', 'maior-preco'
    );

    expect(produtos.map((item) => item.id)).toEqual([
      'coxinha',
      'agua',
      'bolo',
    ]);
  });
});
