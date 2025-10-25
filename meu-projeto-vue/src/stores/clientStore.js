// src/stores/clientStore.js
import { defineStore } from 'pinia';
import apiClient from '@/api/axios';

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
    }),
    
    // GETTERS: Dados computados
    getters: {
        totalPages: (state) => Math.ceil(state.totalClients / state.limit),
        pageInfo: (state) => `Página ${state.currentPage} de ${state.totalPages || 1}`,
    },

    // ACTIONS: Suas funções fetch e de manipulação
    actions: {
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
            // statusAction deve ser 'pending', 'paid', ou 'in-day'
            try {
                // Chama PUT /clientes/mark-pending/:id, mark-paid/:id, etc.
                await apiClient.put(`/clientes/mark-${statusAction}/${id}`);
                this.fetchClients(); // Atualiza a tabela
                this.fetchStats(); // Atualiza os cards
            } catch (error) {
                console.error('Erro ao atualizar status:', error);
            }
        },

        // Substitui adjustDate()
        async adjustClientDate(id, value, unit) {
            try {
                // Chama PUT /clientes/adjust-date/:id
                await apiClient.put(`/clientes/adjust-date/${id}`, { value, unit });
                this.fetchClients(); 
                this.fetchStats();
            } catch (error) {
                console.error('Erro ao ajustar data:', error);
            }
        },
        
        // Substitui executeDelete()
        async deleteClient(id) {
            try {
                // Chama DELETE /clientes/delete/:id
                await apiClient.delete(`/clientes/delete/${id}`);
                this.fetchClients();
                this.fetchStats();
            } catch (error) {
                console.error('Erro ao deletar cliente:', error);
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
          try {
            await apiClient.post('/clientes/add', clientData);
            alert('Cliente adicionado com sucesso!');
            this.fetchClients();
            this.fetchStats();
          } catch (error) {
            console.error('Erro ao adicionar cliente:', error);
            alert('Erro ao adicionar cliente.');
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
          try {
            const endpoint = type === 'vencido' ? '/clientes/save-message-vencido' : '/clientes/save-message';
            const response = await apiClient.post(endpoint, { message });
            alert(response.data.message);
          } catch (error) {
            console.error('Erro ao salvar mensagem:', error);
            alert('Erro ao salvar mensagem.');
          }
        },

        // Ação para o formulário de edição
        async updateClient(clientId, clientData) {
          try {
            await apiClient.put(`/clientes/update/${clientId}`, clientData);
            alert('Cliente atualizado com sucesso!');
            this.fetchClients(); // Atualiza a tabela
          } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            alert('Erro ao atualizar cliente.');
          }
        }
        
    }, // <-- FIM DO BLOCO 'actions'
    
    
    

});