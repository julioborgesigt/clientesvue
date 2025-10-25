<template>
  <v-dialog 
    :model-value="isOpen" 
    @update:model-value="$emit('close')" 
    max-width="600px" 
    persistent
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ title }}</span>
      </v-card-title>

      <v-card-text>
        <v-container class="pb-0"> 
          
          <v-form v-if="modalType === 'register' && form" @submit.prevent="handleRegisterSubmit">
            <v-row no-gutters> 
              <v-col cols="12" class="py-0"> 
                 <v-text-field label="Nome*" v-model="form.name" required density="compact"></v-text-field>
              </v-col>
               <v-col cols="12" sm="6" class="py-0">
                 <v-text-field label="Vencimento*" v-model="form.vencimento" type="date" required density="compact"></v-text-field>
               </v-col>
              <v-col cols="12" sm="6" class="py-0">
                <v-select
                  label="Serviço"
                  v-model="form.servico"
                  :items="clientStore.servicos"
                  item-title="nome" 
                  item-value="nome"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="12" class="py-0">
                 <v-text-field label="WhatsApp (ex: 55...)" v-model="form.whatsapp" prepend-inner-icon="mdi-whatsapp" required density="compact"></v-text-field>
               </v-col>
               <v-col cols="12" sm="6" class="py-0">
                 <v-text-field label="Valor Cobrado (R$)" v-model.number="form.valor_cobrado" type="number" prefix="R$" density="compact"></v-text-field>
               </v-col>
               <v-col cols="12" sm="6" class="py-0">
                 <v-text-field label="Custo (R$)" v-model.number="form.custo" type="number" prefix="R$" density="compact"></v-text-field>
               </v-col>
               <v-col cols="12" class="py-0">
                 <v-textarea label="Observações" v-model="form.observacoes" rows="2" density="compact" class="pb-2"></v-textarea> 
               </v-col>
            </v-row>
            <v-btn type="submit" color="primary" block>Salvar Cliente</v-btn> 
          </v-form>

          <v-form v-else-if="modalType === 'editClient' && form" @submit.prevent="handleEditSubmit">
             <v-row no-gutters>
                <v-col cols="12" class="py-0">
                 <v-text-field label="Nome*" v-model="form.name" required density="compact"></v-text-field>
               </v-col>
                <v-col cols="12" sm="6" class="py-0">
                 <v-text-field label="Vencimento*" v-model="form.vencimento" type="date" required density="compact"></v-text-field>
               </v-col>
               <v-col cols="12" sm="6" class="py-0">
                <v-select
                  label="Serviço"
                  v-model="form.servico"
                  :items="clientStore.servicos"
                  item-title="nome"
                  item-value="nome"
                  density="compact"
                ></v-select>
              </v-col>
               <v-col cols="12" class="py-0">
                 <v-text-field label="WhatsApp" v-model="form.whatsapp" prepend-inner-icon="mdi-whatsapp" density="compact"></v-text-field>
               </v-col>
               <v-col cols="12" sm="6" class="py-0">
                 <v-text-field label="Valor (R$)" v-model.number="form.valor_cobrado" type="number" prefix="R$" density="compact"></v-text-field>
               </v-col>
               <v-col cols="12" sm="6" class="py-0">
                 <v-text-field label="Custo (R$)" v-model.number="form.custo" type="number" prefix="R$" density="compact"></v-text-field>
               </v-col>
               <v-col cols="12" class="py-0">
                 <v-textarea label="Observações" v-model="form.observacoes" rows="2" density="compact" class="pb-2"></v-textarea>
               </v-col>
            </v-row>
            <v-btn type="submit" color="primary" block>Salvar Alterações</v-btn>
          </v-form>

          <v-form v-else-if="modalType === 'editMessage'" @submit.prevent="handleMessageSubmit('default')">
             <v-textarea
              label="Mensagem para clientes (a vencer)"
              v-model="messageForm.default"
              rows="5"
              auto-grow
              density="compact" 
            ></v-textarea>
            <v-btn type="submit" color="primary" block class="mt-2">Salvar Mensagem</v-btn>
          </v-form>
          <v-form v-else-if="modalType === 'editVencidoMessage'" @submit.prevent="handleMessageSubmit('vencido')">
             <v-textarea
              label="Mensagem para clientes (VENCIDOS)"
              v-model="messageForm.vencido"
              rows="5"
              auto-grow
              density="compact"
            ></v-textarea>
            <v-btn type="submit" color="primary" block class="mt-2">Salvar Mensagem</v-btn>
          </v-form>

          <div v-else-if="modalType === 'manageServices'">

            <h3 class="text-h6 mb-4">Adicionar Novo Serviço</h3>
            <v-form @submit.prevent="handleSaveService">
              <v-text-field
                label="Nome do Novo Serviço"
                v-model="newServiceName"
                density="compact"
                class="mb-2"
                required
              ></v-text-field>
              <v-btn type="submit" color="primary" block>Salvar Novo Serviço</v-btn>
            </v-form>
            <v-divider class="my-6"></v-divider>

            <h3 class="text-h6 mb-2">Serviços Cadastrados</h3>
            <v-list lines="one" density="compact">
              <v-list-item 
                v-for="servico in clientStore.servicos" 
                :key="servico.id"
                :title="servico.nome"
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
               <v-list-item v-if="clientStore.servicos.length === 0">
                 Nenhum serviço cadastrado.
               </v-list-item>
            </v-list>
          </div>

        </v-container>
      </v-card-text>

      <v-card-actions>
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

// --- Título Dinâmico (Já correto) ---
const title = computed(() => {
  switch (props.modalType) {
    case 'register': return 'Cadastrar Novo Cliente';
    case 'editMessage': return 'Editar Mensagem Padrão';
    case 'editVencidoMessage': return 'Editar Mensagem (Vencido)';
    case 'editClient': return 'Editar Cliente'; 
    case 'manageServices': return 'Gerenciar Serviços'; // <-- Adicionado título para o novo modal
    default: return 'Modal';
  }
});

// --- Formulários Cliente (Já correto) ---
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

// --- Formulários Mensagem (Já correto) ---
const messageForm = ref({
  default: '',
  vencido: '',
});
async function handleMessageSubmit(type) {
  const message = (type === 'vencido') ? messageForm.value.vencido : messageForm.value.default;
  await clientStore.saveMessage(message, type);
  emit('close');
}

// --- LÓGICA PARA GERENCIAR SERVIÇOS --- // <-- ADICIONADO
const newServiceName = ref(''); // <-- ADICIONADO: Estado para o campo de texto

async function handleSaveService() { // <-- ADICIONADO: Função para salvar
  if (!newServiceName.value || newServiceName.value.trim() === '') {
    alert('Por favor, insira um nome para o serviço.');
    return;
  }
  // Chama a ação 'addServico' que criamos na store
  const success = await clientStore.addServico(newServiceName.value.trim()); 
  if (success) {
    newServiceName.value = ''; // Limpa o campo se deu certo
  }
}

async function confirmDeleteService(servico) {
  if (confirm(`Tem certeza que deseja excluir o serviço "${servico.nome}"?\n\n(Atenção: Clientes que usam este serviço não serão atualizados automaticamente.)`)) {
    await clientStore.deleteServico(servico.id);
  }
}
// --- FIM DA LÓGICA PARA GERENCIAR SERVIÇOS ---

// --- Watcher (Atualizado) ---
watch(() => props.isOpen, (newVal) => {
  if (newVal === true) {
    // ... (Casos 'register', 'editClient', 'editMessage', 'editVencidoMessage' - sem alterações) ...
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
    
    // ADICIONADO: Limpa o campo ao abrir o modal de gerenciar serviços
    if (props.modalType === 'manageServices') {
      newServiceName.value = ''; 
    }

  } else {
    // Limpa os formulários ao fechar o modal
    form.value = null; 
    newServiceName.value = ''; // <-- ADICIONADO: Limpa o campo do serviço também
  }
});
</script>