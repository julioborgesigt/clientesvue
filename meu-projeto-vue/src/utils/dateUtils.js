import { logger } from './logger';

/**
 * Formata data do formato ISO para pt-BR
 * @param {string} dateString - Data no formato ISO (YYYY-MM-DD)
 * @returns {string} - Data formatada (DD/MM/YYYY)
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
        // Forçar timezone UTC para evitar off-by-one
        const date = new Date(dateString + 'T03:00:00Z');

        // Verificar se data é válida
        if (isNaN(date.getTime())) {
            logger.warn('Data inválida:', dateString);
            return dateString;
        }

        return date.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        logger.error('Erro ao formatar data:', e);
        return dateString;
    }
};

/**
 * Formata data para input type="date" (YYYY-MM-DD)
 * @param {string|Date} date - Data
 * @returns {string} - Data no formato YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
    if (!date) return '';

    try {
        const d = date instanceof Date ? date : new Date(date);

        if (isNaN(d.getTime())) {
            return '';
        }

        // Extrair componentes em UTC
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch (e) {
        logger.error('Erro ao formatar data para input:', e);
        return '';
    }
};

/**
 * Adiciona dias a uma data
 * @param {string} dateString - Data no formato ISO
 * @param {number} days - Número de dias a adicionar
 * @returns {string} - Nova data no formato ISO
 */
export const addDays = (dateString, days) => {
    const date = new Date(dateString + 'T03:00:00Z');
    date.setUTCDate(date.getUTCDate() + days);
    return formatDateForInput(date);
};
