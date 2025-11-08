<template>
  <v-dialog
    :model-value="props.isOpen"
    @update:model-value="$emit('close')"
    max-width="600px"
    persistent
    scrollable
  >
    <v-card>
      <v-card-title class="pa-4 pb-0 d-flex justify-space-between align-center">
        <span class="text-h6">{{ title }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="$emit('close')"
        ></v-btn>
      </v-card-title>

      <v-card-text class="pa-4 pt-2">
        <v-container class="pa-0">
          <!-- Formulário de Cadastro -->
          <RegisterClientForm
            v-if="modalType === 'register'"
            :servicos="clientStore.servicos"
            :is-open="props.isOpen"
            @submit="handleRegisterSubmit"
          />

          <!-- Formulário de Edição -->
          <EditClientForm
            v-else-if="modalType === 'editClient'"
            :servicos="clientStore.servicos"
            :client-data="props.clientData"
            :is-open="props.isOpen"
            @submit="handleEditSubmit"
          />

          <!-- Editor de Mensagem Padrão -->
          <MessageEditorForm
            v-else-if="modalType === 'editMessage'"
            message-type="default"
            :initial-message="defaultMessage"
            :is-open="props.isOpen"
            @submit="handleMessageSubmit"
          />

          <!-- Editor de Mensagem Vencido -->
          <MessageEditorForm
            v-else-if="modalType === 'editVencidoMessage'"
            message-type="vencido"
            :initial-message="vencidoMessage"
            :is-open="props.isOpen"
            @submit="handleMessageSubmit"
          />

          <!-- Gerenciador de Serviços -->
          <ServiceManagerForm
            v-else-if="modalType === 'manageServices'"
            :servicos="clientStore.servicos"
            :is-open="props.isOpen"
            @add-service="handleAddService"
            @update-service="handleUpdateService"
            @delete-service="handleDeleteService"
          />
        </v-container>
      </v-card-text>

      <v-card-actions class="px-4 pt-0 pb-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="$emit('close')">
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useClientStore } from '@/stores/clientStore';
import RegisterClientForm from './forms/RegisterClientForm.vue';
import EditClientForm from './forms/EditClientForm.vue';
import MessageEditorForm from './forms/MessageEditorForm.vue';
import ServiceManagerForm from './forms/ServiceManagerForm.vue';

const props = defineProps({
  isOpen: Boolean,
  modalType: String,
  clientData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);
const clientStore = useClientStore();

// Estado para mensagens
const defaultMessage = ref('');
const vencidoMessage = ref('');

// Título dinâmico
const title = computed(() => {
  switch (props.modalType) {
    case 'register':
      return 'Cadastrar Novo Cliente';
    case 'editMessage':
      return 'Editar Mensagem Padrão';
    case 'editVencidoMessage':
      return 'Editar Mensagem (Vencido)';
    case 'editClient':
      return 'Editar Cliente';
    case 'manageServices':
      return 'Gerenciar Serviços';
    default:
      return 'Modal';
  }
});

// Handlers para formulários
async function handleRegisterSubmit(sanitizedData) {
  await clientStore.addClient(sanitizedData);
  emit('close');
}

async function handleEditSubmit(clientId, sanitizedData) {
  await clientStore.updateClient(clientId, sanitizedData);
  emit('close');
}

async function handleMessageSubmit(message, type) {
  await clientStore.saveMessage(message, type);
  emit('close');
}

async function handleAddService(safeName) {
  await clientStore.addServico(safeName);
}

async function handleUpdateService(serviceId, safeName) {
  await clientStore.updateServico(serviceId, safeName);
}

async function handleDeleteService(servico) {
  await clientStore.deleteServico(servico.id);
}

// Carrega mensagens quando abre os modais correspondentes
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.modalType === 'editMessage') {
        clientStore.fetchMessage('default').then((msg) => {
          defaultMessage.value = msg;
        });
      }
      if (props.modalType === 'editVencidoMessage') {
        clientStore.fetchMessage('vencido').then((msg) => {
          vencidoMessage.value = msg;
        });
      }
    }
  }
);
</script>

<style scoped>
:deep(.v-input__details) {
  padding-bottom: 4px !important;
}
</style>
