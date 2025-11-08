import { describe, it, expect } from 'vitest';
import {
  required,
  numeric,
  positiveNumber,
  whatsappFormat,
  email,
  minLength,
  maxLength,
  dateValid,
  nameValid,
  observacoesValid,
  VALID_DDDS,
} from '../validators';

describe('validators.js', () => {
  describe('required', () => {
    it('deve retornar erro para null', () => {
      expect(required(null)).toBe('Campo obrigatório.');
    });

    it('deve retornar erro para undefined', () => {
      expect(required(undefined)).toBe('Campo obrigatório.');
    });

    it('deve retornar erro para string vazia', () => {
      expect(required('')).toBe('Campo obrigatório.');
      expect(required('   ')).toBe('Campo obrigatório.');
    });

    it('deve retornar true para valores válidos', () => {
      expect(required('texto')).toBe(true);
      expect(required(0)).toBe(true);
      expect(required(false)).toBe(true);
    });
  });

  describe('numeric', () => {
    it('deve retornar true para números válidos', () => {
      expect(numeric(0)).toBe(true);
      expect(numeric(10)).toBe(true);
      expect(numeric('15')).toBe(true);
      expect(numeric(100.5)).toBe(true);
    });

    it('deve retornar erro para números negativos', () => {
      expect(numeric(-5)).toBe('Deve ser um número positivo.');
    });

    it('deve retornar erro para valores não numéricos', () => {
      expect(numeric('abc')).toBe('Deve ser um número válido.');
      expect(numeric(NaN)).toBe('Deve ser um número válido.');
    });

    it('deve retornar true para valores vazios', () => {
      expect(numeric('')).toBe(true);
      expect(numeric(null)).toBe(true);
    });
  });

  describe('positiveNumber', () => {
    it('deve retornar true para números positivos', () => {
      expect(positiveNumber(1)).toBe(true);
      expect(positiveNumber(100)).toBe(true);
      expect(positiveNumber('50')).toBe(true);
    });

    it('deve retornar erro para zero', () => {
      expect(positiveNumber(0)).toBe('Deve ser maior que zero.');
    });

    it('deve retornar erro para números negativos', () => {
      expect(positiveNumber(-1)).toBe('Deve ser um número positivo.');
    });
  });

  describe('whatsappFormat', () => {
    it('deve validar WhatsApp com código de país', () => {
      expect(whatsappFormat('+5511987654321')).toBe(true);
      expect(whatsappFormat('5511987654321')).toBe(true);
    });

    it('deve validar WhatsApp sem código de país', () => {
      expect(whatsappFormat('11987654321')).toBe(true);
    });

    it('deve validar WhatsApp formatado', () => {
      expect(whatsappFormat('+55 (11) 98765-4321')).toBe(true);
    });

    it('deve retornar erro para DDD inválido', () => {
      const result = whatsappFormat('+5523987654321'); // Formato correto mas DDD 23 não está na lista
      expect(result).toContain('DDD');
    });

    it('deve retornar erro para número sem 9', () => {
      const result = whatsappFormat('+5511887654321'); // 11 é DDD válido, mas número começa com 8 (não 9)
      // Como o padrão regex exige que comece com 9, o erro genérico é retornado
      expect(result).toContain('Formato');
    });

    it('deve retornar erro para número muito curto', () => {
      const result = whatsappFormat('119876543');
      expect(result).toContain('Formato');
    });

    it('deve retornar true para valores vazios', () => {
      expect(whatsappFormat('')).toBe(true);
      expect(whatsappFormat(null)).toBe(true);
    });
  });

  describe('email', () => {
    it('deve validar emails corretos', () => {
      expect(email('teste@exemplo.com')).toBe(true);
      expect(email('user.name@domain.co.uk')).toBe(true);
      expect(email('email+tag@test.com')).toBe(true);
    });

    it('deve retornar erro para emails inválidos', () => {
      expect(email('invalido')).toBe('Email inválido.');
      expect(email('sem@dominio')).toBe('Email inválido.');
      expect(email('@exemplo.com')).toBe('Email inválido.');
    });

    it('deve retornar true para valores vazios', () => {
      expect(email('')).toBe(true);
      expect(email(null)).toBe(true);
    });
  });

  describe('minLength', () => {
    it('deve validar tamanho mínimo', () => {
      const min3 = minLength(3);
      expect(min3('abc')).toBe(true);
      expect(min3('abcd')).toBe(true);
    });

    it('deve retornar erro para strings curtas', () => {
      const min5 = minLength(5);
      expect(min5('ab')).toBe('Mínimo de 5 caracteres.');
    });

    it('deve retornar true para valores vazios', () => {
      const min3 = minLength(3);
      expect(min3('')).toBe(true);
      expect(min3(null)).toBe(true);
    });
  });

  describe('maxLength', () => {
    it('deve validar tamanho máximo', () => {
      const max5 = maxLength(5);
      expect(max5('abc')).toBe(true);
      expect(max5('abcde')).toBe(true);
    });

    it('deve retornar erro para strings longas', () => {
      const max3 = maxLength(3);
      expect(max3('abcdef')).toBe('Máximo de 3 caracteres.');
    });
  });

  describe('dateValid', () => {
    it('deve validar datas no formato correto', () => {
      const hoje = new Date().toISOString().split('T')[0];
      expect(dateValid(hoje)).toBe(true);
    });

    it('deve retornar erro para datas muito antigas', () => {
      const antiga = '2020-01-01';
      const result = dateValid(antiga);
      expect(result).toContain('muito antiga');
    });

    it('deve retornar erro para datas muito futuras', () => {
      const futura = '2030-01-01';
      const result = dateValid(futura);
      expect(result).toContain('muito distante');
    });

    it('deve retornar erro para formatos inválidos', () => {
      expect(dateValid('31/12/2024')).toBe('Data inválida.');
      expect(dateValid('abc')).toBe('Data inválida.');
    });

    it('deve retornar true para valores vazios', () => {
      expect(dateValid('')).toBe(true);
    });
  });

  describe('nameValid', () => {
    it('deve validar nomes simples', () => {
      expect(nameValid('João Silva')).toBe(true);
      expect(nameValid('Maria')).toBe(true);
    });

    it('deve retornar erro para nomes com HTML', () => {
      expect(nameValid('<script>alert("xss")</script>')).toContain('caracteres inválidos');
      expect(nameValid('Nome<br>')).toContain('caracteres inválidos');
    });

    it('deve retornar erro para nomes com scripts', () => {
      expect(nameValid('javascript:alert(1)')).toContain('conteúdo proibido');
      expect(nameValid('onclick=alert(1)')).toContain('conteúdo proibido');
    });

    it('deve retornar erro para nomes muito longos', () => {
      const nomeLongo = 'a'.repeat(101);
      expect(nameValid(nomeLongo)).toContain('muito longo');
    });

    it('deve retornar true para valores vazios', () => {
      expect(nameValid('')).toBe(true);
    });
  });

  describe('observacoesValid', () => {
    it('deve validar observações simples', () => {
      expect(observacoesValid('Observação válida')).toBe(true);
      expect(observacoesValid('Texto com números 123')).toBe(true);
    });

    it('deve retornar erro para observações com HTML', () => {
      expect(observacoesValid('<div>Teste</div>')).toBe('HTML não é permitido.');
    });

    it('deve retornar erro para observações com scripts', () => {
      expect(observacoesValid('javascript:void(0)')).toContain('Conteúdo proibido');
    });

    it('deve retornar erro para observações muito longas', () => {
      const textoLongo = 'a'.repeat(501);
      expect(observacoesValid(textoLongo)).toContain('muito longas');
    });

    it('deve retornar true para valores vazios', () => {
      expect(observacoesValid('')).toBe(true);
      expect(observacoesValid(null)).toBe(true);
    });
  });

  describe('VALID_DDDS', () => {
    it('deve conter 67 DDDs válidos', () => {
      expect(VALID_DDDS).toHaveLength(67);
    });

    it('deve conter os principais DDDs', () => {
      expect(VALID_DDDS).toContain(11); // SP
      expect(VALID_DDDS).toContain(21); // RJ
      expect(VALID_DDDS).toContain(31); // BH
      expect(VALID_DDDS).toContain(85); // CE
    });

    it('não deve conter DDDs inválidos', () => {
      expect(VALID_DDDS).not.toContain(0);
      expect(VALID_DDDS).not.toContain(10);
      expect(VALID_DDDS).not.toContain(100);
    });
  });
});
