<template>
  <v-card elevation="2" class="h-100">
    <v-card-title class="d-flex justify-space-between align-center pa-4 pb-3">
      <div class="d-flex align-center">
        <v-icon icon="mdi-bell-alert" size="24" color="warning" class="me-2"></v-icon>
        <span class="text-h6">Alertas de Vencimento</span>
        <v-badge
          v-if="clientStore.alertsCount > 0"
          :content="clientStore.alertsCount"
          color="error"
          class="ms-2"
        ></v-badge>
      </div>
      <v-btn
        icon="mdi-refresh"
        variant="text"
        size="small"
        @click="refreshAlerts"
        :loading="clientStore.isLoadingAlerts"
      ></v-btn>
    </v-card-title>

    <v-card-subtitle class="ps-4 pb-2 text-caption">
      Clientes com vencimento nos próximos 3 dias
    </v-card-subtitle>

    <v-card-text class="pa-4 pt-2">
      <!-- Loading State -->
      <v-progress-linear
        v-if="clientStore.isLoadingAlerts"
        indeterminate
        color="warning"
      ></v-progress-linear>

      <!-- Empty State -->
      <v-alert
        v-if="!clientStore.isLoadingAlerts && clientStore.alerts.length === 0"
        type="success"
        variant="tonal"
        class="mt-2"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-check-circle"></v-icon>
        </template>
        Nenhum vencimento próximo!
      </v-alert>

      <!-- Alerts List -->
      <v-list
        v-if="!clientStore.isLoadingAlerts && clientStore.alerts.length > 0"
        density="compact"
        class="mt-2"
      >
        <v-list-item
          v-for="client in clientStore.alerts"
          :key="client.id"
          class="px-0"
        >
          <template v-slot:prepend>
            <v-icon
              :icon="getDaysUntilExpiration(client.vencimento) === 0 ? 'mdi-alert-circle' : 'mdi-clock-alert-outline'"
              :color="getDaysUntilExpiration(client.vencimento) === 0 ? 'error' : 'warning'"
              size="20"
            ></v-icon>
          </template>

          <v-list-item-title class="text-subtitle-2">
            {{ client.name }}
          </v-list-item-title>

          <v-list-item-subtitle class="text-caption">
            <v-chip
              size="x-small"
              :color="getDaysUntilExpiration(client.vencimento) === 0 ? 'error' : 'warning'"
              class="me-1"
            >
              {{ getDaysLabel(client.vencimento) }}
            </v-chip>
            {{ formatDate(client.vencimento) }} • {{ formatCurrency(client.valor_cobrado) }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onMounted } from 'vue';
import { useClientStore } from '@/stores/clientStore';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatters';

const clientStore = useClientStore();

/**
 * Calcula quantos dias faltam até o vencimento
 * @param {string} vencimento - Data de vencimento (YYYY-MM-DD)
 * @returns {number} Dias até vencimento (0 = hoje, 1 = amanhã, etc)
 */
function getDaysUntilExpiration(vencimento) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(vencimento + 'T00:00:00');
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Retorna label amigável para dias até vencimento
 * @param {string} vencimento - Data de vencimento
 * @returns {string} Label formatada
 */
function getDaysLabel(vencimento) {
  const days = getDaysUntilExpiration(vencimento);

  if (days === 0) return 'Vence hoje';
  if (days === 1) return 'Vence amanhã';
  if (days === 2) return 'Vence em 2 dias';
  if (days === 3) return 'Vence em 3 dias';
  if (days < 0) return 'Vencido';

  return `Vence em ${days} dias`;
}

/**
 * Recarrega lista de alertas
 */
async function refreshAlerts() {
  await clientStore.fetchAlerts();
}

// Carrega alertas ao montar componente
onMounted(() => {
  clientStore.fetchAlerts();
});
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>
