/**
 * Funções de sanitização para proteger contra XSS e injeção
 */

/**
 * Remove caracteres HTML potencialmente perigosos
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 * @example
 * sanitizeHTML('<script>alert("xss")</script>') // '&lt;script&gt;alert("xss")&lt;/script&gt;'
 */
export const sanitizeHTML = (text) => {
  if (!text || typeof text !== 'string') return '';

  const entities = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };

  return text.replace(/[<>&"'\/]/g, (char) => entities[char]);
};

/**
 * Sanitiza texto para URL (WhatsApp, etc)
 * Remove caracteres de controle e perigosos
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeForURL = (text) => {
  if (!text || typeof text !== 'string') return '';

  // Remove caracteres de controle ASCII (0x00-0x1F e 0x7F)
  let sanitized = text.replace(/[\x00-\x1F\x7F]/g, '');

  // Remove < e >
  sanitized = sanitized.replace(/[<>]/g, '');

  // Remove múltiplos espaços
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized.trim();
};

/**
 * Sanitiza número de telefone
 * Mantém apenas números e símbolo +
 * @param {string} phone - Número de telefone
 * @returns {string} - Número sanitizado
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';

  // Remove tudo exceto números e o símbolo +
  return phone.replace(/[^\d+]/g, '');
};

/**
 * Sanitiza email
 * Remove espaços e converte para lowercase
 * @param {string} email - Email
 * @returns {string} - Email sanitizado
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';

  return email.trim().toLowerCase();
};

/**
 * Sanitiza nome (remove scripts, HTML, caracteres especiais)
 * @param {string} name - Nome
 * @returns {string} - Nome sanitizado
 */
export const sanitizeName = (name) => {
  if (!name || typeof name !== 'string') return '';

  // Remove HTML
  let sanitized = sanitizeHTML(name);

  // Remove múltiplos espaços
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Remove espaços do início e fim
  return sanitized.trim();
};

/**
 * Sanitiza texto livre (observações, comentários)
 * Permite texto simples mas remove HTML e scripts
 * @param {string} text - Texto
 * @param {number} maxLength - Tamanho máximo
 * @returns {string} - Texto sanitizado
 */
export const sanitizeText = (text, maxLength = 500) => {
  if (!text || typeof text !== 'string') return '';

  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');

  // Converter caracteres de controle comuns (tabs, newlines) em espaços
  sanitized = sanitized.replace(/[\t\n\r]/g, ' ');

  // Remove outros caracteres de controle perigosos
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalizar múltiplos espaços em um único espaço
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Limita tamanho
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized.trim();
};

/**
 * Sanitiza número (valor monetário, quantidade)
 * @param {any} value - Valor
 * @returns {number} - Número sanitizado
 */
export const sanitizeNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  // Se já é número, retornar
  if (typeof value === 'number') {
    return isNaN(value) || !isFinite(value) ? 0 : value;
  }

  // Converter string para número
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

/**
 * Sanitiza data (formato ISO)
 * @param {string} date - Data
 * @returns {string|null} - Data sanitizada ou null se inválida
 */
export const sanitizeDate = (date) => {
  if (!date || typeof date !== 'string') return null;

  // Aceita apenas formato YYYY-MM-DD
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(date)) {
    return null;
  }

  // Validar se é data válida
  const dateObj = new Date(date + 'T00:00:00');
  if (isNaN(dateObj.getTime())) {
    return null;
  }

  // Validar que os componentes da data correspondem ao input
  // (evita datas como 2024-02-30 que rolam para março)
  const [year, month, day] = date.split('-').map(Number);
  if (dateObj.getUTCFullYear() !== year ||
      dateObj.getUTCMonth() + 1 !== month ||
      dateObj.getUTCDate() !== day) {
    return null;
  }

  return date;
};

/**
 * Remove espaços extras de string
 * @param {string} text - Texto
 * @returns {string} - Texto sem espaços extras
 */
export const trimExtraSpaces = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Sanitiza objeto de cliente para envio à API
 * @param {Object} client - Dados do cliente
 * @returns {Object} - Cliente sanitizado
 */
export const sanitizeClientData = (client) => {
  return {
    name: sanitizeText(client.name, 100),
    whatsapp: sanitizePhone(client.whatsapp),
    vencimento: sanitizeDate(client.vencimento),
    servico: sanitizeText(client.servico, 50),
    valor_cobrado: sanitizeNumber(client.valor_cobrado),
    custo: sanitizeNumber(client.custo),
    observacoes: sanitizeText(client.observacoes, 500)
  };
};
