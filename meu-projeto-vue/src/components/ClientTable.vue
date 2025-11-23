<template>
  <v-card>
    <v-card-title class="d-flex align-center pe-2">
      <v-icon icon="mdi-account-group"></v-icon>
      <span class="ms-2">Clientes</span>

      <!-- Botão para mostrar/ocultar arquivados -->
      <v-btn
        :prepend-icon="clientStore.showArchived ? 'mdi-archive-check' : 'mdi-archive-outline'"
        :color="clientStore.showArchived ? 'orange' : 'default'"
        variant="tonal"
        size="small"
        class="ms-3"
        @click="clientStore.toggleShowArchived()"
      >
        {{ clientStore.showArchived ? 'Arquivados' : 'Ativos' }}
      </v-btn>

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
      <template v-slot:item.name="{ item, value }">
        {{ value }}
        <v-chip v-if="item.arquivado" color="grey" size="x-small" class="ms-2">Arquivado</v-chip>
      </template>
      <template v-slot:item.valor_cobrado="{ value }"> {{ formatCurrency(value) }} </template>
      <template v-slot:item.custo="{ value }"> {{ formatCurrency(value) }} </template>
      <template v-slot:item.status="{ value }"> <v-chip :color="getStatusColor(value)" size="small"> {{ value }} </v-chip> </template>
      <template v-slot:item.vencimento="{ value }"> {{ formatDate(value) }} </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex justify-end align-center" style="white-space: nowrap;">

          <v-btn
            icon="mdi-calendar-plus"
            variant="text"
            size="small"
            @click="handleDate('MONTH', 1, item.id)"
            :aria-label="`Adicionar 1 mês e marcar como pago para cliente ${item.name}`"
            title="+1 Mês e Marcar Como Pago"
            class="me-n2"
          ></v-btn>

          <v-btn
            icon="mdi-whatsapp"
            variant="text"
            size="small"
            color="green-darken-1"
            @click="handleAction('whatsapp', item)"
            :aria-label="`Enviar mensagem padrão pelo WhatsApp para cliente ${item.name}`"
            title="Enviar WhatsApp Padrão"
            class="me-n2"
          ></v-btn>

          <v-btn
            icon="mdi-cash-check"
            variant="text"
            size="small"
            color="orange-darken-1"
            @click="handleStatus('paid', item.id)"
            :aria-label="`Marcar status como cobrança feita para cliente ${item.name}`"
            title="Marcar Status: Cobrança Feita"
            class="me-n2"
          ></v-btn>

           <v-btn
            icon="mdi-message-alert-outline"
            variant="text"
            size="small"
            color="red-darken-1"
            @click="handleAction('whatsapp-vencido', item)"
            :aria-label="`Enviar mensagem de vencido pelo WhatsApp para cliente ${item.name}`"
            title="Enviar WhatsApp (Vencido)"
            class="me-n2"
          ></v-btn>

          <v-menu location="start">
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="x-small"
                :aria-label="`Mais ações para cliente ${item.name}`"
                v-bind="props"
              ></v-btn>
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

              <!-- Botão de Arquivar/Desarquivar -->
              <v-list-item
                v-if="!item.arquivado"
                title="Arquivar Cliente"
                @click="handleArchive(item.id)"
              >
                <template v-slot:prepend>
                  <v-icon color="orange" size="small">mdi-archive-arrow-down-outline</v-icon>
                </template>
              </v-list-item>
              <v-list-item
                v-else
                title="Desarquivar Cliente"
                @click="handleUnarchive(item.id)"
              >
                <template v-slot:prepend>
                  <v-icon color="green" size="small">mdi-archive-arrow-up-outline</v-icon>
                </template>
              </v-list-item>
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

  <!-- Diálogo de Confirmação de Exclusão -->
  <ConfirmDialog
    v-model="deleteDialog"
    title="Excluir Cliente"
    :message="`Tem certeza que deseja excluir o cliente &quot;${clientToDelete?.name}&quot;?`"
    details="Esta ação não pode ser desfeita."
    icon="mdi-delete-alert-outline"
    icon-color="error"
    confirm-text="Excluir"
    cancel-text="Cancelar"
    @confirm="handleDeleteConfirmed"
  />
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useClientStore } from '@/stores/clientStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatters';
import { getStatusColor } from '@/utils/statusUtils';
import { sanitizeForURL, sanitizePhone } from '@/utils/sanitize';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const clientStore = useClientStore();
const notificationStore = useNotificationStore();
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

// Delete confirmation dialog
const deleteDialog = ref(false);
const clientToDelete = ref(null);

const handleStatus = (statusAction, clientId) => { clientStore.updateClientStatus(clientId, statusAction); };
const handleDate = (unit, value, clientId) => { clientStore.adjustClientDate(clientId, value, unit); };
const handleArchive = (clientId) => { clientStore.archiveClient(clientId); };
const handleUnarchive = (clientId) => { clientStore.unarchiveClient(clientId); };
const handleDelete = (client) => {
  clientToDelete.value = client;
  deleteDialog.value = true;
};
const handleDeleteConfirmed = () => {
  if (clientToDelete.value) {
    clientStore.deleteClient(clientToDelete.value.id);
    clientToDelete.value = null;
  }
};
const handleAction = (action, client) => {
  if (action === 'edit') { emit('open-edit-modal', client); } 
  else if (action === 'whatsapp' || action === 'whatsapp-vencido') {
    const type = action === 'whatsapp-vencido' ? 'vencido' : 'default';
    sendWhatsAppMessage(client, type);
  }
};
async function sendWhatsAppMessage(client, messageType = 'default') {
  try {
    const message = await clientStore.fetchMessage(messageType);
    if (!message) {
      const msgType = messageType === 'vencido' ? 'Vencido' : 'Padrão';
      notificationStore.warning(`Mensagem ${msgType} não configurada.`);
      return;
    }

    // Formatar data
    const formattedDate = formatDate(client.vencimento);

    // Sanitizar dados antes de enviar
      const safeMessage = sanitizeForURL(message);
    const fullMessage = `${safeMessage}\n ${formattedDate}`;

    // Sanitizar telefone
    const safePhone = sanitizePhone(client.whatsapp);
    const phone = safePhone.startsWith('+') ? safePhone.substring(1) : safePhone;

    // Validar telefone
    if (!phone || phone.length < 10) {
      notificationStore.error('Número de WhatsApp inválido.');
      return;
    }

    const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappLink, '_blank');
  } catch (error) {
    notificationStore.error('Erro ao preparar mensagem do WhatsApp.');
  }
}
// getStatusColor agora é importado de @/utils/statusUtils
// formatDate agora é importado de @/utils/dateUtils
// formatCurrency agora é importado de @/utils/formatters
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