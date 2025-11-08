/**
 * Validadores para formulários
 * Centraliza todas as regras de validação da aplicação
 */

/**
 * DDDs válidos no Brasil (atualizado 2025)
 */
export const VALID_DDDS = [
  11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
  21, 22, 24, // RJ
  27, 28, // ES
  31, 32, 33, 34, 35, 37, 38, // MG
  41, 42, 43, 44, 45, 46, // PR
  47, 48, 49, // SC
  51, 53, 54, 55, // RS
  61, // DF
  62, 64, // GO
  63, // TO
  65, 66, // MT
  67, // MS
  68, 69, // AC, RO
  71, 73, 74, 75, 77, // BA
  79, // SE
  81, 87, // PE
  82, // AL
  83, // PB
  84, // RN
  85, 88, // CE
  86, 89, // PI
  91, 93, 94, // PA
  92, 97, // AM
  95, // RR
  96, // AP
  98, 99 // MA
];

/**
 * Valida campo obrigatório
 * @param {any} value - Valor a validar
 * @returns {boolean|string} true se válido, mensagem de erro se inválido
 */
export const required = (value) => {
  if (value === null || value === undefined) {
    return 'Campo obrigatório.';
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return 'Campo obrigatório.';
  }

  return true;
};

/**
 * Valida número
 * @param {any} value - Valor a validar
 * @returns {boolean|string} true se válido, mensagem de erro se inválido
 */
export const numeric = (value) => {
  // Se vazio, deixa o required validar
  if (value === null || value === undefined || value === '') {
    return true;
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return 'Deve ser um número válido.';
  }

  if (!Number.isFinite(num)) {
    return 'Número inválido.';
  }

  if (num < 0) {
    return 'Deve ser um número positivo.';
  }

  return true;
};

/**
 * Valida número positivo maior que zero
 * @param {any} value - Valor a validar
 * @returns {boolean|string} true se válido, mensagem de erro se inválido
 */
export const positiveNumber = (value) => {
  const numericResult = numeric(value);
  if (numericResult !== true) return numericResult;

  const num = Number(value);
  if (num <= 0) {
    return 'Deve ser maior que zero.';
  }

  return true;
};

/**
 * Valida formato de WhatsApp
 * @param {string} value - Número de WhatsApp
 * @returns {boolean|string} true se válido, mensagem de erro se inválido
 */
export const whatsappFormat = (value) => {
  // Se vazio, deixa o required validar
  if (!value || value.trim().length === 0) {
    return true;
  }

  // Remove caracteres não numéricos (exceto +)
  const cleaned = value.replace(/[^\d+]/g, '');

  // Padrão: +55 (XX) 9XXXX-XXXX ou 55XX9XXXXXXXX
  // Grupos: (código país opcional) (DDD) (número com 9)
  const pattern = /^(\+?55)?([1-9]{2})(9[0-9]{8})$/;
  const match = cleaned.match(pattern);

  if (!match) {
    return 'Formato: +55XX9XXXXXXXX (11 dígitos após código)';
  }

  // Validar DDD
  const ddd = parseInt(match[2]);
  if (!VALID_DDDS.includes(ddd)) {
    return `DDD ${ddd} inválido. Exemplos válidos: 11, 21, 31, 85...`;
  }

  // Validar 9º dígito (primeiro dígito do número)
  const firstDigit = match[3][0];
  if (firstDigit !== '9') {
    return 'Celular deve começar com 9 (formato: 9XXXX-XXXX)';
  }

  return true;
};

/**
 * Valida email
 * @param {string} value - Email
 * @returns {boolean|string} true se válido, mensagem de erro se inválido
 */
export const email = (value) => {
  if (!value || value.trim().length === 0) {
    return true;
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value)) {
    return 'Email inválido.';
  }

  return true;
};

/**
 * Valida tamanho mínimo
 * @param {number} min - Tamanho mínimo
 * @returns {Function} Função validadora
 */
export const minLength = (min) => {
  return (value) => {
    if (!value) return true;

    if (value.length < min) {
      return `Mínimo de ${min} caracteres.`;
    }

    return true;
  };
};

/**
 * Valida tamanho máximo
 * @param {number} max - Tamanho máximo
 * @returns {Function} Função validadora
 */
export const maxLength = (max) => {
  return (value) => {
    if (!value) return true;

    if (value.length > max) {
      return `Máximo de ${max} caracteres.`;
    }

    return true;
  };
};

/**
 * Valida data com range
 * @param {string} value - Data no formato YYYY-MM-DD
 * @returns {boolean|string} true se válido, mensagem de erro se inválido
 */
export const dateValid = (value) => {
  if (!value || value.trim().length === 0) {
    return true; // Deixa required validar
  }

  try {
    const selectedDate = new Date(value + 'T00:00:00');

    // Verificar se data é válida
    if (isNaN(selectedDate.getTime())) {
      return 'Data inválida.';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Data não pode ser muito antiga (3 meses atrás)
    const minDate = new Date(today);
    minDate.setMonth(minDate.getMonth() - 3);

    // Data não pode ser muito distante (2 anos)
    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 2);

    if (selectedDate < minDate) {
      return 'Data muito antiga (máx. 3 meses atrás).';
    }

    if (selectedDate > maxDate) {
      return 'Data muito distante (máx. 2 anos).';
    }

    return true;
  } catch (e) {
    return 'Data inválida.';
  }
};

/**
 * Valida nome (sem HTML, tamanho razoável)
 * @param {string} value - Nome
 * @returns {boolean|string} true se válido, mensagem de erro se inválido
 */
export const nameValid = (value) => {
  if (!value || value.trim().length === 0) {
    return true; // Deixa required validar
  }

  // Verificar tamanho
  if (value.length > 100) {
    return 'Nome muito longo (máx. 100 caracteres).';
  }

  // Bloquear HTML
  if (/<|>|&lt;|&gt;/.test(value)) {
    return 'Nome contém caracteres inválidos.';
  }

  // Bloquear scripts
  if (/script|javascript|onclick|onerror/i.test(value)) {
    return 'Nome contém conteúdo proibido.';
  }

  return true;
};

/**
 * Valida observações (campo livre, mas limitado)
 * @param {string} value - Observações
 * @returns {boolean|string} true se válido, mensagem de erro se inválido
 */
export const observacoesValid = (value) => {
  if (!value) return true; // Campo opcional

  // Limite de tamanho
  if (value.length > 500) {
    return 'Observações muito longas (máx. 500 caracteres).';
  }

  // Bloquear tags HTML
  if (/<[^>]*>/.test(value)) {
    return 'HTML não é permitido.';
  }

  // Bloquear scripts
  if (/script|javascript|onclick|onerror/i.test(value)) {
    return 'Conteúdo proibido detectado.';
  }

  return true;
};

/**
 * Objeto com todas as regras para uso direto
 */
export const rules = {
  required,
  numeric,
  positiveNumber,
  whatsappFormat,
  email,
  minLength,
  maxLength,
  dateValid,
  nameValid,
  observacoesValid
};
