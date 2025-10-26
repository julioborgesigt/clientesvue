<template>
  <v-dialog 
    :model-value="isOpen" 
    @update:model-value="$emit('close')" 
    max-width="700px" 
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center pa-4 pb-2">
        <span class="text-h6">Clientes a Receber no Mês</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('close')"></v-btn>
      </v-card-title>
      
      <v-card-subtitle class="ps-4 pb-2">
         Clientes com vencimento no mês atual e status diferente de 'Pag. em dias'. Total: R$ {{ totalValue.toFixed(2) }}
      </v-card-subtitle>

      <v-card-text class="pa-4 pt-2">
        <v-progress-linear indeterminate v-if="isLoading"></v-progress-linear>
        
        <v-alert type="info" variant="tonal" v-if="!isLoading && clients.length === 0" class="mt-4">
          Nenhum cliente encontrado para este período.
        </v-alert>

        <v-table density="compact" fixed-header height="400px" v-if="!isLoading && clients.length > 0" class="mt-4">
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Nome</th>
              <th class="text-left">Vencimento</th>
              <th class="text-right">Valor (R$)</th>
              <th class="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in clients" :key="client.id">
              <td>{{ client.id }}</td>
              <td>{{ client.name }}</td>
              <td>{{ formatDate(client.vencimento) }}</td>
              <td class="text-right">{{ client.valor_cobrado.toFixed(2) }}</td>
              <td>
                 <v-chip :color="getStatusColor(client.status)" size="x-small" label>
                  {{ client.status }}
                 </v-chip>
              </td>
            </tr>
          </tbody>
           <tfoot>
             <tr>
               <td colspan="3" class="text-right font-weight-bold">Total:</td>
               <td class="text-right font-weight-bold">{{ totalValue.toFixed(2) }}</td>
               <td></td>
             </tr>
           </tfoot>
        </v-table>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="$emit('close')">
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  isLoading: Boolean,
  clients: {
    type: Array,
    default: () => []
  }
});

// LOG 8: Quais props o modal está recebendo?
console.log('PendingClientsModal: Props recebidas ->', 
    'isOpen:', props.isOpen, 
    'isLoading:', props.isLoading, 
    'clients:', props.clients
);

// Adiciona um watcher para logar mudanças nas props (ajuda a depurar)
watch(props, (newProps) => {
  console.log('PendingClientsModal: Props ATUALIZADAS ->', 
    'isOpen:', newProps.isOpen, 
    'isLoading:', newProps.isLoading, 
    'clients:', newProps.clients
  );
}, { immediate: true, deep: true }); // immediate: true loga o valor inicial também

defineEmits(['close']);

// Calcula o valor total da lista exibida
const totalValue = computed(() => {
  return props.clients.reduce((sum, client) => sum + client.valor_cobrado, 0);
});

// Funções helper (copiadas/adaptadas de ClientTable.vue)
const getStatusColor = (status) => {
  if (status === 'Não pagou') return 'red-darken-1';
  if (status === 'cobrança feita') return 'orange-darken-1';
  // Adicione outras cores se houver mais status
  return 'grey';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const parts = dateString.split('-');
  if (parts.length < 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};
</script>

<style scoped>
/* Estilos adicionais, se necessário */
</style>