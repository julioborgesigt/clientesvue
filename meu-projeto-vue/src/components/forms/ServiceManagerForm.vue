<template>
  <div>
    <h4 class="text-subtitle-1 mb-2">Adicionar Novo Serviço</h4>
    <v-form ref="serviceFormRef" @submit.prevent="handleSaveService">
      <v-text-field
        label="Nome do Novo Serviço*"
        v-model="newServiceName"
        :rules="[rules.required]"
        density="compact"
        prepend-inner-icon="mdi-plus-circle-outline"
        class="mb-4"
        required
        variant="outlined"
      ></v-text-field>
      <v-btn type="submit" :color="submitButtonColor" block>
        Salvar Novo Serviço
      </v-btn>
    </v-form>

    <v-divider class="my-6"></v-divider>

    <h4 class="text-subtitle-1 mb-2">Serviços Cadastrados</h4>
    <v-list lines="one" density="compact" class="py-0">
      <v-list-item
        v-for="servico in servicos"
        :key="servico.id"
        class="px-1"
      >
        <v-list-item-title>{{ servico.nome }}</v-list-item-title>
        <template v-slot:append>
          <v-btn
            icon="mdi-pencil-outline"
            variant="text"
            size="small"
            @click="openEditDialog(servico)"
            title="Editar Serviço"
            class="me-1"
          ></v-btn>
          <v-btn
            icon="mdi-delete-outline"
            variant="text"
            size="small"
            color="red-lighten-1"
            @click="confirmDelete(servico)"
            title="Excluir Serviço"
          ></v-btn>
        </template>
      </v-list-item>
      <v-list-item v-if="servicos.length === 0" class="px-1">
        Nenhum serviço cadastrado.
      </v-list-item>
    </v-list>

    <!-- Diálogo de Edição de Serviço -->
    <v-dialog v-model="editDialog" max-width="400px" persistent>
      <v-form ref="editServiceFormRef" @submit.prevent="handleUpdateService">
        <v-card>
          <v-card-title>Editar Serviço</v-card-title>
          <v-card-text>
            <v-text-field
              label="Novo nome do Serviço*"
              v-model="editingServiceName"
              :rules="[rules.required]"
              ref="editServiceFieldRef"
              variant="outlined"
              density="compact"
              autofocus
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey-darken-1" text @click="closeEditDialog">
              Cancelar
            </v-btn>
            <v-btn :color="submitButtonColor" text type="submit">
              Salvar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- Diálogo de Confirmação de Exclusão -->
    <ConfirmDialog
      v-model="deleteDialog"
      title="Excluir Serviço"
      :message="`Tem certeza que deseja excluir o serviço &quot;${servicoToDelete?.nome}&quot;?`"
      details="Atenção: Clientes que usam este serviço não serão atualizados automaticamente."
      icon="mdi-delete-alert-outline"
      icon-color="error"
      confirm-text="Excluir"
      cancel-text="Cancelar"
      @confirm="handleDeleteConfirmed"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useTheme } from 'vuetify';
import { rules } from '@/utils/validators';
import { sanitizeText } from '@/utils/sanitize';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const props = defineProps({
  servicos: {
    type: Array,
    default: () => [],
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['add-service', 'update-service', 'delete-service']);

const theme = useTheme();
const submitButtonColor = theme.global.current.value.dark ? 'grey-darken-1' : 'primary';

const serviceFormRef = ref(null);
const editServiceFormRef = ref(null);
const editServiceFieldRef = ref(null);

const newServiceName = ref('');
const editDialog = ref(false);
const editingService = ref(null);
const editingServiceName = ref('');

// Delete confirmation dialog
const deleteDialog = ref(false);
const servicoToDelete = ref(null);

async function handleSaveService() {
  const { valid } = await serviceFormRef.value.validate();
  if (!valid) return;
  if (!newServiceName.value || newServiceName.value.trim() === '') return;

  const safeName = sanitizeText(newServiceName.value, 50);
  emit('add-service', safeName);
  newServiceName.value = '';
}

function openEditDialog(servico) {
  editingService.value = { ...servico };
  editingServiceName.value = servico.nome;
  editDialog.value = true;
  nextTick(() => {
    editServiceFieldRef.value?.focus();
  });
}

function closeEditDialog() {
  editDialog.value = false;
  editingService.value = null;
  editingServiceName.value = '';
  editServiceFormRef.value?.resetValidation();
}

async function handleUpdateService() {
  if (!editServiceFormRef.value) return;

  const { valid } = await editServiceFormRef.value.validate();
  if (!valid || !editingService.value) return;

  const serviceId = editingService.value.id;
  const safeName = sanitizeText(editingServiceName.value, 50);

  emit('update-service', serviceId, safeName);
  closeEditDialog();
}

function confirmDelete(servico) {
  servicoToDelete.value = servico;
  deleteDialog.value = true;
}

function handleDeleteConfirmed() {
  if (servicoToDelete.value) {
    emit('delete-service', servicoToDelete.value);
    servicoToDelete.value = null;
  }
}

// Reset form when dialog opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    newServiceName.value = '';
  } else {
    serviceFormRef.value?.resetValidation();
    // Close edit dialog if main dialog closes
    if (editDialog.value) {
      closeEditDialog();
    }
  }
});

defineExpose({
  resetValidation: () => {
    serviceFormRef.value?.resetValidation();
    editServiceFormRef.value?.resetValidation();
  },
});
</script>
