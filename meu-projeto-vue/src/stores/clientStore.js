// src/stores/clientStore.js
import { defineStore } from 'pinia';
import apiClient from '@/api/axios';
import { useNotificationStore } from './notificationStore';


export const useClientStore = defineStore('client', {
    // STATE: Suas variáveis globais
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
    }),
    
    // GETTERS: Dados computados
    getters: {
        totalPages: (state) => Math.ceil(state.totalClients / state.limit),
        pageInfo: (state) => `Página ${state.currentPage} de ${state.totalPages || 1}`,
    },

    // ACTIONS: Suas funções fetch e de manipulação
    actions: {
        // Ação para buscar a lista de serviços da API

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

                console.log('clientStore: API /pending-this-month SUCESSO. Dados:', formattedClients); 
                
                this.pendingThisMonthClients = formattedClients; // Salva os dados formatados
            } catch (error) {
                console.error('clientStore: ERRO ao buscar /pending-this-month:', error); 
            } finally {
                console.log('clientStore: fetchPendingThisMonthClients FINALIZADA.'); 
                this.isLoadingPendingClients = false;
            }
        },

        // --- NOVA AÇÃO: Reverter ---
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
                console.error(`Erro ao reverter ação ID ${logId}:`, error);
                notificationStore.error(error.response?.data?.error || 'Erro ao reverter ação.');
                // Atualiza o log mesmo em caso de erro (pode ter sido marcado como revertido)
                await this.fetchRecentActions(); 
                return false; // Indica falha
            }
        },
        // --- FIM DA NOVA AÇÃO ---

        async fetchRecentActions() {
            this.isLoadingActions = true;
            try {
                const response = await apiClient.get('/clientes/actions/recent'); // Chama a nova rota
                this.recentActions = response.data;
            } catch (error) {
                console.error('Erro ao buscar ações recentes:', error);
                this.recentActions = []; // Limpa em caso de erro
            } finally {
                this.isLoadingActions = false;
            }
        },

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
            console.error('Erro ao buscar distribuição por serviço:', error);
            // Zera os dados em caso de erro para não mostrar gráfico antigo
            this.serviceDistributionData = { labels: [], datasets: [] }; 
          }
        },
        async fetchServicos() {
          try {
            const response = await apiClient.get('/servicos');
            // Armazena a lista no estado. O v-select precisa de { id, nome }
            this.servicos = response.data; 
          } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            // Poderia adicionar tratamento de erro aqui (ex: mostrar notificação)
          }
        },

        // Ação para adicionar um novo serviço (para o modal de gerenciamento)
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
            console.error('Erro ao adicionar serviço:', error);
            notificationStore.error(error.response?.data?.error || 'Erro ao adicionar serviço.');
            return false; // Indica falha
          }
        },

        // --- NOVA AÇÃO DELETE ---
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
            console.error('Erro ao excluir serviço:', error);
            notificationStore.error(error.response?.data?.error || 'Erro ao excluir serviço.');
            return false; // Indica falha
          }
        },

        // Substitui fetchClients() e parte de updateData()
        async fetchClients() {
            this.isLoading = true;
            try {
                const params = {
                    page: this.currentPage,
                    limit: this.limit,
                    status: this.statusFilter,
                    search: this.searchQuery,
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
                console.error('Erro ao buscar clientes:', error);
            } finally {
                this.isLoading = false; // <-- 3. ADICIONE ESTA LINHA (dentro de um finally)
            }
            
        },

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
        

        // Substitui updateDashboardCounts()
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
                console.error('Erro ao buscar estatísticas:', error);
            }
        },

        // Substitui renderChart()
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
                console.error('Erro ao buscar dados do gráfico:', error);
            }
        },

        // Substitui as ações do dropdown
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
                console.error('Erro ao atualizar status:', error);
                notificationStore.error('Erro ao atualizar status do cliente.');
            }
        },

        // Substitui adjustDate()
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
                console.error('Erro ao ajustar data:', error);
                notificationStore.error('Erro ao ajustar data do cliente.');
            }
        },
        
        // Substitui executeDelete()
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
                console.error('Erro ao deletar cliente:', error);
                notificationStore.error('Erro ao deletar cliente.');
            }
        },

        // Ações de paginação
        setPage(page) {
            if (page > 0 && page <= this.totalPages) {
                this.currentPage = page;
                this.fetchClients();
            }
        },

        // Ação de filtro
        setFilter(status) {
            this.statusFilter = status;
            this.searchQuery = ''; // Limpa a busca
            this.currentPage = 1; // Reseta a página
            this.fetchClients();
        },
        
        // Ação de pesquisa
        setSearch(query) {
            this.searchQuery = query;
            this.statusFilter = ''; // Limpa o filtro de status
            this.currentPage = 1;
            this.fetchClients(); // Idealmente com "debounce"
        },

        // --- Funções do Modal (Agora Corretamente Dentro de 'actions') ---

        async addClient(clientData) {
          const notificationStore = useNotificationStore();
          try {
            await apiClient.post('/clientes/add', clientData);
            notificationStore.success('Cliente adicionado com sucesso!');
            this.fetchClients();
            this.fetchStats();
            this.fetchRecentActions(); // <-- Recarrega o log
          } catch (error) {
            console.error('Erro ao adicionar cliente:', error);
            notificationStore.error('Erro ao adicionar cliente.');
          }
        },

        async fetchMessage(type = 'default') {
          try {
            const endpoint = type === 'vencido' ? '/clientes/get-message-vencido' : '/clientes/get-message';
            const response = await apiClient.get(endpoint);
            return response.data.message || '';
          } catch (error) {
            console.error('Erro ao buscar mensagem:', error);
            return '';
          }
        },

        async saveMessage(message, type = 'default') {
          const notificationStore = useNotificationStore();
          try {
            const endpoint = type === 'vencido' ? '/clientes/save-message-vencido' : '/clientes/save-message';
            const response = await apiClient.post(endpoint, { message });
            notificationStore.success(response.data.message);
          } catch (error) {
            console.error('Erro ao salvar mensagem:', error);
            notificationStore.error('Erro ao salvar mensagem.');
          }
        },

        // Ação para o formulário de edição
        async updateClient(clientId, clientData) {
          const notificationStore = useNotificationStore();
          try {
            await apiClient.put(`/clientes/update/${clientId}`, clientData);
            notificationStore.success('Cliente atualizado com sucesso!');
            this.fetchClients(); // Atualiza a tabela
            this.fetchRecentActions();
          } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            notificationStore.error('Erro ao atualizar cliente.');
          }
        }
        
    }, // <-- FIM DO BLOCO 'actions'
    
    
    

});