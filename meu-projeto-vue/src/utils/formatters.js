/**
 * Formatadores de valores para exibição
 * Centraliza toda formatação de moeda e números
 */

/**
 * Formata valor monetário para Real Brasileiro
 * @param {number|string|null|undefined} value - Valor a formatar
 * @returns {string} Valor formatado (ex: "R$ 1.234,56")
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 * formatCurrency(null)    // "R$ 0,00"
 * formatCurrency("abc")   // "R$ 0,00"
 */
export const formatCurrency = (value) => {
  // Validar entrada
  if (value === null || value === undefined || value === '') {
    return 'R$ 0,00';
  }

  // Converter para número
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Validar se é número válido
  if (isNaN(numValue) || !isFinite(numValue)) {
    console.warn('formatCurrency: valor inválido recebido:', value);
    return 'R$ 0,00';
  }

  // Formatar usando Intl
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

/**
 * Formata número decimal com 2 casas
 * @param {number|string|null|undefined} value - Valor a formatar
 * @returns {string} Valor formatado (ex: "1.234,56")
 */
export const formatDecimal = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0,00';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue) || !isFinite(numValue)) {
    return '0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

/**
 * Formata percentual
 * @param {number} value - Valor decimal (0.15 = 15%)
 * @returns {string} Percentual formatado (ex: "15%")
 */
export const formatPercent = (value) => {
  if (value === null || value === undefined) {
    return '0%';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue) || !isFinite(numValue)) {
    return '0%';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numValue);
};

/**
 * Formata número inteiro
 * @param {number|string|null|undefined} value - Valor a formatar
 * @returns {string} Número formatado (ex: "1.234")
 */
export const formatInteger = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  const numValue = typeof value === 'string' ? parseInt(value) : value;

  if (isNaN(numValue) || !isFinite(numValue)) {
    return '0';
  }

  return new Intl.NumberFormat('pt-BR').format(numValue);
};
