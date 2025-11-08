/**
 * Utilitários para gerenciar status de clientes
 */

/**
 * Retorna a cor do Vuetify baseada no status do cliente
 * @param {string} status - Status do cliente
 * @returns {string} Nome da cor do Vuetify
 * @example
 * getStatusColor('Não pagou')      // 'red-darken-1'
 * getStatusColor('cobrança feita') // 'orange-darken-1'
 * getStatusColor('Pag. em dias')   // 'green-darken-1'
 */
export const getStatusColor = (status) => {
  if (!status) return 'grey';

  const statusColors = {
    'Não pagou': 'red-darken-1',
    'cobrança feita': 'orange-darken-1',
    'Pag. em dias': 'green-darken-1'
  };

  return statusColors[status] || 'grey';
};

/**
 * Retorna ícone baseado no status
 * @param {string} status - Status do cliente
 * @returns {string} Nome do ícone MDI
 */
export const getStatusIcon = (status) => {
  if (!status) return 'mdi-help-circle-outline';

  const statusIcons = {
    'Não pagou': 'mdi-alert-circle-outline',
    'cobrança feita': 'mdi-clock-alert-outline',
    'Pag. em dias': 'mdi-check-circle-outline'
  };

  return statusIcons[status] || 'mdi-help-circle-outline';
};

/**
 * Retorna label amigável do status
 * @param {string} status - Status do cliente
 * @returns {string} Label formatada
 */
export const getStatusLabel = (status) => {
  if (!status) return 'Indefinido';

  const statusLabels = {
    'Não pagou': 'Pendente',
    'cobrança feita': 'Em Cobrança',
    'Pag. em dias': 'Em Dia'
  };

  return statusLabels[status] || status;
};

/**
 * Lista todos os status disponíveis
 * @returns {Array} Array de objetos com status
 */
export const getAllStatuses = () => {
  return [
    { value: 'Não pagou', label: 'Pendente', color: 'red-darken-1' },
    { value: 'cobrança feita', label: 'Em Cobrança', color: 'orange-darken-1' },
    { value: 'Pag. em dias', label: 'Em Dia', color: 'green-darken-1' }
  ];
};
