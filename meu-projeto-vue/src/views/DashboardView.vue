<template>
  <v-app-bar color="primary" density="compact">
    <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none"></v-app-bar-nav-icon>
    
    <v-toolbar-title>Dashboard de Clientes</v-toolbar-title>
    
    <v-toolbar-items class="d-none d-md-block">
      <v-btn @click="handleOpenModal('register')">Cadastrar Cliente</v-btn>
      <v-btn @click="handleOpenModal('editMessage')">Msg. Padrão</v-btn>
      <v-btn @click="handleOpenModal('editVencidoMessage')">Msg. Vencido</v-btn>
    </v-toolbar-items>

    <v-spacer></v-spacer>
    
    <v-btn @click="handleLogout" icon>
      <v-icon>mdi-logout</v-icon>
      <v-tooltip activator="parent" location="bottom">Sair</v-tooltip>
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <v-list-item @click="handleOpenModal('register')" title="Cadastrar Cliente"></v-list-item>
      <v-list-item @click="handleOpenModal('editMessage')" title="Editar Msg. Padrão"></v-list-item>
      <v-list-item @click="handleOpenModal('editVencidoMessage')" title="Editar Msg. Vencido"></v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-container fluid class="mt-4">
    <DashboardStats :stats="clientStore.stats" @filter="handleFilter" />

    <v-row>
      <v-col>
        <v-card class="pa-4">
          <ClientChart :chart-data="clientStore.chartData" style="height: 300px;" />
        </v-card>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col>
        <ClientTable 
          :clients="clientStore.clients"
          @open-edit-modal="openEditModal"
        />
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

// Importe os componentes
import DashboardStats from '@/components/DashboardStats.vue';
import ClientChart from '@/components/ClientChart.vue';
import ClientTable from '@/components/ClientTable.vue';
import AppModal from '@/components/AppModal.vue';

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

// Lógica para o Modal de Edição (Seu código já estava correto aqui)
const clientToEdit = ref(null); //

const openEditModal = (client) => { //
  clientToEdit.value = { ...client }; //
  handleOpenModal('editClient');      //
};

// Lógica de Logout
const handleLogout = () => {
  if (confirm('Deseja realmente sair?')) {
    authStore.logout();
  }
};

// Carregamento de dados
onMounted(() => {
  clientStore.fetchClients();
  clientStore.fetchStats();
  clientStore.fetchChartData();
});

// Funções de filtro
const handleFilter = (status) => {
  clientStore.setFilter(status);
};
</script>

<style scoped>
/* O container e as rows/cols do Vuetify cuidam do layout. */
</style>