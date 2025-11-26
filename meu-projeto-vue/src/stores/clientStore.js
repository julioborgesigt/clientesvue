/**
 * @file clientStore.js
 * @description Store Pinia para gerenciamento completo de clientes
 */

import { defineStore } from 'pinia';
import apiClient from '@/api/axios';
import { useNotificationStore } from './notificationStore';
import { logger } from '@/utils/logger';

export const useClientStore = defineStore('client', {
    state: () => ({
        clients: [],
        stats: {},
        chartData: { labels: [], datasets: [] },
        currentPage: 1,
        limit: 20,
        statusFilter: 'vence3',
        searchQuery: '',
        totalClients: 0,
        isLoading: false, // Para a tabela de clientes
        isDashboardLoading: false, // Para o carregamento inicial do dashboard
        servicos: [],
        serviceDistributionData: { labels: [], datasets: [] },
        recentActions: [],
        isLoadingActions: false,
        pendingThisMonthClients: [],
        isLoadingPendingClients: false,
        showArchived: false,
        alerts: [],
        alertsCount: 0,
        isLoadingAlerts: false,
    }),

    getters: {
        totalPages: (state) => Math.ceil(state.totalClients / state.limit),
        pageInfo: (state) => `Página ${state.currentPage} de ${state.totalPages || 1}`,
    },

    actions: {
        /**
         * Otimização: Busca os dados essenciais do dashboard em paralelo para o carregamento inicial.
         */
        async fetchDashboardData() {
            this.isDashboardLoading = true;
            logger.log('🚀 Carregando todos os dados do dashboard...');

            const fetchWithCatch = (promise, name) =>
                promise.catch(error => {
                    logger.error(`Falha ao carregar ${name}:`, error);
                    // Retorne um valor padrão ou simplesmente não faça nada para não quebrar o Promise.all
                    return null;
                });

            try {
                await Promise.all([
                    fetchWithCatch(this.fetchClients(), 'clientes'),
                    fetchWithCatch(this.fetchStats(), 'estatísticas'),
                    fetchWithCatch(this.fetchChartData(), 'dados do gráfico'),
                    fetchWithCatch(this.fetchServicos(), 'serviços'),
                    fetchWithCatch(this.fetchServiceDistribution(), 'distribuição de serviços'),
                    fetchWithCatch(this.fetchRecentActions(), 'ações recentes'),
                    fetchWithCatch(this.fetchAlerts(), 'alertas'),
                ]);
            } catch (error) {
                // Este catch agora é para erros inesperados no próprio Promise.all,
                // já que as falhas individuais são tratadas acima.
                logger.error('Erro inesperado no carregamento do dashboard:', error);
                useNotificationStore().error('Ocorreu um erro geral ao carregar o painel.');
            } finally {
                this.isDashboardLoading = false;
                logger.log('✅ Dados do dashboard carregados.');
            }
        },

        /**
         * @private
         * Otimização: Atualiza os dados principais após uma mutação.
         */
        async _refreshAfterMutation() {
            logger.log('⚡️ Atualizando dados pós-mutação em paralelo...');
            await Promise.all([
                this.fetchClients(),
                this.fetchStats(),
                this.fetchRecentActions(),
            ]);
        },

        async updateServico(serviceId, newName) {
            const notificationStore = useNotificationStore();
            try {
                const response = await apiClient.put(`/servicos/${serviceId}`, { nome: newName });
                notificationStore.success(response.data.message || 'Serviço atualizado!');
                const index = this.servicos.findIndex(s => s.id === serviceId);
                if (index !== -1) {
                    this.servicos[index].nome = newName.trim();
                    this.servicos.sort((a, b) => a.nome.localeCompare(b.nome));
                }
                await this.fetchClients();
                return true;
            } catch (error) {
                notificationStore.error(error.response?.data?.error || 'Erro ao atualizar serviço.');
                return false;
            }
        },

        async fetchPendingThisMonthClients() {
            if (this.isLoadingPendingClients) return;
            this.isLoadingPendingClients = true;
            try {
                const response = await apiClient.get('/clientes/pending-this-month');
                this.pendingThisMonthClients = response.data.map(client => ({
                    ...client,
                    valor_cobrado: parseFloat(client.valor_cobrado) || 0,
                }));
            } catch (error) {
                this.pendingThisMonthClients = [];
            } finally {
                this.isLoadingPendingClients = false;
            }
        },

        async fetchAlerts() {
            if (this.isLoadingAlerts) return;
            this.isLoadingAlerts = true;
            try {
                const response = await apiClient.get('/clientes/alerts');
                this.alerts = response.data.map(client => ({
                    ...client,
                    valor_cobrado: parseFloat(client.valor_cobrado) || 0,
                    custo: parseFloat(client.custo) || 0,
                }));
                this.alertsCount = this.alerts.length;
            } catch (error) {
                this.alerts = [];
                this.alertsCount = 0;
            } finally {
                this.isLoadingAlerts = false;
            }
        },

        async revertAction(logId) {
            const notificationStore = useNotificationStore();
            try {
                const response = await apiClient.post(`/clientes/actions/${logId}/revert`);
                notificationStore.success(response.data.message || 'Ação revertida!');
                await this._refreshAfterMutation(); // Otimizado
                return true;
            } catch (error) {
                notificationStore.error(error.response?.data?.error || 'Erro ao reverter. Tente novamente.');
                await this.fetchRecentActions();
                return false;
            }
        },

        async fetchRecentActions() {
            this.isLoadingActions = true;
            try {
                const response = await apiClient.get('/clientes/actions/recent');
                this.recentActions = response.data;
            } catch (error) {
                this.recentActions = [];
            } finally {
                this.isLoadingActions = false;
            }
        },
        
        async fetchServiceDistribution() {
            try {
                const response = await apiClient.get('/clientes/stats/by-service');
                this.serviceDistributionData = {
                    labels: response.data.labels,
                    datasets: [{
                        label: 'Clientes por Serviço',
                        data: response.data.data,
                        backgroundColor: [],
                        borderColor: [],
                        borderWidth: 1
                    }]
                };
            } catch (error) {
                this.serviceDistributionData = { labels: [], datasets: [] };
            }
        },

        async fetchServicos() {
            try {
                const response = await apiClient.get('/servicos');
                this.servicos = response.data;
            } catch (error) {
                this.servicos = [];
            }
        },

        async addServico(nomeServico) {
            const notificationStore = useNotificationStore();
            try {
                const response = await apiClient.post('/servicos', { nome: nomeServico });
                this.servicos.push({ id: response.data.id, nome: response.data.nome });
                this.servicos.sort((a, b) => a.nome.localeCompare(b.nome));
                notificationStore.success('Serviço adicionado!');
                return true;
            } catch (error) {
                notificationStore.error(error.response?.data?.error || 'Erro ao adicionar serviço.');
                return false;
            }
        },

        async deleteServico(serviceId) {
            const notificationStore = useNotificationStore();
            try {
                await apiClient.delete(`/servicos/${serviceId}`);
                this.servicos = this.servicos.filter(s => s.id !== serviceId);
                notificationStore.success('Serviço excluído!');
                return true;
            } catch (error) {
                notificationStore.error(error.response?.data?.error || 'Erro ao excluir serviço.');
                return false;
            }
        },

        async fetchClients() {
            this.isLoading = true;
            try {
                const params = {
                    page: this.currentPage,
                    limit: this.limit,
                    status: this.statusFilter,
                    search: this.searchQuery,
                    showArchived: this.showArchived,
                };
                const response = await apiClient.get('/clientes/list', { params });
                this.clients = response.data.data.map(client => ({
                    ...client,
                    valor_cobrado: parseFloat(client.valor_cobrado) || 0,
                    custo: parseFloat(client.custo) || 0,
                }));
                this.totalClients = response.data.total;
            } catch (error) {
                this.clients = [];
                this.totalClients = 0;
            } finally {
                this.isLoading = false;
            }
        },
        
        handleTableUpdate({ page, itemsPerPage }) {
            this.currentPage = page;
            this.limit = itemsPerPage === -1 ? (this.totalClients || 99999) : itemsPerPage;
            this.fetchClients();
        },

        async fetchStats() {
            try {
                const response = await apiClient.get('/clientes/dashboard-stats');
                this.stats = response.data;
            } catch (error) {
                this.stats = {};
            }
        },

        async fetchChartData() {
            try {
                const response = await apiClient.get('/clientes/pagamentos/dias');
                this.chartData = {
                    labels: response.data.days,
                    datasets: [{
                        label: 'Previsão de Pagamentos',
                        data: response.data.payments,
                    }]
                };
            } catch (error) {
                this.chartData = { labels: [], datasets: [] };
            }
        },

        async updateClientStatus(id, statusAction) {
            const notificationStore = useNotificationStore();
            try {
                await apiClient.put(`/clientes/mark-${statusAction}/${id}`);
                notificationStore.success('Status atualizado!');
                await this._refreshAfterMutation(); // Otimizado
            } catch (error) {
                notificationStore.error('Erro ao atualizar status. Tente novamente.');
            }
        },

        async archiveClient(id) {
            const notificationStore = useNotificationStore();
            try {
                await apiClient.put(`/clientes/archive/${id}`);
                notificationStore.success('Cliente arquivado!');
                await this._refreshAfterMutation(); // Otimizado
            } catch (error) {
                notificationStore.error('Erro ao arquivar. Tente novamente.');
            }
        },

        async unarchiveClient(id) {
            const notificationStore = useNotificationStore();
            try {
                await apiClient.put(`/clientes/unarchive/${id}`);
                notificationStore.success('Cliente desarquivado!');
                await this._refreshAfterMutation(); // Otimizado
            } catch (error) {
                notificationStore.error('Erro ao desarquivar. Tente novamente.');
            }
        },

        async adjustClientDate(id, value, unit) {
            const notificationStore = useNotificationStore();
            try {
                await apiClient.put(`/clientes/adjust-date/${id}`, { value, unit });
                notificationStore.success('Data ajustada!');
                await this._refreshAfterMutation(); // Otimizado
            } catch (error) {
                notificationStore.error('Erro ao ajustar data. Tente novamente.');
            }
        },

        async deleteClient(id) {
            const notificationStore = useNotificationStore();
            try {
                await apiClient.delete(`/clientes/delete/${id}`);
                notificationStore.success('Cliente excluído!');
                await this._refreshAfterMutation(); // Otimizado
            } catch (error) {
                notificationStore.error('Erro ao excluir. Tente novamente.');
            }
        },
        
        setPage(page) {
            if (page > 0 && page <= this.totalPages) {
                this.currentPage = page;
                this.fetchClients();
            }
        },

        setFilter(status) {
            this.statusFilter = status;
            this.searchQuery = '';
            this.currentPage = 1;
            this.fetchClients();
        },

        setSearch(query) {
            this.searchQuery = query;
            this.statusFilter = '';
            this.currentPage = 1;
            this.fetchClients();
        },

        toggleShowArchived() {
            this.showArchived = !this.showArchived;
            this.currentPage = 1;
            this.fetchClients();
        },

        async addClient(clientData) {
            const notificationStore = useNotificationStore();
            try {
                await apiClient.post('/clientes/add', clientData);
                notificationStore.success('Cliente cadastrado!');
                await this._refreshAfterMutation(); // Otimizado
            } catch (error) {
                notificationStore.error('Erro ao cadastrar cliente. Verifique os dados.');
            }
        },
        
        async fetchMessage(type = 'default') {
            try {
                const endpoint = type === 'vencido' ? '/clientes/get-message-vencido' : '/clientes/get-message';
                const response = await apiClient.get(endpoint);
                return response.data.message || '';
            } catch (error) {
                return '';
            }
        },

        async saveMessage(message, type = 'default') {
            const notificationStore = useNotificationStore();
            try {
                const endpoint = type === 'vencido' ? '/clientes/save-message-vencido' : '/clientes/save-message';
                const response = await apiClient.post(endpoint, { message });
                notificationStore.success(response.data.message || 'Mensagem salva!');
            } catch (error) {
                notificationStore.error('Erro ao salvar. Tente novamente.');
            }
        },

        async updateClient(clientId, clientData) {
            const notificationStore = useNotificationStore();
            try {
                await apiClient.put(`/clientes/update/${clientId}`, clientData);
                notificationStore.success('Cliente atualizado!');
                // Ações de atualização e de log são as mais importantes aqui
                await Promise.all([this.fetchClients(), this.fetchRecentActions()]);
            } catch (error) {
                notificationStore.error('Erro ao atualizar. Verifique os dados.');
            }
        }
    },
});