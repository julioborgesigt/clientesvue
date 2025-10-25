<template>
  <v-dialog 
    :model-value="isOpen" 
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
          
          <v-form v-if="modalType === 'register' && form" @submit.prevent="handleRegisterSubmit">
            <h4 class="text-subtitle-1 mb-2 mt-2">Dados do Cliente</h4>
            <v-row no-gutters> 
              <v-col cols="12" class="py-0">
                <v-text-field 
                  label="Nome*" 
                  v-model="form.name" 
                  required 
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
                  required 
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
                  label="WhatsApp (ex: 55...)" 
                  v-model="form.whatsapp" 
                  prepend-inner-icon="mdi-whatsapp" 
                  required 
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
                  label="Valor Cobrado (R$)" 
                  v-model.number="form.valor_cobrado" 
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
                  label="Custo (R$)" 
                  v-model.number="form.custo" 
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

          <v-form v-else-if="modalType === 'editClient' && form" @submit.prevent="handleEditSubmit">
             <h4 class="text-subtitle-1 mb-2 mt-2">Dados do Cliente</h4>
            <v-row no-gutters>
              <v-col cols="12" class="py-0">
                 <v-text-field 
                   label="Nome*" 
                   v-model="form.name" 
                   required 
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
                   required 
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
                   label="Valor (R$)" 
                   v-model.number="form.valor_cobrado" 
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
                   label="Custo (R$)" 
                   v-model.number="form.custo" 
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

          <v-form v-else-if="modalType === 'editMessage'" @submit.prevent="handleMessageSubmit('default')">
             <v-textarea
              label="Mensagem para clientes (a vencer)"
              v-model="messageForm.default"
              rows="5"
              auto-grow
              density="compact"
              prepend-inner-icon="mdi-message-text-outline"
              class="mb-4" 
              variant="outlined"
            ></v-textarea>
            <v-btn type="submit" :color="submitButtonColor" block class="mt-2">Salvar Mensagem</v-btn>
          </v-form>
          <v-form v-else-if="modalType === 'editVencidoMessage'" @submit.prevent="handleMessageSubmit('vencido')">
             <v-textarea
              label="Mensagem para clientes (VENCIDOS)"
              v-model="messageForm.vencido"
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
            <v-form @submit.prevent="handleSaveService">
              <v-text-field
                label="Nome do Novo Serviço"
                v-model="newServiceName"
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
              <v-list-item 
                v-for="servico in clientStore.servicos" 
                :key="servico.id"
                :title="servico.nome"
                class="px-1" 
              >
                <template v-slot:append>
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
               <v-list-item v-if="clientStore.servicos.length === 0" class="px-1">
                 Nenhum serviço cadastrado.
               </v-list-item>
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
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useClientStore } from '@/stores/clientStore';
import { useTheme } from 'vuetify'; 

// --- Nenhuma mudança necessária no script ---
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
  await clientStore.addClient(form.value);
  emit('close'); 
}
async function handleEditSubmit() {
  if (!form.value || !form.value.id) return;
  await clientStore.updateClient(form.value.id, form.value);
  emit('close');
}
const messageForm = ref({
  default: '',
  vencido: '',
});
async function handleMessageSubmit(type) {
  const message = (type === 'vencido') ? messageForm.value.vencido : messageForm.value.default;
  await clientStore.saveMessage(message, type);
  emit('close');
}
const newServiceName = ref(''); 
async function handleSaveService() { 
  if (!newServiceName.value || newServiceName.value.trim() === '') {
    alert('Por favor, insira um nome para o serviço.');
    return;
  }
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
watch(() => props.isOpen, (newVal) => {
  if (newVal === true) {
    if (props.modalType === 'register') {
      form.value = defaultForm();
    }
    if (props.modalType === 'editClient' && props.clientData) {
      const vencimento = props.clientData.vencimento.split('T')[0];
      form.value = { ...props.clientData, vencimento: vencimento };
    }
     if (props.modalType === 'editMessage') {
      clientStore.fetchMessage('default').then(msg => {
        messageForm.value.default = msg;
      });
    }
     if (props.modalType === 'editVencidoMessage') {
      clientStore.fetchMessage('vencido').then(msg => {
        messageForm.value.vencido = msg;
      });
    }
    
    if (props.modalType === 'manageServices') {
      newServiceName.value = ''; 
    }

  } else {
    form.value = null; 
    newServiceName.value = ''; 
  }
});
const theme = useTheme(); 
const submitButtonColor = computed(() => {
  return theme.global.current.value.dark ? 'grey-darken-1' : 'primary';
});
</script>

<style scoped>
/* Reduzir um pouco a margem inferior padrão dos detalhes do campo */
:deep(.v-input__details) {
  padding-bottom: 4px !important;
}
</style>