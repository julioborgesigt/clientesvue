import { describe, it, expect } from 'vitest';
import {
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  getAllStatuses,
} from '../statusUtils';

describe('statusUtils.js', () => {
  describe('getStatusColor', () => {
    it('deve retornar cor correta para "Não pagou"', () => {
      expect(getStatusColor('Não pagou')).toBe('red-darken-1');
    });

    it('deve retornar cor correta para "cobrança feita"', () => {
      expect(getStatusColor('cobrança feita')).toBe('orange-darken-1');
    });

    it('deve retornar cor correta para "Pag. em dias"', () => {
      expect(getStatusColor('Pag. em dias')).toBe('green-darken-1');
    });

    it('deve retornar grey para status desconhecido', () => {
      expect(getStatusColor('status-invalido')).toBe('grey');
    });

    it('deve retornar grey para null/undefined', () => {
      expect(getStatusColor(null)).toBe('grey');
      expect(getStatusColor(undefined)).toBe('grey');
      expect(getStatusColor('')).toBe('grey');
    });
  });

  describe('getStatusIcon', () => {
    it('deve retornar ícone correto para "Não pagou"', () => {
      expect(getStatusIcon('Não pagou')).toBe('mdi-alert-circle-outline');
    });

    it('deve retornar ícone correto para "cobrança feita"', () => {
      expect(getStatusIcon('cobrança feita')).toBe('mdi-clock-alert-outline');
    });

    it('deve retornar ícone correto para "Pag. em dias"', () => {
      expect(getStatusIcon('Pag. em dias')).toBe('mdi-check-circle-outline');
    });

    it('deve retornar ícone padrão para status desconhecido', () => {
      expect(getStatusIcon('status-invalido')).toBe('mdi-help-circle-outline');
    });

    it('deve retornar ícone padrão para null/undefined', () => {
      expect(getStatusIcon(null)).toBe('mdi-help-circle-outline');
      expect(getStatusIcon(undefined)).toBe('mdi-help-circle-outline');
    });
  });

  describe('getStatusLabel', () => {
    it('deve retornar label amigável para "Não pagou"', () => {
      expect(getStatusLabel('Não pagou')).toBe('Pendente');
    });

    it('deve retornar label amigável para "cobrança feita"', () => {
      expect(getStatusLabel('cobrança feita')).toBe('Em Cobrança');
    });

    it('deve retornar label amigável para "Pag. em dias"', () => {
      expect(getStatusLabel('Pag. em dias')).toBe('Em Dia');
    });

    it('deve retornar o próprio status para valores desconhecidos', () => {
      expect(getStatusLabel('status-custom')).toBe('status-custom');
    });

    it('deve retornar "Indefinido" para null/undefined', () => {
      expect(getStatusLabel(null)).toBe('Indefinido');
      expect(getStatusLabel(undefined)).toBe('Indefinido');
    });
  });

  describe('getAllStatuses', () => {
    it('deve retornar array com todos os status', () => {
      const statuses = getAllStatuses();
      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses).toHaveLength(3);
    });

    it('deve retornar status com estrutura correta', () => {
      const statuses = getAllStatuses();
      statuses.forEach((status) => {
        expect(status).toHaveProperty('value');
        expect(status).toHaveProperty('label');
        expect(status).toHaveProperty('color');
      });
    });

    it('deve incluir todos os 3 status principais', () => {
      const statuses = getAllStatuses();
      const values = statuses.map((s) => s.value);

      expect(values).toContain('Não pagou');
      expect(values).toContain('cobrança feita');
      expect(values).toContain('Pag. em dias');
    });

    it('deve ter cores consistentes', () => {
      const statuses = getAllStatuses();

      const pendente = statuses.find((s) => s.value === 'Não pagou');
      const cobranca = statuses.find((s) => s.value === 'cobrança feita');
      const emDia = statuses.find((s) => s.value === 'Pag. em dias');

      expect(pendente.color).toBe('red-darken-1');
      expect(cobranca.color).toBe('orange-darken-1');
      expect(emDia.color).toBe('green-darken-1');
    });

    it('deve ter labels amigáveis', () => {
      const statuses = getAllStatuses();

      const pendente = statuses.find((s) => s.value === 'Não pagou');
      const cobranca = statuses.find((s) => s.value === 'cobrança feita');
      const emDia = statuses.find((s) => s.value === 'Pag. em dias');

      expect(pendente.label).toBe('Pendente');
      expect(cobranca.label).toBe('Em Cobrança');
      expect(emDia.label).toBe('Em Dia');
    });
  });

  describe('Consistência entre funções', () => {
    it('getStatusColor e getAllStatuses devem retornar cores iguais', () => {
      const statuses = getAllStatuses();

      statuses.forEach((status) => {
        const cor = getStatusColor(status.value);
        expect(cor).toBe(status.color);
      });
    });

    it('getStatusLabel e getAllStatuses devem retornar labels iguais', () => {
      const statuses = getAllStatuses();

      statuses.forEach((status) => {
        const label = getStatusLabel(status.value);
        expect(label).toBe(status.label);
      });
    });

    it('todos os status devem ter ícone correspondente', () => {
      const statuses = getAllStatuses();

      statuses.forEach((status) => {
        const icon = getStatusIcon(status.value);
        expect(icon).toBeTruthy();
        expect(icon).toContain('mdi-');
      });
    });
  });
});
