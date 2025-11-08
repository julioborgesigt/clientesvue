import { describe, it, expect } from 'vitest';
import {
  sanitizeHTML,
  sanitizeForURL,
  sanitizePhone,
  sanitizeEmail,
  sanitizeName,
  sanitizeText,
  sanitizeNumber,
  sanitizeDate,
  trimExtraSpaces,
  sanitizeClientData,
} from '../sanitize';

describe('sanitize.js - CRÍTICO PARA SEGURANÇA', () => {
  describe('sanitizeHTML', () => {
    it('deve escapar caracteres HTML perigosos', () => {
      expect(sanitizeHTML('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('deve escapar todos os caracteres especiais', () => {
      expect(sanitizeHTML('<>&"\'/'))
        .toBe('&lt;&gt;&amp;&quot;&#39;&#x2F;');
    });

    it('deve retornar string vazia para null', () => {
      expect(sanitizeHTML(null)).toBe('');
      expect(sanitizeHTML(undefined)).toBe('');
      expect(sanitizeHTML('')).toBe('');
    });

    it('deve tratar texto normal sem alteração', () => {
      expect(sanitizeHTML('Texto normal sem HTML')).toBe('Texto normal sem HTML');
    });
  });

  describe('sanitizeForURL', () => {
    it('deve remover caracteres de controle', () => {
      const textoComControle = 'Texto\x00com\x1Fcaracteres\x7Fde controle';
      const result = sanitizeForURL(textoComControle);
      expect(result).not.toContain('\x00');
      expect(result).not.toContain('\x1F');
      expect(result).not.toContain('\x7F');
    });

    it('deve remover < e >', () => {
      expect(sanitizeForURL('Texto<tag>aqui')).toBe('Textotagaqui');
    });

    it('deve normalizar múltiplos espaços', () => {
      expect(sanitizeForURL('Texto    com    espaços')).toBe('Texto com espaços');
    });

    it('deve fazer trim', () => {
      expect(sanitizeForURL('  Texto  ')).toBe('Texto');
    });

    it('deve retornar string vazia para null', () => {
      expect(sanitizeForURL(null)).toBe('');
      expect(sanitizeForURL('')).toBe('');
    });
  });

  describe('sanitizePhone', () => {
    it('deve manter apenas números e +', () => {
      expect(sanitizePhone('+55 (11) 98765-4321')).toBe('+5511987654321');
    });

    it('deve remover letras', () => {
      expect(sanitizePhone('11abc98765def4321')).toBe('11987654321');
    });

    it('deve remover caracteres especiais', () => {
      expect(sanitizePhone('11@98765#4321')).toBe('11987654321');
    });

    it('deve retornar string vazia para null', () => {
      expect(sanitizePhone(null)).toBe('');
      expect(sanitizePhone('')).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('deve converter para lowercase', () => {
      expect(sanitizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
    });

    it('deve fazer trim', () => {
      expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
    });

    it('deve retornar string vazia para null', () => {
      expect(sanitizeEmail(null)).toBe('');
      expect(sanitizeEmail('')).toBe('');
    });
  });

  describe('sanitizeName', () => {
    it('deve sanitizar nome com HTML', () => {
      const result = sanitizeName('<script>alert(1)</script>João');
      expect(result).not.toContain('<script>');
      expect(result).toContain('João');
    });

    it('deve normalizar espaços', () => {
      expect(sanitizeName('João    Silva')).toBe('João Silva');
    });

    it('deve fazer trim', () => {
      expect(sanitizeName('  João Silva  ')).toBe('João Silva');
    });

    it('deve retornar string vazia para null', () => {
      expect(sanitizeName(null)).toBe('');
      expect(sanitizeName(undefined)).toBe('');
    });

    it('deve retornar string vazia para não-string', () => {
      expect(sanitizeName(123)).toBe('');
      expect(sanitizeName({})).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('deve remover tags HTML', () => {
      expect(sanitizeText('<p>Texto</p>')).toBe('Texto');
      expect(sanitizeText('Texto<br>quebrado')).toBe('Textoquebrado');
    });

    it('deve remover caracteres de controle', () => {
      const textoComControle = 'Texto\x00\x1F\x7Fcom controle';
      const result = sanitizeText(textoComControle);
      expect(result).toBe('Textocom controle');
    });

    it('deve normalizar espaços', () => {
      expect(sanitizeText('Texto\n\ncom\r\nvários\tespaços')).toBe('Texto com vários espaços');
    });

    it('deve limitar tamanho', () => {
      const textoLongo = 'a'.repeat(600);
      const result = sanitizeText(textoLongo, 100);
      expect(result).toHaveLength(100);
    });

    it('deve usar tamanho padrão de 500', () => {
      const textoLongo = 'a'.repeat(600);
      const result = sanitizeText(textoLongo);
      expect(result).toHaveLength(500);
    });

    it('deve retornar string vazia para null', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText('')).toBe('');
    });
  });

  describe('sanitizeNumber', () => {
    it('deve retornar números válidos', () => {
      expect(sanitizeNumber(10)).toBe(10);
      expect(sanitizeNumber(15.5)).toBe(15.5);
    });

    it('deve converter strings para números', () => {
      expect(sanitizeNumber('10')).toBe(10);
      expect(sanitizeNumber('15.5')).toBe(15.5);
    });

    it('deve retornar 0 para valores inválidos', () => {
      expect(sanitizeNumber('abc')).toBe(0);
      expect(sanitizeNumber(NaN)).toBe(0);
      expect(sanitizeNumber(Infinity)).toBe(0);
    });

    it('deve retornar 0 para null/undefined', () => {
      expect(sanitizeNumber(null)).toBe(0);
      expect(sanitizeNumber(undefined)).toBe(0);
      expect(sanitizeNumber('')).toBe(0);
    });
  });

  describe('sanitizeDate', () => {
    it('deve aceitar datas válidas no formato ISO', () => {
      expect(sanitizeDate('2024-12-25')).toBe('2024-12-25');
      expect(sanitizeDate('2025-01-01')).toBe('2025-01-01');
    });

    it('deve retornar null para formatos inválidos', () => {
      expect(sanitizeDate('25/12/2024')).toBeNull();
      expect(sanitizeDate('2024-13-01')).toBeNull(); // Mês inválido
      expect(sanitizeDate('abc')).toBeNull();
    });

    it('deve retornar null para datas inválidas', () => {
      expect(sanitizeDate('2024-02-30')).toBeNull(); // 30 de fevereiro não existe
    });

    it('deve retornar null para null/undefined', () => {
      expect(sanitizeDate(null)).toBeNull();
      expect(sanitizeDate(undefined)).toBeNull();
      expect(sanitizeDate('')).toBeNull();
    });
  });

  describe('trimExtraSpaces', () => {
    it('deve remover espaços extras', () => {
      expect(trimExtraSpaces('Texto    com    espaços')).toBe('Texto com espaços');
    });

    it('deve fazer trim', () => {
      expect(trimExtraSpaces('  Texto  ')).toBe('Texto');
    });

    it('deve normalizar tabs e quebras de linha', () => {
      expect(trimExtraSpaces('Texto\t\tcom\n\ntabs')).toBe('Texto com tabs');
    });

    it('deve retornar string vazia para null', () => {
      expect(trimExtraSpaces(null)).toBe('');
      expect(trimExtraSpaces('')).toBe('');
    });
  });

  describe('sanitizeClientData - INTEGRAÇÃO', () => {
    it('deve sanitizar todos os campos de um cliente', () => {
      const clienteSujo = {
        name: '<script>João</script>',
        whatsapp: '+55 (11) 98765-4321',
        vencimento: '2025-01-15',
        servico: 'Hospedagem<br>',
        valor_cobrado: '100.50',
        custo: '50',
        observacoes: '<p>Observação</p>   com   espaços',
      };

      const resultado = sanitizeClientData(clienteSujo);

      expect(resultado.name).not.toContain('<script>');
      expect(resultado.whatsapp).toBe('+5511987654321');
      expect(resultado.vencimento).toBe('2025-01-15');
      expect(resultado.servico).not.toContain('<br>');
      expect(resultado.valor_cobrado).toBe(100.50);
      expect(resultado.custo).toBe(50);
      expect(resultado.observacoes).not.toContain('<p>');
      expect(resultado.observacoes).not.toContain('   ');
    });

    it('deve tratar valores inválidos graciosamente', () => {
      const clienteInvalido = {
        name: null,
        whatsapp: '',
        vencimento: 'data-invalida',
        servico: undefined,
        valor_cobrado: 'abc',
        custo: NaN,
        observacoes: null,
      };

      const resultado = sanitizeClientData(clienteInvalido);

      expect(resultado.name).toBe('');
      expect(resultado.whatsapp).toBe('');
      expect(resultado.vencimento).toBeNull();
      expect(resultado.servico).toBe('');
      expect(resultado.valor_cobrado).toBe(0);
      expect(resultado.custo).toBe(0);
      expect(resultado.observacoes).toBe('');
    });

    it('deve limitar tamanho dos campos', () => {
      const clienteComCamposLongos = {
        name: 'a'.repeat(200),
        whatsapp: '+5511987654321',
        vencimento: '2025-01-15',
        servico: 'b'.repeat(100),
        valor_cobrado: 100,
        custo: 50,
        observacoes: 'c'.repeat(600),
      };

      const resultado = sanitizeClientData(clienteComCamposLongos);

      expect(resultado.name.length).toBeLessThanOrEqual(100);
      expect(resultado.servico.length).toBeLessThanOrEqual(50);
      expect(resultado.observacoes.length).toBeLessThanOrEqual(500);
    });
  });

  describe('Proteção contra XSS - Testes de Segurança', () => {
    const payloadsXSS = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)">',
      '<body onload=alert(1)>',
      '<input onfocus=alert(1) autofocus>',
    ];

    payloadsXSS.forEach((payload) => {
      it(`deve bloquear XSS payload: ${payload}`, () => {
        const resultHTML = sanitizeHTML(payload);
        const resultText = sanitizeText(payload);
        const resultName = sanitizeName(payload);

        // Verifica que tags HTML são escapadas (não executáveis)
        expect(resultHTML).not.toContain('<script>');
        expect(resultHTML).not.toContain('<img');
        expect(resultHTML).not.toContain('<svg');
        expect(resultHTML).not.toContain('<iframe');
        expect(resultHTML).not.toContain('<body');
        expect(resultHTML).not.toContain('<input');

        // sanitizeText e sanitizeName removem tags completamente
        expect(resultText).not.toContain('<script>');
        expect(resultText).not.toContain('<img');

        expect(resultName).not.toContain('<script>');
        expect(resultName).not.toContain('<img');
      });
    });
  });
});
