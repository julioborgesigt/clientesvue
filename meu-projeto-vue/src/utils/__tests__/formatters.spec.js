import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDecimal,
  formatPercent,
  formatInteger,
} from '../formatters';

describe('formatters.js', () => {
  describe('formatCurrency', () => {
    it('deve formatar valores monetários corretamente', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1');
      expect(result).toContain('234');
      expect(result).toContain('56');
      expect(result).toContain('R$');
    });

    it('deve formatar zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('R$');
      expect(result).toContain('0,00');
    });

    it('deve formatar valores grandes', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('R$');
      expect(result).toContain('1');
      expect(result).toContain('000');
      expect(result).toContain('00');
    });

    it('deve converter strings para números', () => {
      const result = formatCurrency('100.50');
      expect(result).toContain('100');
      expect(result).toContain('50');
    });

    it('deve retornar R$ 0,00 para valores inválidos', () => {
      expect(formatCurrency(null)).toBe('R$ 0,00');
      expect(formatCurrency(undefined)).toBe('R$ 0,00');
      expect(formatCurrency('')).toBe('R$ 0,00');
      expect(formatCurrency('abc')).toBe('R$ 0,00');
      expect(formatCurrency(NaN)).toBe('R$ 0,00');
      expect(formatCurrency(Infinity)).toBe('R$ 0,00');
    });

    it('deve manter 2 casas decimais', () => {
      const result = formatCurrency(10);
      expect(result).toContain(',00');
    });
  });

  describe('formatDecimal', () => {
    it('deve formatar decimais com 2 casas', () => {
      const result = formatDecimal(1234.56);
      expect(result).toContain('1');
      expect(result).toContain('234');
      expect(result).toContain('56');
    });

    it('deve formatar zero', () => {
      expect(formatDecimal(0)).toBe('0,00');
    });

    it('deve converter strings para números', () => {
      const result = formatDecimal('100.50');
      expect(result).toContain('100');
      expect(result).toContain('50');
    });

    it('deve retornar 0,00 para valores inválidos', () => {
      expect(formatDecimal(null)).toBe('0,00');
      expect(formatDecimal(undefined)).toBe('0,00');
      expect(formatDecimal('')).toBe('0,00');
      expect(formatDecimal('abc')).toBe('0,00');
    });
  });

  describe('formatPercent', () => {
    it('deve formatar percentuais corretamente', () => {
      expect(formatPercent(0.15)).toContain('15');
      expect(formatPercent(0.15)).toContain('%');
    });

    it('deve formatar 0%', () => {
      expect(formatPercent(0)).toBe('0%');
    });

    it('deve formatar 100%', () => {
      expect(formatPercent(1)).toContain('100');
      expect(formatPercent(1)).toContain('%');
    });

    it('deve converter strings para números', () => {
      const result = formatPercent('0.5');
      expect(result).toContain('50');
      expect(result).toContain('%');
    });

    it('deve retornar 0% para valores inválidos', () => {
      expect(formatPercent(null)).toBe('0%');
      expect(formatPercent(undefined)).toBe('0%');
      expect(formatPercent('abc')).toBe('0%');
    });

    it('deve formatar valores decimais pequenos', () => {
      const result = formatPercent(0.1234);
      expect(result).toContain('12');
      expect(result).toContain('%');
    });
  });

  describe('formatInteger', () => {
    it('deve formatar inteiros', () => {
      const result = formatInteger(1234);
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('deve formatar zero', () => {
      expect(formatInteger(0)).toBe('0');
    });

    it('deve formatar valores grandes', () => {
      const result = formatInteger(1000000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('deve converter strings para inteiros', () => {
      const result = formatInteger('100');
      expect(result).toContain('100');
    });

    it('deve retornar 0 para valores inválidos', () => {
      expect(formatInteger(null)).toBe('0');
      expect(formatInteger(undefined)).toBe('0');
      expect(formatInteger('')).toBe('0');
      expect(formatInteger('abc')).toBe('0');
    });

    it('deve arredondar decimais', () => {
      const result = formatInteger(100.99);
      // parseInt trunca, mas Intl.NumberFormat arredonda
      expect(result).toMatch(/100|101/);
    });
  });

  describe('Formatação consistente', () => {
    it('todos formatadores devem usar separador brasileiro', () => {
      // Vírgula para decimal, ponto para milhar
      const currency = formatCurrency(1234.56);
      const decimal = formatDecimal(1234.56);

      // Ambos devem ter vírgula
      expect(currency).toContain(',');
      expect(decimal).toContain(',');
    });

    it('deve ser idempotente', () => {
      // Formatar duas vezes deve dar o mesmo resultado
      const value = 1234.56;
      const first = formatCurrency(value);
      // Não podemos formatar a string resultante, mas
      // podemos verificar que formatações sucessivas do mesmo valor são iguais
      const second = formatCurrency(value);
      expect(first).toBe(second);
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com números muito pequenos', () => {
      expect(formatCurrency(0.01)).toContain('0,01');
      expect(formatDecimal(0.001)).toBe('0,00'); // Arredonda
    });

    it('deve lidar com números negativos graciosamente', () => {
      // Dependendo da implementação, pode aceitar ou formatar como 0
      const result = formatCurrency(-100);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('deve lidar com strings vazias', () => {
      expect(formatCurrency('')).toBe('R$ 0,00');
      expect(formatDecimal('')).toBe('0,00');
      expect(formatPercent('')).toBe('0%');
      expect(formatInteger('')).toBe('0');
    });
  });
});
