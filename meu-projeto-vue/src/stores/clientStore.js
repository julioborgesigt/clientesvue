/**
 * @file clientStore.js
 * @description Store Pinia para gerenciamento completo de clientes
 * Controla CRUD de clientes, paginação, filtros, estatísticas, gráficos e logs de ações
 */

import { defineStore } from 'pinia';
import apiClient from '@/api/axios';
import { useNotificationStore } from './notificationStore';

/**
 * Store de Clientes
 * @typedef {Object} ClientState
 * @property {Array} clients - Lista de clientes da página atual
 * @property {Object} stats - Estatísticas do dashboard (custo, lucro, etc)
 * @property {Object} chartData - Dados para gráfico de pagamentos
 * @property {number} currentPage - Página atual da tabela
 * @property {number} limit - Itens por página
 * @property {string} statusFilter - Filtro de status ('vence3', 'pending', etc)
 * @property {string} searchQuery - Termo de busca
 * @property {number} totalClients - Total de clientes (para paginação)
 * @property {boolean} isLoading - Estado de carregamento
 * @property {Array} servicos - Lista de serviços disponíveis
 * @property {Object} serviceDistributionData - Dados do gráfico de distribuição por serviço
 * @property {Array} recentActions - Log de ações recentes
 * @property {boolean} isLoadingActions - Carregamento do log de ações
 * @property {Array} pendingThisMonthClients - Clientes pendentes do mês
 * @property {boolean} isLoadingPendingClients - Carregamento de pendentes
 */

/**
 * Hook do store de clientes
 * @returns {Object} Store de clientes com state, getters e actions
 */
export const useClientStore = defineStore('client', {
    /**
     * Estado do store de clientes
     * @returns {ClientState}
     */
    state: () => ({
        clients: [],
        stats: {},
        chartData: { labels: [], datasets: [] },
        currentPage: 1,
        limit: 20,
        statusFilter: 'vence3', // Filtro padrão
        searchQuery: '',
        totalClients: 0,
        isLoading: false,
        servicos: [],
        serviceDistributionData: { labels: [], datasets: [] },
        recentActions: [], // <-- 1. NOVO ESTADO PARA O LOG
        isLoadingActions: false, // <-- 2. ESTADO DE LOADING PARA O LOG
        pendingThisMonthClients: [], // <-- 1. NOVO ESTADO para guardar a lista
        isLoadingPendingClients: false, // <-- 2. Estado de loading
        showArchived: false, // <-- NOVO: Controla se mostra clientes arquivados
        alerts: [], // <-- NOVO: Clientes com vencimento nos próximos 3 dias
        alertsCount: 0, // <-- NOVO: Contagem de alertas
        isLoadingAlerts: false, // <-- NOVO: Estado de loading dos alertas
    }),
    
    // GETTERS: Dados computados
    getters: {
        totalPages: (state) => Math.ceil(state.totalClients / state.limit),
        pageInfo: (state) => `Página ${state.currentPage} de ${state.totalPages || 1}`,
    },

    /**
     * Actions do store de clientes
     * Métodos para interagir com a API e atualizar o estado
     */
    actions: {
        /**
         * Atualiza o nome de um serviço existente
         * @async
         * @param {number} serviceId - ID do serviço
         * @param {string} newName - Novo nome do serviço
         * @returns {Promise<boolean>} True se sucesso, false se falha
         * @example
         * const success = await clientStore.updateServico(5, 'Hosting Premium')
         */
        async updateServico(serviceId, newName) {
            const notificationStore = useNotificationStore();
            try {
                const response = await apiClient.put(`/servicos/${serviceId}`, { nome: newName });
                
                // Atualiza o nome na lista local
                const index = this.servicos.findIndex(s => s.id === serviceId);
                if (index !== -1) {
                    this.servicos[index].nome = newName.trim();
                    // Reordena a lista
                    this.servicos.sort((a, b) => a.nome.localeCompare(b.nome));
                }
                
                // IMPORTANTE: Se um serviço foi renomeado, a lista de *clientes* também pode precisar
                // ser recarregada para refletir o novo nome no <v-select> do modal de edição de cliente
                // ou na tabela principal, se você exibir o nome lá.
                await this.fetchClients(); // Recarrega clientes para garantir consistência

                notificationStore.success(response.data.message || 'Serviço atualizado com sucesso!');
                return true; // Indica sucesso
            } catch (error) {
                notificationStore.error(error.response?.data?.error || 'Erro ao editar serviço.');
                return false; // Indica falha
            }
        },

        /**
         * Busca lista de clientes com vencimento no mês atual e status pendente
         * Utilizado no card "Pendentes este Mês"
         * @async
         * @returns {Promise<void>}
         */
        async fetchPendingThisMonthClients() {
            this.isLoadingPendingClients = true;
            this.pendingThisMonthClients = [];
            try {
                const response = await apiClient.get('/clientes/pending-this-month');

                // --- INÍCIO DA CORREÇÃO ---
                // Mapeia os resultados e converte valor_cobrado para número
                const formattedClients = response.data.map(client => ({
                    ...client,
                    valor_cobrado: parseFloat(client.valor_cobrado) || 0
                }));
                // --- FIM DA CORREÇÃO ---

                this.pendingThisMonthClients = formattedClients; // Salva os dados formatados
            } catch (error) {
                // Erro silencioso - não há necessidade de notificar o usuário
            } finally {
                this.isLoadingPendingClients = false;
            }
        },

        /**
         * Busca clientes com vencimento nos próximos 3 dias (alertas)
         * Utilizado para mostrar notificações de vencimentos próximos
         * @async
         * @returns {Promise<void>}
         * @example
         * await clientStore.fetchAlerts()
         */
        async fetchAlerts() {
            this.isLoadingAlerts = true;
            this.alerts = [];
            try {
                const response = await apiClient.get('/clientes/alerts');

                // Formata os dados dos clientes
                const formattedAlerts = response.data.map(client => ({
                    ...client,
                    valor_cobrado: parseFloat(client.valor_cobrado) || 0,
                    custo: parseFloat(client.custo) || 0
                }));

                this.alerts = formattedAlerts;
                this.alertsCount = formattedAlerts.length;
            } catch (error) {
                // Erro silencioso - apenas limpa alertas
                this.alerts = [];
                this.alertsCount = 0;
            } finally {
                this.isLoadingAlerts = false;
            }
        },

        /**
         * Reverte uma ação do log (desfazer)
         * Restaura o cliente ao estado anterior à ação registrada
         * @async
         * @param {number} logId - ID do log de ação a reverter
         * @returns {Promise<boolean>} True se reversão bem-sucedida
         * @example
         * await clientStore.revertAction(123)
         */
        async revertAction(logId) {
          const notificationStore = useNotificationStore();
            try {
                // Chama a nova API de reversão
                const response = await apiClient.post(`/clientes/actions/${logId}/revert`);
                notificationStore.success(response.data.message || 'Ação revertida com sucesso!');

                // Atualiza a lista de ações e a lista de clientes para refletir a reversão
                await this.fetchRecentActions();
                await this.fetchClients(); // Importante para ver o dado revertido na tabela
                await this.fetchStats(); // Atualiza os cards também

                return true; // Indica sucesso
            } catch (error) {
                notificationStore.error(error.response?.data?.error || 'Erro ao reverter ação.');
                // Atualiza o log mesmo em caso de erro (pode ter sido marcado como revertido)
                await this.fetchRecentActions();
                return false; // Indica falha
            }
        },

        /**
         * Busca log das ações recentes realizadas nos clientes
         * Exibe últimas 50 ações (edições, mudanças de status, ajustes de data)
         * @async
         * @returns {Promise<void>}
         */
        async fetchRecentActions() {
            this.isLoadingActions = true;
            try {
                const response = await apiClient.get('/clientes/actions/recent'); // Chama a nova rota
                this.recentActions = response.data;
            } catch (error) {
                this.recentActions = []; // Limpa em caso de erro
            } finally {
                this.isLoadingActions = false;
            }
        },

        /**
         * Busca distribuição de clientes por serviço para gráfico de barras
         * @async
         * @returns {Promise<void>}
         */
        async fetchServiceDistribution() {
          try {
            const response = await apiClient.get('/clientes/stats/by-service');
            const { labels, data } = response.data;

            // Prepara a estrutura de dados para Chart.js Bar chart
            // (As cores serão definidas dinamicamente no componente do gráfico)
            this.serviceDistributionData = {
              labels: labels,
              datasets: [
                {
                  label: 'Clientes por Serviço',
                  data: data,
                  backgroundColor: [], // Será preenchido no componente
                  borderColor: [],     // Será preenchido no componente
                  borderWidth: 1
                }
              ]
            };
          } catch (error) {
            // Zera os dados em caso de erro para não mostrar gráfico antigo
            this.serviceDistributionData = { labels: [], datasets: [] };
          }
        },

        /**
         * Busca lista de serviços disponíveis para select de formulários
         * @async
         * @returns {Promise<void>}
         */
        async fetchServicos() {
          try {
            const response = await apiClient.get('/servicos');
            // Armazena a lista no estado. O v-select precisa de { id, nome }
            this.servicos = response.data;
          } catch (error) {
            // Erro silencioso - componente exibirá lista vazia
          }
        },

        /**
         * Adiciona um novo serviço ao sistema
         * @async
         * @param {string} nomeServico - Nome do novo serviço
         * @returns {Promise<boolean>} True se sucesso, false se falha
         * @example
         * await clientStore.addServico('Hospedagem VPS')
         */
        async addServico(nomeServico) {
          const notificationStore = useNotificationStore();
          try {
            const response = await apiClient.post('/servicos', { nome: nomeServico });
            // Adiciona o novo serviço à lista local para não precisar buscar de novo
            this.servicos.push({ id: response.data.id, nome: response.data.nome });
            // Ordena a lista novamente
            this.servicos.sort((a, b) => a.nome.localeCompare(b.nome)); 
            notificationStore.success('Serviço adicionado com sucesso!');
            return true; // Indica sucesso
          } catch (error) {
            notificationStore.error(error.response?.data?.error || 'Erro ao adicionar serviço.');
            return false; // Indica falha
          }
        },

        /**
         * Exclui um serviço do sistema
         * @async
         * @param {number} serviceId - ID do serviço a excluir
         * @returns {Promise<boolean>} True se sucesso, false se falha
         * @example
         * await clientStore.deleteServico(5)
         */
        async deleteServico(serviceId) {
          const notificationStore = useNotificationStore();
          try {
            await apiClient.delete(`/servicos/${serviceId}`);
            // Remove o serviço da lista local para atualizar a UI imediatamente
            this.servicos = this.servicos.filter(s => s.id !== serviceId);
            notificationStore.success('Serviço excluído com sucesso!');
            // Opcional: Se um serviço excluído era o selecionado em algum formulário,
            // você pode querer resetar esse campo aqui ou no componente.
            return true; // Indica sucesso
          } catch (error) {
            notificationStore.error(error.response?.data?.error || 'Erro ao excluir serviço.');
            return false; // Indica falha
          }
        },

        /**
         * Busca lista de clientes com paginação, filtros e busca
         * Action principal para popular a tabela de clientes
         * @async
         * @returns {Promise<void>}
         * @example
         * await clientStore.fetchClients() // Usa filtros atuais do state
         */
        async fetchClients() {
            this.isLoading = true;
            try {
                const params = {
                    page: this.currentPage,
                    limit: this.limit,
                    status: this.statusFilter,
                    search: this.searchQuery,
                    showArchived: this.showArchived, // Inclui filtro de arquivados
                };

                const response = await apiClient.get('/clientes/list', { params });

                // Mapeia os resultados e converte os campos para NÚMERO
                const formattedClients = response.data.data.map(client => ({
                    ...client, // Copia todos os campos (id, name, etc.)
                    // Sobrescreve os campos de valor convertendo-os
                    valor_cobrado: parseFloat(client.valor_cobrado) || 0,
                    custo: parseFloat(client.custo) || 0,
                }));

                this.clients = formattedClients; // Salva a lista formatada
                this.totalClients = response.data.total;

            } catch (error) {
                // Erro silencioso - tabela exibirá lista vazia
            } finally {
                this.isLoading = false; // <-- 3. ADICIONE ESTA LINHA (dentro de um finally)
            }

        },

        /**
         * Handler para eventos de atualização da v-data-table-server
         * Atualiza paginação e recarrega dados
         * @param {Object} options - Opções da tabela
         * @param {number} options.page - Página atual
         * @param {number} options.itemsPerPage - Itens por página (-1 para "All")
         * @param {Array} options.sortBy - Array de ordenação
         * @returns {void}
         */
            handleTableUpdate({ page, itemsPerPage, sortBy }) {
            this.currentPage = page;
            this.limit = itemsPerPage;
            
            // --- INÍCIO DA CORREÇÃO ---
            // Quando Vuetify envia "All", itemsPerPage é -1.
            // Interceptamos isso e substituímos pelo número total de clientes,
            // que a store já conhece (this.totalClients).
            if (this.limit === -1) {
                // Usamos 99999 como um fallback seguro caso totalClients ainda seja 0.
                this.limit = this.totalClients || 99999; 
            }
            // --- FIM DA CORREÇÃO ---

            // (Lógica de Sort/Ordenação, se você quiser implementar no futuro)
            // if (sortBy.length > 0) {
            //   console.log("Ordenando por:", sortBy[0].key, sortBy[0].order);
            // }

            this.fetchClients();
        },

        /**
         * Busca estatísticas do dashboard
         * Retorna custos, lucros, previsões e contagens de clientes por status
         * @async
         * @returns {Promise<void>}
         */
        async fetchStats() {
            try {
                const response = await apiClient.get('/clientes/dashboard-stats');
                const data = response.data;

                // Converte os valores para números antes de salvar no estado
                this.stats = {
                    custoTotal: parseFloat(data.custoTotal) || 0,
                    valorApurado: parseFloat(data.valorApurado) || 0,
                    lucro: parseFloat(data.lucro) || 0,
                    previsto: parseFloat(data.previsto) || 0,
                    // O resto já são números (COUNT), mas não custa garantir
                    totalClientes: parseInt(data.totalClientes) || 0,
                    vencidos: parseInt(data.vencidos) || 0,
                    vence3: parseInt(data.vence3) || 0,
                    emdias: parseInt(data.emdias) || 0,
                };
            } catch (error) {
                // Erro silencioso - stats permanecerão vazias
            }
        },

        /**
         * Busca dados para o gráfico de previsão de pagamentos
         * Retorna próximos 30 dias com valores previstos
         * @async
         * @returns {Promise<void>}
         */
        async fetchChartData() {
            try {
                // Chama a rota GET /clientes/pagamentos/dias
                const response = await apiClient.get('/clientes/pagamentos/dias');
                this.chartData = {
                    labels: response.data.days,
                    datasets: [{
                        label: 'Previsão de Pagamentos',
                        data: response.data.payments,
                        // ...estilos do gráfico
                    }]
                };
            } catch (error) {
                // Erro silencioso - gráfico não será exibido
            }
        },

        /**
         * Atualiza o status de um cliente
         * @async
         * @param {number} id - ID do cliente
         * @param {'pending'|'paid'|'in-day'} statusAction - Novo status
         * @returns {Promise<void>}
         * @example
         * await clientStore.updateClientStatus(123, 'paid')
         */
        async updateClientStatus(id, statusAction) {
          const notificationStore = useNotificationStore();
            // statusAction deve ser 'pending', 'paid', ou 'in-day'
            try {
                // Chama PUT /clientes/mark-pending/:id, mark-paid/:id, etc.
                await apiClient.put(`/clientes/mark-${statusAction}/${id}`);
                notificationStore.success('Status do cliente atualizado com sucesso!');
                this.fetchClients(); // Atualiza a tabela
                this.fetchStats(); // Atualiza os cards
                this.fetchRecentActions(); // <-- Recarrega o log
            } catch (error) {
                notificationStore.error('Erro ao atualizar status do cliente.');
            }
        },

        /**
         * Arquiva um cliente (oculta da visualização principal)
         * @async
         * @param {number} id - ID do cliente
         * @returns {Promise<void>}
         * @example
         * await clientStore.archiveClient(123)
         */
        async archiveClient(id) {
            const notificationStore = useNotificationStore();
            try {
                await apiClient.put(`/clientes/archive/${id}`);
                notificationStore.success('Cliente arquivado com sucesso!');
                this.fetchClients(); // Atualiza a tabela
                this.fetchStats(); // Atualiza os cards
                this.fetchRecentActions(); // Recarrega o log
            } catch (error) {
                notificationStore.error('Erro ao arquivar cliente.');
            }
        },

        /**
         * Desarquiva um cliente (volta a aparecer na visualização principal)
         * @async
         * @param {number} id - ID do cliente
         * @returns {Promise<void>}
         * @example
         * await clientStore.unarchiveClient(123)
         */
        async unarchiveClient(id) {
            const notificationStore = useNotificationStore();
            try {
                await apiClient.put(`/clientes/unarchive/${id}`);
                notificationStore.success('Cliente desarquivado com sucesso!');
                this.fetchClients(); // Atualiza a tabela
                this.fetchStats(); // Atualiza os cards
                this.fetchRecentActions(); // Recarrega o log
            } catch (error) {
                notificationStore.error('Erro ao desarquivar cliente.');
            }
        },

        /**
         * Ajusta a data de vencimento de um cliente
         * @async
         * @param {number} id - ID do cliente
         * @param {number} value - Valor a ajustar (positivo ou negativo)
         * @param {'DAY'|'MONTH'|'YEAR'} unit - Unidade de tempo
         * @returns {Promise<void>}
         * @example
         * await clientStore.adjustClientDate(123, 1, 'MONTH') // +1 mês
         * await clientStore.adjustClientDate(123, -7, 'DAY') // -7 dias
         */
        async adjustClientDate(id, value, unit) {
          const notificationStore = useNotificationStore();
            try {
                // Chama PUT /clientes/adjust-date/:id
                await apiClient.put(`/clientes/adjust-date/${id}`, { value, unit });
                notificationStore.success('Data do cliente ajustada com sucesso!');
                this.fetchClients();
                this.fetchStats();
                this.fetchRecentActions(); // <-- Recarrega o log
            } catch (error) {
                notificationStore.error('Erro ao ajustar data do cliente.');
            }
        },

        /**
         * Exclui um cliente permanentemente
         * @async
         * @param {number} id - ID do cliente a excluir
         * @returns {Promise<void>}
         * @example
         * await clientStore.deleteClient(123)
         */
        async deleteClient(id) {
          const notificationStore = useNotificationStore();
            try {
                // Chama DELETE /clientes/delete/:id
                await apiClient.delete(`/clientes/delete/${id}`);
                notificationStore.success('Cliente deletado com sucesso!');
                this.fetchClients();
                this.fetchStats();
                this.fetchRecentActions(); // <-- Recarrega o log
            } catch (error) {
                notificationStore.error('Erro ao deletar cliente.');
            }
        },

        /**
         * Navega para uma página específica da tabela
         * @param {number} page - Número da página (1-indexed)
         * @returns {void}
         * @example
         * clientStore.setPage(2)
         */
        setPage(page) {
            if (page > 0 && page <= this.totalPages) {
                this.currentPage = page;
                this.fetchClients();
            }
        },

        /**
         * Define filtro de status e recarrega clientes
         * @param {string} status - Filtro de status ('vence3', 'pending', 'paid', etc)
         * @returns {void}
         * @example
         * clientStore.setFilter('vence3')
         */
        setFilter(status) {
            this.statusFilter = status;
            this.searchQuery = ''; // Limpa a busca
            this.currentPage = 1; // Reseta a página
            this.fetchClients();
        },

        /**
         * Define termo de busca e recarrega clientes
         * Deve ser usado com debounce no componente
         * @param {string} query - Termo de busca
         * @returns {void}
         * @example
         * clientStore.setSearch('João Silva')
         */
        setSearch(query) {
            this.searchQuery = query;
            this.statusFilter = ''; // Limpa o filtro de status
            this.currentPage = 1;
            this.fetchClients(); // Idealmente com "debounce"
        },

        /**
         * Alterna visualização entre clientes ativos e arquivados
         * @returns {void}
         * @example
         * clientStore.toggleShowArchived()
         */
        toggleShowArchived() {
            this.showArchived = !this.showArchived;
            this.currentPage = 1; // Reseta para primeira página
            this.fetchClients();
        },

        /**
         * Adiciona um novo cliente ao sistema
         * @async
         * @param {Object} clientData - Dados do cliente
         * @param {string} clientData.name - Nome do cliente
         * @param {string} clientData.whatsapp - WhatsApp do cliente
         * @param {string} clientData.vencimento - Data de vencimento (YYYY-MM-DD)
         * @param {string} clientData.servico - Nome do serviço
         * @param {number} clientData.valor_cobrado - Valor cobrado
         * @param {number} clientData.custo - Custo
         * @param {string} [clientData.observacoes] - Observações opcionais
         * @returns {Promise<void>}
         * @example
         * await clientStore.addClient({
         *   name: 'João Silva',
         *   whatsapp: '+5511987654321',
         *   vencimento: '2025-12-01',
         *   servico: 'Hosting',
         *   valor_cobrado: 50.00,
         *   custo: 30.00
         * })
         */
        async addClient(clientData) {
          const notificationStore = useNotificationStore();
          try {
            await apiClient.post('/clientes/add', clientData);
            notificationStore.success('Cliente adicionado com sucesso!');
            this.fetchClients();
            this.fetchStats();
            this.fetchRecentActions(); // <-- Recarrega o log
          } catch (error) {
            notificationStore.error('Erro ao adicionar cliente.');
          }
        },

        /**
         * Busca mensagem padrão de WhatsApp (padrão ou vencido)
         * @async
         * @param {'default'|'vencido'} [type='default'] - Tipo de mensagem
         * @returns {Promise<string>} Texto da mensagem ou string vazia
         */
        async fetchMessage(type = 'default') {
          try {
            const endpoint = type === 'vencido' ? '/clientes/get-message-vencido' : '/clientes/get-message';
            const response = await apiClient.get(endpoint);
            return response.data.message || '';
          } catch (error) {
            return '';
          }
        },

        /**
         * Salva mensagem padrão de WhatsApp
         * @async
         * @param {string} message - Texto da mensagem
         * @param {'default'|'vencido'} [type='default'] - Tipo de mensagem
         * @returns {Promise<void>}
         */
        async saveMessage(message, type = 'default') {
          const notificationStore = useNotificationStore();
          try {
            const endpoint = type === 'vencido' ? '/clientes/save-message-vencido' : '/clientes/save-message';
            const response = await apiClient.post(endpoint, { message });
            notificationStore.success(response.data.message);
          } catch (error) {
            notificationStore.error('Erro ao salvar mensagem.');
          }
        },

        /**
         * Atualiza dados de um cliente existente
         * @async
         * @param {number} clientId - ID do cliente
         * @param {Object} clientData - Novos dados do cliente (mesma estrutura de addClient)
         * @returns {Promise<void>}
         * @example
         * await clientStore.updateClient(123, { name: 'João Silva Jr.', valor_cobrado: 60.00 })
         */
        async updateClient(clientId, clientData) {
          const notificationStore = useNotificationStore();
          try {
            await apiClient.put(`/clientes/update/${clientId}`, clientData);
            notificationStore.success('Cliente atualizado com sucesso!');
            this.fetchClients(); // Atualiza a tabela
            this.fetchRecentActions();
          } catch (error) {
            notificationStore.error('Erro ao atualizar cliente.');
          }
        }
        
    }, // <-- FIM DO BLOCO 'actions'
    
    
    

});