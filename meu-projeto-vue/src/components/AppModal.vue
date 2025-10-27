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
        <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('close')"></v-btn>
      </v-card-title>

      <v-card-text class="pa-4 pt-2">
        <v-container class="pa-0">

          <v-form v-if="modalType === 'register' && form" ref="registerFormRef" @submit.prevent="handleRegisterSubmit">
            <h4 class="text-subtitle-1 mb-2 mt-2">Dados do Cliente</h4>
            <v-row no-gutters>
              <v-col cols="12" class="py-0">
                <v-text-field
                  label="Nome*"
                  v-model="form.name"
                  :rules="[rules.required]"
                  density="compact"
                  prepend-inner-icon="mdi-account"
                  class="mb-2"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="py-0 pe-sm-2">
                <v-text-field
                  label="Vencimento*"
                  v-model="form.vencimento"
                  type="date"
                  :rules="[rules.required]"
                  density="compact"
                  prepend-inner-icon="mdi-calendar-month"
                  class="mb-2"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="py-0 ps-sm-0">
                <v-select
                  label="Serviço"
                  v-model="form.servico"
                  :items="clientStore.servicos"
                  item-title="nome"
                  item-value="nome"
                  density="compact"
                  prepend-inner-icon="mdi-briefcase-outline"
                  class="mb-2"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="12" class="py-0">
                <v-text-field
                  label="WhatsApp (ex: 55...)*"
                  v-model="form.whatsapp"
                  :rules="[rules.required, rules.whatsappFormat]"
                  prepend-inner-icon="mdi-whatsapp"
                  density="compact"
                  class="mb-4"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>

            <h4 class="text-subtitle-1 mb-2">Valores</h4>
            <v-row no-gutters>
              <v-col cols="12" sm="6" class="py-0 pe-sm-2">
                <v-text-field
                  label="Valor Cobrado (R$)*"
                  v-model.number="form.valor_cobrado"
                  :rules="[rules.required, rules.numeric]"
                  type="number"
                  prefix="R$"
                  density="compact"
                  prepend-inner-icon="mdi-currency-usd"
                  class="mb-2"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="py-0 ps-sm-0">
                <v-text-field
                  label="Custo (R$)*"
                  v-model.number="form.custo"
                  :rules="[rules.required, rules.numeric]"
                  type="number"
                  prefix="R$"
                  density="compact"
                  prepend-inner-icon="mdi-hand-coin-outline"
                  class="mb-4"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>

            <h4 class="text-subtitle-1 mb-2">Observações</h4>
            <v-row no-gutters>
              <v-col cols="12" class="py-0">
                <v-textarea
                  label="Observações"
                  v-model="form.observacoes"
                  rows="2"
                  density="compact"
                  prepend-inner-icon="mdi-comment-text-outline"
                  class="mb-4"
                  variant="outlined"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-btn type="submit" :color="submitButtonColor" block class="mt-2">Salvar Cliente</v-btn>
          </v-form>

          <v-form v-else-if="modalType === 'editClient' && form" ref="editFormRef" @submit.prevent="handleEditSubmit">
             <h4 class="text-subtitle-1 mb-2 mt-2">Dados do Cliente</h4>
            <v-row no-gutters>
              <v-col cols="12" class="py-0">
                 <v-text-field
                   label="Nome*"
                   v-model="form.name"
                   :rules="[rules.required]"
                   density="compact"
                   prepend-inner-icon="mdi-account"
                   class="mb-2"
                   variant="outlined"
                 ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="py-0 pe-sm-2">
                 <v-text-field
                   label="Vencimento*"
                   v-model="form.vencimento"
                   type="date"
                   :rules="[rules.required]"
                   density="compact"
                   prepend-inner-icon="mdi-calendar-month"
                   class="mb-2"
                   variant="outlined"
                 ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="py-0 ps-sm-0">
                 <v-select
                   label="Serviço"
                   v-model="form.servico"
                   :items="clientStore.servicos"
                   item-title="nome"
                   item-value="nome"
                   density="compact"
                   prepend-inner-icon="mdi-briefcase-outline"
                   class="mb-2"
                   variant="outlined"
                 ></v-select>
              </v-col>
              <v-col cols="12" class="py-0">
                 <v-text-field
                   label="WhatsApp"
                   v-model="form.whatsapp"
                   :rules="[rules.whatsappFormat]"
                   prepend-inner-icon="mdi-whatsapp"
                   density="compact"
                   class="mb-4"
                   variant="outlined"
                 ></v-text-field>
              </v-col>
            </v-row>

            <h4 class="text-subtitle-1 mb-2">Valores</h4>
            <v-row no-gutters>
              <v-col cols="12" sm="6" class="py-0 pe-sm-2">
                 <v-text-field
                   label="Valor (R$)*"
                   v-model.number="form.valor_cobrado"
                   :rules="[rules.required, rules.numeric]"
                   type="number"
                   prefix="R$"
                   density="compact"
                   prepend-inner-icon="mdi-currency-usd"
                   class="mb-2"
                   variant="outlined"
                 ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="py-0 ps-sm-0">
                 <v-text-field
                   label="Custo (R$)*"
                   v-model.number="form.custo"
                   :rules="[rules.required, rules.numeric]"
                   type="number"
                   prefix="R$"
                   density="compact"
                   prepend-inner-icon="mdi-hand-coin-outline"
                   class="mb-4"
                   variant="outlined"
                 ></v-text-field>
              </v-col>
            </v-row>

            <h4 class="text-subtitle-1 mb-2">Observações</h4>
            <v-row no-gutters>
              <v-col cols="12" class="py-0">
                 <v-textarea
                   label="Observações"
                   v-model="form.observacoes"
                   rows="2"
                   density="compact"
                   prepend-inner-icon="mdi-comment-text-outline"
                   class="mb-4"
                   variant="outlined"
                 ></v-textarea>
              </v-col>
            </v-row>
            <v-btn type="submit" :color="submitButtonColor" block class="mt-2">Salvar Alterações</v-btn>
          </v-form>

          <v-form v-else-if="modalType === 'editMessage'" ref="messageFormRef" @submit.prevent="handleMessageSubmit('default')">
             <v-textarea
              label="Mensagem para clientes (a vencer)*"
              v-model="messageForm.default"
              :rules="[rules.required]"
              rows="5"
              auto-grow
              density="compact"
              prepend-inner-icon="mdi-message-text-outline"
              class="mb-4"
              variant="outlined"
            ></v-textarea>
            <v-btn type="submit" :color="submitButtonColor" block class="mt-2">Salvar Mensagem</v-btn>
          </v-form>
           <v-form v-else-if="modalType === 'editVencidoMessage'" ref="vencidoMessageFormRef" @submit.prevent="handleMessageSubmit('vencido')">
             <v-textarea
              label="Mensagem para clientes (VENCIDOS)*"
              v-model="messageForm.vencido"
              :rules="[rules.required]"
              rows="5"
              auto-grow
              density="compact"
              prepend-inner-icon="mdi-message-alert-outline"
              class="mb-4"
              variant="outlined"
            ></v-textarea>
            <v-btn type="submit" :color="submitButtonColor" block class="mt-2">Salvar Mensagem</v-btn>
          </v-form>

          <div v-else-if="modalType === 'manageServices'">
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
              <v-btn type="submit" :color="submitButtonColor" block>Salvar Novo Serviço</v-btn>
            </v-form>
            <v-divider class="my-6"></v-divider>
             <h4 class="text-subtitle-1 mb-2">Serviços Cadastrados</h4>
             <v-list lines="one" density="compact" class="py-0">
               <v-list-item v-for="servico in clientStore.servicos" :key="servico.id" class="px-1" >
                 <v-list-item-title>{{ servico.nome }}</v-list-item-title>
                 <template v-slot:append>
                   <v-btn
                     icon="mdi-pencil-outline"
                     variant="text"
                     size="small"
                     color="primary"
                     @click="openEditServiceDialog(servico)"
                     title="Editar Serviço"
                     class="me-1"
                   ></v-btn>
                   <v-btn
                     icon="mdi-delete-outline"
                     variant="text"
                     size="small"
                     color="red-lighten-1"
                     @click="confirmDeleteService(servico)"
                     title="Excluir Serviço"
                   ></v-btn>
                 </template>
               </v-list-item>
                <v-list-item v-if="clientStore.servicos.length === 0" class="px-1">Nenhum serviço cadastrado.</v-list-item>
             </v-list>
          </div>

        </v-container>
      </v-card-text>

      <v-card-actions class="px-4 pt-0 pb-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="$emit('close')">
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>

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
                    <v-btn color="grey-darken-1" text @click="closeEditServiceDialog">Cancelar</v-btn>
                    <v-btn :color="submitButtonColor" text type="submit">Salvar</v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-dialog>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useClientStore } from '@/stores/clientStore';
import { useTheme } from 'vuetify';

// --- Referências para Formulários ---
const registerFormRef = ref(null);
const editFormRef = ref(null);
const messageFormRef = ref(null);
const vencidoMessageFormRef = ref(null);
const serviceFormRef = ref(null);
const editServiceFieldRef = ref(null);
const editServiceFormRef = ref(null);

// --- Props, Emits, Stores ---
const props = defineProps({
  isOpen: Boolean,
  modalType: String,
  clientData: {
    type: Object,
    default: null
  },
});
const emit = defineEmits(['close']);
const clientStore = useClientStore();

// --- Título Dinâmico ---
const title = computed(() => {
  switch (props.modalType) {
    case 'register': return 'Cadastrar Novo Cliente';
    case 'editMessage': return 'Editar Mensagem Padrão';
    case 'editVencidoMessage': return 'Editar Mensagem (Vencido)';
    case 'editClient': return 'Editar Cliente';
    case 'manageServices': return 'Gerenciar Serviços';
    default: return 'Modal';
  }
});

// --- Estado e Funções para Formulário Cliente ---
const defaultForm = () => ({
  name: '',
  vencimento: new Date().toISOString().split('T')[0],
  servico: clientStore.servicos.length > 0 ? clientStore.servicos[0].nome : 'Serviço Padrão',
  whatsapp: '55',
  observacoes: '',
  valor_cobrado: 15.00,
  custo: 6.00,
});
const form = ref(null);
async function handleRegisterSubmit() {
  const { valid } = await registerFormRef.value.validate();
  if (!valid) return;
  await clientStore.addClient(form.value);
  emit('close');
}
async function handleEditSubmit() {
  const { valid } = await editFormRef.value.validate();
  if (!valid) return;
  if (!form.value || !form.value.id) return;
  await clientStore.updateClient(form.value.id, form.value);
  emit('close');
}

// --- Estado e Funções para Formulário Mensagem ---
const messageForm = ref({
  default: '',
  vencido: '',
});
async function handleMessageSubmit(type) {
  let formRef;
  let messageValue;
  if (type === 'vencido') {
      formRef = vencidoMessageFormRef;
      messageValue = messageForm.value.vencido;
  } else {
      formRef = messageFormRef;
      messageValue = messageForm.value.default;
  }
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  await clientStore.saveMessage(messageValue, type);
  emit('close');
}

// --- Estado e Funções para Gerenciar Serviços ---
const newServiceName = ref('');
async function handleSaveService() {
  const { valid } = await serviceFormRef.value.validate();
  if (!valid) return;
  if (!newServiceName.value || newServiceName.value.trim() === '') return;
  const success = await clientStore.addServico(newServiceName.value.trim());
  if (success) {
    newServiceName.value = '';
  }
}
async function confirmDeleteService(servico) {
  if (confirm(`Tem certeza que deseja excluir o serviço "${servico.nome}"?\n\n(Atenção: Clientes que usam este serviço não serão atualizados automaticamente.)`)) {
    await clientStore.deleteServico(servico.id);
  }
}

// --- Estado e Funções para Diálogo Edição Serviço ---
const editDialog = ref(false);
const editingService = ref(null);
const editingServiceName = ref('');
function openEditServiceDialog(servico) {
  console.log('AppModal: openEditServiceDialog chamada com:', servico);
  editingService.value = { ...servico };
  editingServiceName.value = servico.nome;
  console.log('AppModal: editDialog ANTES:', editDialog.value);
  editDialog.value = true;
  console.log('AppModal: editDialog DEPOIS:', editDialog.value);
  nextTick(() => {
     try {
       editServiceFieldRef.value?.focus();
       console.log('AppModal: Foco no campo de edição tentado.');
     } catch(e) {
       console.error('AppModal: Erro ao focar campo:', e);
     }
  });
}
function closeEditServiceDialog() {
  console.log('AppModal: closeEditServiceDialog chamada.');
  editDialog.value = false;
  editingService.value = null;
  editingServiceName.value = '';
  editServiceFormRef.value?.resetValidation();
}
async function handleUpdateService() {
  console.log('AppModal: handleUpdateService INICIADA.');
  if (!editServiceFormRef.value) {
      console.error('AppModal: Ref do FORMULÁRIO de edição não encontrada!');
      return;
  }
  const { valid } = await editServiceFormRef.value.validate();
  console.log('AppModal: Resultado da validação do FORMULÁRIO:', valid);
  if (!valid || !editingService.value) {
      console.log('AppModal: Validação do formulário falhou ou serviço não definido. Saindo.');
      return;
  }
  const serviceId = editingService.value.id;
  const newName = editingServiceName.value.trim();
  console.log(`AppModal: Chamando clientStore.updateServico(ID: ${serviceId}, Novo Nome: "${newName}")`);
  const success = await clientStore.updateServico(serviceId, newName);
  console.log('AppModal: Retorno de clientStore.updateServico:', success);
  if (success) {
    console.log('AppModal: Sucesso recebido, fechando diálogo.');
    closeEditServiceDialog();
  } else {
     console.log('AppModal: Falha recebida, NÃO fechando diálogo.');
  }
}

// --- Watcher para Resetar/Popular Forms ---
watch(() => props.isOpen, (newVal) => {
 if (!newVal) {
    // Resetar validação e estado ao fechar modal principal
    registerFormRef.value?.resetValidation();
    editFormRef.value?.resetValidation();
    messageFormRef.value?.resetValidation();
    vencidoMessageFormRef.value?.resetValidation();
    serviceFormRef.value?.resetValidation();
    editServiceFormRef.value?.resetValidation(); // Resetar form interno também
    form.value = null;
    newServiceName.value = '';
    // Resetar estado de edição também (caso feche o modal principal enquanto o interno está aberto)
    editDialog.value = false;
    editingService.value = null;
    editingServiceName.value = '';
  } else {
     // Lógica para popular forms ao abrir
     if (props.modalType === 'register') {
       form.value = defaultForm();
     }
     if (props.modalType === 'editClient' && props.clientData) {
       const vencimento = props.clientData.vencimento.split('T')[0];
       form.value = { ...props.clientData, vencimento: vencimento };
     }
     if (props.modalType === 'editMessage') {
       clientStore.fetchMessage('default').then(msg => { messageForm.value.default = msg; });
     }
     if (props.modalType === 'editVencidoMessage') {
       clientStore.fetchMessage('vencido').then(msg => { messageForm.value.vencido = msg; });
     }
     if (props.modalType === 'manageServices') {
       newServiceName.value = '';
     }
  }
});

// --- Lógica de Tema ---
const theme = useTheme();
const submitButtonColor = computed(() => {
  return theme.global.current.value.dark ? 'grey-darken-1' : 'primary';
});

// --- Regras de Validação ---
const rules = {
  required: value => !!value || 'Campo obrigatório.',
  numeric: value => (!isNaN(parseFloat(value)) && isFinite(value)) || 'Deve ser um número.',
  whatsappFormat: value => {
      if (!value) return true;
      const pattern = /^(?:\+?55)?(?:[1-9]{2})?(?:9[1-9]|8[1-9])\d{7}$/;
      const numericValue = value.startsWith('+') ? '+' + value.replace(/\D/g, '') : value.replace(/\D/g, '');
      return pattern.test(numericValue) || 'Formato inválido (ex: 55XX912345678).';
  }
};

</script>

<style scoped>
:deep(.v-input__details) {
  padding-bottom: 4px !important;
}
</style>