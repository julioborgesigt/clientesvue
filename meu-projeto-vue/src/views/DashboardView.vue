<template>
  <v-app-bar color="primary" density="compact">
    <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none"></v-app-bar-nav-icon>

    <v-toolbar-title>Dashboard de Clientes</v-toolbar-title>

    <v-toolbar-items class="d-none d-md-block">
      <v-btn @click="handleOpenModal('register')">Cadastrar Cliente</v-btn>
      <v-btn @click="handleOpenModal('manageServices')">Gerenciar Serviços</v-btn>
      <v-btn @click="handleOpenModal('editMessage')">Msg. Padrão</v-btn>
      <v-btn @click="handleOpenModal('editVencidoMessage')">Msg. Vencido</v-btn>
    </v-toolbar-items>

    <v-spacer></v-spacer>

    <v-btn @click="toggleTheme" icon>
      <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      <v-tooltip activator="parent" location="bottom">
        {{ theme.global.current.value.dark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro' }}
      </v-tooltip>
    </v-btn>

    <v-btn @click="handleLogout" icon>
      <v-icon>mdi-logout</v-icon>
      <v-tooltip activator="parent" location="bottom">Sair</v-tooltip>
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary>
     <v-list>
       <v-list-item @click="handleOpenModal('register')" title="Cadastrar Cliente"></v-list-item>
       <v-list-item @click="handleOpenModal('manageServices')" title="Gerenciar Serviços"></v-list-item>
       <v-list-item @click="handleOpenModal('editMessage')" title="Editar Msg. Padrão"></v-list-item>
       <v-list-item @click="handleOpenModal('editVencidoMessage')" title="Editar Msg. Vencido"></v-list-item>
     </v-list>
   </v-navigation-drawer>

  <v-container fluid class="pa-4">

    <DashboardStats :stats="clientStore.stats" @filter="handleFilter" class="my-4"/>

    <v-row class="my-4">

      <v-col cols="12" md="6"> 
        <v-card class="pa-0" elevation="2">
           <v-card-title class="text-subtitle-1 ps-4 pt-3 pb-1">Previsão de Pagamentos</v-card-title>
           <v-card-text class="pa-2">
             <ClientChart :chart-data="clientStore.chartData" style="height: 250px;" /> 
           </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6"> 
        <v-card class="pa-0" elevation="2">
           <v-card-title class="text-subtitle-1 ps-4 pt-3 pb-1">Clientes por Serviço</v-card-title>
           <v-card-text class="pa-2">
             <ServiceDistributionChart 
               :chart-data="clientStore.serviceDistributionData" 
               style="height: 250px;" 
             /> 
           </v-card-text>
        </v-card>
      </v-col>

    </v-row> 
    <v-row class="my-4">
      <v-col>
        <ClientTable @open-edit-modal="openEditModal" />
      </v-col>
      <v-col cols="12" lg="4">
        <RecentActions /> 
      </v-col>
    </v-row>
  </v-container>

  <AppModal
    :is-open="isModalOpen"
    :modal-type="currentModalType"
    :client-data="clientToEdit"
    @close="isModalOpen = false"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useClientStore } from '@/stores/clientStore';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from 'vuetify'; 

// Importe os componentes
import DashboardStats from '@/components/DashboardStats.vue';
import ClientChart from '@/components/ClientChart.vue';
// --- IMPORTADO O NOVO COMPONENTE ---
import ServiceDistributionChart from '@/components/ServiceDistributionChart.vue'; 
// --- FIM DA IMPORTAÇÃO ---
import ClientTable from '@/components/ClientTable.vue';
import AppModal from '@/components/AppModal.vue';
import RecentActions from '@/components/RecentActions.vue'; // <-- IMPORTAR O NOVO COMPONENTE

const clientStore = useClientStore();
const authStore = useAuthStore();

// Estado para o menu lateral
const drawer = ref(false);

// Lógica do Modal
const isModalOpen = ref(false);
const currentModalType = ref('');
const handleOpenModal = (type) => {
  currentModalType.value = type;
  isModalOpen.value = true;
  drawer.value = false;
};

// Lógica para o Modal de Edição
const clientToEdit = ref(null);
const openEditModal = (client) => {
  clientToEdit.value = { ...client };
  handleOpenModal('editClient');
};

// Lógica do Dark Mode 
const theme = useTheme(); 
const toggleTheme = () => {
  const newTheme = theme.global.current.value.dark ? 'light' : 'dark';
  theme.global.name.value = newTheme; 
};

// Lógica de Logout
const handleLogout = () => {
  if (confirm('Deseja realmente sair?')) {
    authStore.logout();
  }
};

// Carregamento de dados (MODIFICADO)
onMounted(() => {
  clientStore.fetchClients();
  clientStore.fetchStats();
  clientStore.fetchChartData();
  clientStore.fetchServicos();
  clientStore.fetchServiceDistribution(); // <-- CHAMADA A NOVA AÇÃO
  clientStore.fetchRecentActions(); // <-- CHAMAR A BUSCA DO LOG
});

// Funções de filtro
const handleFilter = (status) => {
  clientStore.setFilter(status);
};
</script>

<style scoped>
/* O container e as rows/cols do Vuetify cuidam do layout. */
</style>