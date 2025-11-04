<template>
  <v-card>
    <v-card-title class="d-flex align-center pe-2">
      <v-icon icon="mdi-account-group"></v-icon>
      <span class="ms-2">Clientes</span>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        density="compact"
        label="Pesquisar"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      ></v-text-field>
    </v-card-title>

    <v-divider></v-divider>

    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items-length="clientStore.totalClients"
      :items="clientStore.clients"
      :loading="clientStore.isLoading"
      density="compact"
      hover
      @update:options="clientStore.handleTableUpdate"
    >
      <template v-slot:item.valor_cobrado="{ value }"> R$ {{ value.toFixed(2) }} </template>
      <template v-slot:item.custo="{ value }"> R$ {{ value.toFixed(2) }} </template>
      <template v-slot:item.status="{ value }"> <v-chip :color="getStatusColor(value)" size="small"> {{ value }} </v-chip> </template>
      <template v-slot:item.vencimento="{ value }"> {{ formatDate(value) }} </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex justify-end align-center" style="white-space: nowrap;">

          <v-btn
            icon="mdi-calendar-plus"
            variant="text"
            size="small"
            @click="handleDate('MONTH', 1, item.id)"
            title="+1 Mês e Marcar Como Pago"
            class="me-n2"
          ></v-btn>

          <v-btn
            icon="mdi-whatsapp"
            variant="text"
            size="small"
            color="green-darken-1"
            @click="handleAction('whatsapp', item)"
            title="Enviar WhatsApp Padrão"
            class="me-n2"
          ></v-btn>

          <v-btn
            icon="mdi-cash-check"
            variant="text"
            size="small"
            color="orange-darken-1"
            @click="handleStatus('paid', item.id)"
            title="Marcar Status: Cobrança Feita"
            class="me-n2"
          ></v-btn>

           <v-btn
            icon="mdi-message-alert-outline"
            variant="text"
            size="small"
            color="red-darken-1"
            @click="handleAction('whatsapp-vencido', item)"
            title="Enviar WhatsApp (Vencido)"
            class="me-n2"
          ></v-btn>

          <v-menu location="start">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" size="x-small" v-bind="props"></v-btn> 
            </template>
            <v-list density="compact">
              <v-list-item title="Editar Cliente" @click="handleAction('edit', item)">
                 <template v-slot:prepend> <v-icon size="small">mdi-pencil-outline</v-icon> </template>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item title="-1 Mês" @click="handleDate('MONTH', -1, item.id)"></v-list-item>
              <v-divider></v-divider>
              <v-list-item title="Status: Não Pagou" @click="handleStatus('pending', item.id)"></v-list-item>
              <v-list-item title="Status: Pag. em Dias" @click="handleStatus('in-day', item.id)"></v-list-item>
              <v-divider></v-divider>
              <v-list-item title="Excluir Cliente" @click="handleDelete(item)">
                 <template v-slot:prepend> <v-icon color="red" size="small">mdi-delete-outline</v-icon> </template>
               </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
      </v-data-table-server>
  </v-card>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useClientStore } from '@/stores/clientStore';
import { formatDate } from '@/utils/dateUtils';
const clientStore = useClientStore();
const emit = defineEmits(['open-edit-modal']);
const search = ref('');
const itemsPerPage = ref(10); 
const searchDebounce = ref(null);
watch(search, (newValue) => {
  clearTimeout(searchDebounce.value);
  searchDebounce.value = setTimeout(() => { clientStore.setSearch(newValue); }, 500);
});
// Limpar timeout quando componente for desmontado
onUnmounted(() => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value);
  }
});
const headers = [
  { title: 'ID', key: 'id', align: 'start' }, { title: 'Nome', key: 'name' },
  { title: 'Vencimento', key: 'vencimento' }, { title: 'Serviço', key: 'servico' },
  { title: 'WhatsApp', key: 'whatsapp' }, { title: 'Valor (R$)', key: 'valor_cobrado' },
  { title: 'Custo (R$)', key: 'custo' }, { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'end' },
];
const handleStatus = (statusAction, clientId) => { clientStore.updateClientStatus(clientId, statusAction); };
const handleDate = (unit, value, clientId) => { clientStore.adjustClientDate(clientId, value, unit); };
const handleDelete = (client) => { if (confirm(`Excluir cliente ${client.name}?`)) { clientStore.deleteClient(client.id); } };
const handleAction = (action, client) => {
  if (action === 'edit') { emit('open-edit-modal', client); } 
  else if (action === 'whatsapp' || action === 'whatsapp-vencido') {
    const type = action === 'whatsapp-vencido' ? 'vencido' : 'default';
    sendWhatsAppMessage(client, type); 
  } else { console.log('Ação desconhecida:', action, client.name); }
};
async function sendWhatsAppMessage(client, messageType = 'default') {
  try {
    const message = await clientStore.fetchMessage(messageType);
    if (!message) {
      alert(`Mensagem ${messageType === 'vencido' ? '(Vencido)' : 'Padrão'} não configurada.`);
      return;
    }
    // Corrigido: removido o +1 dia que estava causando bug
    const formattedDate = formatDate(client.vencimento);
    const fullMessage = `${message}\nVencimento: ${formattedDate}`;
    const phone = client.whatsapp.startsWith('+') ? client.whatsapp.substring(1) : client.whatsapp;
    const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappLink, '_blank');
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    alert('Erro ao preparar mensagem do WhatsApp.');
  }
}
const getStatusColor = (status) => {
  if (status === 'Não pagou') return 'red-darken-1';
  if (status === 'cobrança feita') return 'orange-darken-1';
  if (status === 'Pag. em dias') return 'green-darken-1';
  return 'grey';
};
// formatDate agora é importado de @/utils/dateUtils
</script>

<style scoped>
/* Ajuste de margem ainda mais negativo para aproximar os botões */
.me-n2 {
  margin-right: -8px; 
}
/* Estilos para o :deep (se necessário) */
/*
:deep(td.v-data-table__td.v-data-table-column--align-end) {
   padding-right: 0 !important; 
}
*/
</style>