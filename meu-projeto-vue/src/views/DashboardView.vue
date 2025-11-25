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
    <v-btn @click="navigateToAdmin" icon>
      <v-icon>mdi-shield-crown</v-icon>
      <v-tooltip activator="parent" location="bottom">Painel de Administração</v-tooltip>
    </v-btn>
    <v-btn @click="toggleTheme" icon>
      <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      <v-tooltip activator="parent" location="bottom">
        {{ theme.global.current.value.dark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro' }}
      </v-tooltip>
    </v-btn>
    <v-btn @click="openChangePasswordModal" icon>
      <v-icon>mdi-lock-reset</v-icon>
      <v-tooltip activator="parent" location="bottom">Alterar Senha</v-tooltip>
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

  <!-- Estado de Carregamento -->
  <v-overlay :model-value="clientStore.isDashboardLoading" class="align-center justify-center" persistent>
    <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    <div class="text-center mt-4">Carregando dados...</div>
  </v-overlay>

  <!-- Conteúdo Principal -->
  <v-container v-if="!clientStore.isDashboardLoading" fluid class="pa-4">
    
    <!-- Estado Vazio -->
    <div v-if="clientStore.clients.length === 0" class="mt-16">
      <EmptyState
        title="Nenhum cliente encontrado"
        description="Parece que você ainda não tem clientes cadastrados. Comece adicionando o primeiro!"
        icon="mdi-account-search-outline"
      >
        <template #action>
          <v-btn color="primary" @click="handleOpenModal('register')">
            <v-icon left>mdi-plus</v-icon>
            Cadastrar Cliente
          </v-btn>
        </template>
      </EmptyState>
    </div>

    <!-- Conteúdo do Dashboard (quando há clientes) -->
    <div v-else>
      <DashboardStats 
        :stats="clientStore.stats" 
        @filter="handleFilter" 
        @show-pending="openPendingModal" 
        class="my-4"
      />

      <v-row class="my-4">
        <v-col cols="12" md="6">
          <v-card class="pa-0" elevation="2">
            <v-card-title class="d-flex align-center text-subtitle-1 ps-4 pt-3 pb-1">
              <span>Previsão de Pagamentos</span>
              <v-spacer></v-spacer>
              <v-btn
                v-if="mobile"
                :icon="showPaymentChart ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                variant="text"
                size="small"
                @click="showPaymentChart = !showPaymentChart"
                :aria-label="showPaymentChart ? 'Ocultar gráfico' : 'Mostrar gráfico'"
              ></v-btn>
            </v-card-title>
            <v-expand-transition>
              <v-card-text v-show="showPaymentChart" class="pa-2">
                <ClientChart :chart-data="clientStore.chartData" style="height: 250px;" />
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-0" elevation="2">
            <v-card-title class="d-flex align-center text-subtitle-1 ps-4 pt-3 pb-1">
              <span>Clientes por Serviço</span>
              <v-spacer></v-spacer>
              <v-btn
                v-if="mobile"
                :icon="showServiceChart ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                variant="text"
                size="small"
                @click="showServiceChart = !showServiceChart"
                :aria-label="showServiceChart ? 'Ocultar gráfico' : 'Mostrar gráfico'"
              ></v-btn>
            </v-card-title>
            <v-expand-transition>
              <v-card-text v-show="showServiceChart" class="pa-2">
                <ServiceDistributionChart
                  :chart-data="clientStore.serviceDistributionData"
                  style="height: 250px;"
                />
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="my-4">
        <v-col cols="12" lg="8">
          <ClientTable @open-edit-modal="openEditModal" />
        </v-col>
        <v-col cols="12" lg="4">
          <RecentActions />
        </v-col>
      </v-row>
    </div>
  </v-container>

  <!-- Modais -->
  <PendingClientsModal 
    :is-open="isPendingModalOpen"
    :is-loading="clientStore.isLoadingPendingClients"
    :clients="clientStore.pendingThisMonthClients"
    @close="isPendingModalOpen = false"
  />

  <AppModal
    :is-open="isModalOpen"
    :modal-type="currentModalType"
    :client-data="clientToEdit"
    @close="isModalOpen = false"
  />

  <ChangePasswordModal
    :is-open="isChangePasswordModalOpen"
    @close="isChangePasswordModalOpen = false"
  />

  <ConfirmDialog
    v-model="logoutDialog"
    title="Confirmar Saída"
    message="Deseja realmente sair do sistema?"
    icon="mdi-logout"
    icon-color="warning"
    confirm-text="Sair"
    cancel-text="Cancelar"
    @confirm="handleLogoutConfirmed"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/stores/clientStore';
import { useAuthStore } from '@/stores/authStore';
import { useTheme, useDisplay } from 'vuetify'; 

// Importe os componentes
import DashboardStats from '@/components/DashboardStats.vue';
import ClientChart from '@/components/ClientChart.vue';
import ServiceDistributionChart from '@/components/ServiceDistributionChart.vue';
import ClientTable from '@/components/ClientTable.vue';
import AppModal from '@/components/AppModal.vue';
import RecentActions from '@/components/RecentActions.vue';
import PendingClientsModal from '@/components/PendingClientsModal.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import ChangePasswordModal from '@/components/ChangePasswordModal.vue';
import EmptyState from '@/components/ui/EmptyState.vue'; // Importar EmptyState

const router = useRouter();
const clientStore = useClientStore();
const authStore = useAuthStore();

const { mobile } = useDisplay();
const showPaymentChart = ref(!mobile.value);
const showServiceChart = ref(!mobile.value);

const isPendingModalOpen = ref(false);
const openPendingModal = () => {
  isPendingModalOpen.value = true;
  clientStore.fetchPendingThisMonthClients();
};

const isChangePasswordModalOpen = ref(false);
const openChangePasswordModal = () => {
  isChangePasswordModalOpen.value = true;
};

const drawer = ref(false);

const isModalOpen = ref(false);
const currentModalType = ref('');
const handleOpenModal = (type) => {
  currentModalType.value = type;
  isModalOpen.value = true;
  drawer.value = false;
};

const clientToEdit = ref(null);
const openEditModal = (client) => {
  clientToEdit.value = { ...client };
  handleOpenModal('editClient');
};

const theme = useTheme();
const toggleTheme = () => {
  const newTheme = theme.global.current.value.dark ? 'light' : 'dark';
  theme.global.name.value = newTheme;
};

const navigateToAdmin = () => {
  router.push('/admin');
};

const logoutDialog = ref(false);
const handleLogout = () => {
  logoutDialog.value = true;
};
const handleLogoutConfirmed = () => {
  authStore.logout();
};

// Carregamento de dados otimizado
onMounted(() => {
  clientStore.fetchDashboardData();
});

const handleFilter = (status) => {
  clientStore.setFilter(status);
};
</script>

<style scoped>
/* Estilos permanecem os mesmos */
</style>