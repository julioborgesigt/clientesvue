/**
 * Obtém variável de ambiente com fallback
 * @param {string} key - Nome da variável
 * @param {any} defaultValue - Valor padrão
 * @returns {any} - Valor da variável
 */
export const getEnv = (key, defaultValue = null) => {
    const value = import.meta.env[key];
    return value !== undefined ? value : defaultValue;
};

/**
 * Verifica se está em modo de desenvolvimento
 */
export const isDev = () => import.meta.env.DEV;

/**
 * Verifica se está em modo de produção
 */
export const isProd = () => import.meta.env.PROD;

/**
 * Log condicional (apenas em dev)
 */
export const devLog = (...args) => {
    if (isDev() || getEnv('VITE_ENABLE_DEBUG') === 'true') {
        console.log(...args);
    }
};
