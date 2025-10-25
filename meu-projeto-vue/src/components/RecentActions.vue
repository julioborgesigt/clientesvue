<template>
  <v-card elevation="2">
    <v-card-title class="d-flex align-center text-subtitle-1 ps-4 pt-3 pb-1">
      <v-icon start>mdi-history</v-icon>
      Ações Recentes
      <v-spacer></v-spacer>
      <v-progress-circular 
        v-if="clientStore.isLoadingActions" 
        indeterminate size="20" width="2" class="me-2"
      ></v-progress-circular>
       <v-btn 
         icon="mdi-refresh" variant="text" size="small" 
         @click="clientStore.fetchRecentActions"
         :disabled="clientStore.isLoadingActions"
         title="Atualizar Log"
       ></v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-0" style="max-height: 510px; overflow-y: auto;"> 
      <v-list density="compact" lines="two">
        <v-list-item v-if="!clientStore.isLoadingActions && clientStore.recentActions.length === 0">
          <v-list-item-title>Nenhuma ação recente registrada.</v-list-item-title>
        </v-list-item>

        <template v-for="(action, index) in clientStore.recentActions" :key="action.id">
          <v-list-item class="px-4">
            <template v-slot:prepend>
              <v-icon :icon="getActionIcon(action.action_type)" size="small" class="me-3"></v-icon>
            </template>

            <v-list-item-title class="text-caption font-weight-bold">
              {{ formatActionTitle(action) }}
              <span class="text-grey ms-2">({{ formatTimestamp(action.timestamp) }})</span>
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption" v-if="action.details">
              {{ action.details }}
            </v-list-item-subtitle>

             <template v-slot:append v-if="action.revertable && !action.reverted">
               <v-btn 
                 size="small" 
                 variant="outlined" 
                 color="orange-darken-1"
                 @click="revertAction(action.id)"
                 :loading="isReverting === action.id" 
                 :disabled="!!isReverting" 
                 >Reverter</v-btn>
             </template>
             <template v-slot:append v-if="action.reverted">
                <v-chip size="x-small" color="grey" variant="tonal">Revertido</v-chip>
             </template>
             </v-list-item>
          <v-divider v-if="index < clientStore.recentActions.length - 1"></v-divider>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useClientStore } from '@/stores/clientStore';

const clientStore = useClientStore();
const isReverting = ref(null); // Para o loading do botão reverter (Etapa 2)

// --- Funções Helper para Formatação ---
function getActionIcon(actionType) {
  switch (actionType) {
    case 'CREATE_CLIENT': return 'mdi-account-plus-outline';
    case 'UPDATE_CLIENT': return 'mdi-account-edit-outline';
    case 'DELETE_CLIENT': return 'mdi-account-remove-outline';
    case 'ADJUST_DATE': return 'mdi-calendar-sync-outline';
    case 'CHANGE_STATUS': return 'mdi-tag-outline';
    case 'CREATE_SERVICE': return 'mdi-briefcase-plus-outline'; // Exemplo
    case 'DELETE_SERVICE': return 'mdi-briefcase-remove-outline'; // Exemplo
    default: return 'mdi-history';
  }
}

function formatActionTitle(action) {
   switch (action.action_type) {
    case 'CREATE_CLIENT': return `Cliente Criado: ${action.client_name || '#' + action.client_id}`;
    case 'UPDATE_CLIENT': return `Cliente Atualizado: ${action.client_name || '#' + action.client_id}`;
    case 'DELETE_CLIENT': return `Cliente Excluído: ${action.client_name || '#' + action.client_id}`; // client_name pode não vir se já deletado
    case 'ADJUST_DATE': return `Vencimento Ajustado: ${action.client_name || '#' + action.client_id}`;
    case 'CHANGE_STATUS': return `Status Alterado: ${action.client_name || '#' + action.client_id}`;
    default: return action.action_type.replace('_', ' ').toLowerCase();
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  // Formato: DD/MM HH:MM
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + 
         date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

//--- Função Reverter (a ser implementada na Etapa 2) ---
async function revertAction(actionId) {
isReverting.value = actionId;
await clientStore.revertAction(actionId);
isReverting.value = null;
}

</script>

<style scoped>
/* Estilos adicionais se necessário */
</style>