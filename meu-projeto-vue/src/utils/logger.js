import { isDev } from './env';

export const logger = {
    log: (...args) => {
        if (isDev()) {
            console.log(...args);
        }
    },

    warn: (...args) => {
        if (isDev()) {
            console.warn(...args);
        }
    },

    error: (...args) => {
        // Sempre mostrar erros
        console.error(...args);
    },

    debug: (...args) => {
        if (isDev()) {
            console.debug(...args);
        }
    }
};
