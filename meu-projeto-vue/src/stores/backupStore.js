/**
 * @file backupStore.js
 * @description Store Pinia para gerenciamento de backups do sistema
 * Controla criação, listagem, download e exclusão de backups
 */

import { defineStore } from 'pinia';
import apiClient from '@/api/axios';
import { useNotificationStore } from './notificationStore';

/**
 * Store de Backups
 * @typedef {Object} BackupState
 * @property {Array} backups - Lista de backups disponíveis
 * @property {Object} config - Configuração do sistema de backup
 * @property {boolean} isLoading - Estado de carregamento
 * @property {boolean} isCreating - Estado de criação de backup
 */

/**
 * Hook do store de backups
 * @returns {Object} Store de backups com state, getters e actions
 */
export const useBackupStore = defineStore('backup', {
    /**
     * Estado do store de backups
     * @returns {BackupState}
     */
    state: () => ({
        backups: [],
        config: null,
        isLoading: false,
        isCreating: false,
    }),

    /**
     * Getters do store
     */
    getters: {
        /**
         * Retorna total de backups
         * @param {Object} state - Estado da store
         * @returns {number} Total de backups
         */
        totalBackups: (state) => state.backups.length,

        /**
         * Retorna tamanho total dos backups em bytes
         * @param {Object} state - Estado da store
         * @returns {number} Tamanho total em bytes
         */
        totalSize: (state) => {
            return state.backups.reduce((sum, backup) => sum + (backup.size || 0), 0);
        },

        /**
         * Retorna tamanho total formatado
         * @param {Object} state - Estado da store
         * @returns {string} Tamanho formatado (ex: "10.5 MB")
         */
        totalSizeFormatted: (state) => {
            const bytes = state.backups.reduce((sum, backup) => sum + (backup.size || 0), 0);
            return formatBytes(bytes);
        }
    },

    /**
     * Actions do store de backups
     */
    actions: {
        /**
         * Busca lista de backups disponíveis
         * @async
         * @returns {Promise<void>}
         * @example
         * await backupStore.fetchBackups()
         */
        async fetchBackups() {
            this.isLoading = true;
            try {
                const response = await apiClient.get('/backup');
                console.log('💾 Backups Response:', response.data);
                this.backups = response.data.backups || [];
                console.log('📋 Backups carregados:', this.backups.length, 'backup(s)');
            } catch (error) {
                console.error('❌ Erro ao buscar backups:', error.response?.data || error.message);
                const notificationStore = useNotificationStore();

                // Tratamento específico para erro 403 (permissão negada)
                if (error.response?.status === 403) {
                    const errorData = error.response.data;
                    let message = '🔒 Acesso Negado\n\n';

                    if (errorData.details) {
                        message += `${errorData.message}\n\n`;
                        message += `👤 Usuário logado: ${errorData.details.userEmail}\n`;
                        message += `🔑 E-mail admin configurado: ${errorData.details.adminEmailHint}\n\n`;
                        message += `💡 ${errorData.details.explanation}`;
                    } else {
                        message += errorData.message || 'Você não tem permissão para acessar backups.';
                    }

                    notificationStore.error(message);
                } else {
                    notificationStore.error('Erro ao buscar lista de backups.');
                }

                this.backups = [];
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Cria um novo backup manualmente
         * @async
         * @returns {Promise<boolean>} True se sucesso, false se falha
         * @example
         * const success = await backupStore.createBackup()
         */
        async createBackup() {
            const notificationStore = useNotificationStore();
            this.isCreating = true;
            try {
                const response = await apiClient.post('/backup');
                notificationStore.success(response.data.message || 'Backup criado com sucesso!');

                // Recarrega a lista de backups
                await this.fetchBackups();
                return true;
            } catch (error) {
                // Tratamento específico para erro 403 (permissão negada)
                if (error.response?.status === 403) {
                    const errorData = error.response.data;
                    let message = '🔒 Acesso Negado\n\n';

                    if (errorData.details) {
                        message += `${errorData.message}\n\n`;
                        message += `👤 Usuário logado: ${errorData.details.userEmail}\n`;
                        message += `🔑 E-mail admin configurado: ${errorData.details.adminEmailHint}\n\n`;
                        message += `💡 ${errorData.details.explanation}`;
                    } else {
                        message += errorData.message || 'Você não tem permissão para criar backups.';
                    }

                    notificationStore.error(message);
                } else {
                    notificationStore.error(
                        error.response?.data?.error || 'Erro ao criar backup.'
                    );
                }
                return false;
            } finally {
                this.isCreating = false;
            }
        },

        /**
         * Faz download de um backup específico
         * @async
         * @param {string} filename - Nome do arquivo de backup
         * @returns {Promise<boolean>} True se sucesso, false se falha
         * @example
         * await backupStore.downloadBackup('backup-2025-11-24.sql')
         */
        async downloadBackup(filename) {
            const notificationStore = useNotificationStore();
            try {
                console.log('⬇️ Iniciando download do backup:', filename);
                notificationStore.info('Iniciando download...');

                const response = await apiClient.get(`/backup/${filename}`, {
                    responseType: 'blob' // Importante para download de arquivos
                });

                console.log('✅ Backup baixado, tamanho:', response.data.size, 'bytes');

                // Cria um link temporário para download
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();

                // Limpa
                link.remove();
                window.URL.revokeObjectURL(url);

                notificationStore.success('Download concluído!');
                return true;
            } catch (error) {
                console.error('❌ Erro ao baixar backup:', error.response?.data || error.message);

                // Tratamento específico para erro 403 (permissão negada)
                if (error.response?.status === 403) {
                    const errorData = error.response.data;
                    let message = '🔒 Acesso Negado\n\n';

                    if (errorData.details) {
                        message += `${errorData.message}\n\n`;
                        message += `👤 Usuário logado: ${errorData.details.userEmail}\n`;
                        message += `🔑 E-mail admin configurado: ${errorData.details.adminEmailHint}\n\n`;
                        message += `💡 ${errorData.details.explanation}`;
                    } else {
                        message += errorData.message || 'Você não tem permissão para baixar backups.';
                    }

                    notificationStore.error(message);
                } else {
                    notificationStore.error(
                        error.response?.data?.error || 'Erro ao baixar backup.'
                    );
                }
                return false;
            }
        },

        /**
         * Exclui um backup específico
         * @async
         * @param {string} filename - Nome do arquivo de backup
         * @returns {Promise<boolean>} True se sucesso, false se falha
         * @example
         * await backupStore.deleteBackup('backup-2025-11-24.sql')
         */
        async deleteBackup(filename) {
            const notificationStore = useNotificationStore();
            try {
                console.log('🗑️ Excluindo backup:', filename);
                const response = await apiClient.delete(`/backup/${filename}`);
                console.log('✅ Backup excluído com sucesso');
                notificationStore.success(response.data.message || 'Backup excluído com sucesso!');

                // Recarrega a lista de backups
                await this.fetchBackups();
                return true;
            } catch (error) {
                console.error('❌ Erro ao excluir backup:', error.response?.data || error.message);

                // Tratamento específico para erro 403 (permissão negada)
                if (error.response?.status === 403) {
                    const errorData = error.response.data;
                    let message = '🔒 Acesso Negado\n\n';

                    if (errorData.details) {
                        message += `${errorData.message}\n\n`;
                        message += `👤 Usuário logado: ${errorData.details.userEmail}\n`;
                        message += `🔑 E-mail admin configurado: ${errorData.details.adminEmailHint}\n\n`;
                        message += `💡 ${errorData.details.explanation}`;
                    } else {
                        message += errorData.message || 'Você não tem permissão para excluir backups.';
                    }

                    notificationStore.error(message);
                } else {
                    notificationStore.error(
                        error.response?.data?.error || 'Erro ao excluir backup.'
                    );
                }
                return false;
            }
        },

        /**
         * Busca configuração e status do sistema de backup
         * @async
         * @returns {Promise<void>}
         * @example
         * await backupStore.fetchBackupConfig()
         */
        async fetchBackupConfig() {
            try {
                const response = await apiClient.get('/backup/config/status');
                console.log('⚙️ Backup Config Response:', response.data);

                // Mapear campos do backend para formato esperado pelo frontend
                if (response.data && response.data.config) {
                    this.config = {
                        enabled: response.data.config.autoBackupEnabled || false,
                        retention: response.data.config.retention || null
                    };
                } else {
                    this.config = response.data;
                }

                console.log('✅ Config mapeado:', this.config);
            } catch (error) {
                console.error('❌ Erro ao buscar config de backup:', error.response?.data || error.message);
                this.config = null;
            }
        }
    }
});

/**
 * Formata bytes para formato legível
 * @param {number} bytes - Bytes a formatar
 * @param {number} decimals - Casas decimais (padrão: 2)
 * @returns {string} Tamanho formatado (ex: "10.5 MB")
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
