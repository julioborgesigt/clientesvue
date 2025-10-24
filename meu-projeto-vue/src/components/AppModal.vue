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
        <v-container>
          
          <v-form v-if="modalType === 'register' && form" @submit.prevent="handleRegisterSubmit">
            <v-row>
              <v-col cols="12">
                <v-text-field label="Nome*" v-model="form.name" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Vencimento*" v-model="form.vencimento" type="date" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Serviço" v-model="form.servico"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="WhatsApp (ex: 55...)" v-model="form.whatsapp" prepend-inner-icon="mdi-whatsapp" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Valor Cobrado (R$)" v-model.number="form.valor_cobrado" type="number" prefix="R$"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Custo (R$)" v-model.number="form.custo" type="number" prefix="R$"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea label="Observações" v-model="form.observacoes" rows="2"></v-textarea>
              </v-col>
            </v-row>
            <v-btn type="submit" color="primary" block>Salvar Cliente</v-btn>
          </v-form>

          <v-form v-else-if="modalType === 'editClient' && form" @submit.prevent="handleEditSubmit">
            <v-row>
              <v-col cols="12">
                <v-text-field label="Nome*" v-model="form.name" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Vencimento*" v-model="form.vencimento" type="date" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Serviço" v-model="form.servico"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="WhatsApp" v-model="form.whatsapp" prepend-inner-icon="mdi-whatsapp"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Valor (R$)" v-model.number="form.valor_cobrado" type="number" prefix="R$"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Custo (R$)" v-model.number="form.custo" type="number" prefix="R$"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea label="Observações" v-model="form.observacoes" rows="2"></v-textarea>
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
            ></v-textarea>
            <v-btn type="submit" color="primary" block>Salvar Mensagem</v-btn>
          </v-form>

          <v-form v-else-if="modalType === 'editVencidoMessage'" @submit.prevent="handleMessageSubmit('vencido')">
            <v-textarea
              label="Mensagem para clientes (VENCIDOS)"
              v-model="messageForm.vencido"
              rows="5"
              auto-grow
            ></v-textarea>
            <v-btn type="submit" color="primary" block>Salvar Mensagem</v-btn>
          </v-form>

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

// 1. Recebe a nova prop 'clientData'
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

// --- Lógica do Título Dinâmico ---
const title = computed(() => {
  switch (props.modalType) {
    case 'register': return 'Cadastrar Novo Cliente';
    case 'editMessage': return 'Editar Mensagem Padrão';
    case 'editVencidoMessage': return 'Editar Mensagem (Vencido)';
    case 'editClient': return 'Editar Cliente'; // <-- Título para o novo formulário
    default: return 'Modal';
  }
});

// --- Lógica dos Formulários (Cadastro e Edição) ---
const defaultForm = () => ({
  name: '',
  vencimento: new Date().toISOString().split('T')[0],
  servico: 'Serviço Padrão',
  whatsapp: '55',
  observacoes: '',
  valor_cobrado: 15.00,
  custo: 6.00,
});
// 2. Inicializa o form como 'null' para ser populado pelo watcher
const form = ref(null); 

async function handleRegisterSubmit() {
  await clientStore.addClient(form.value);
  emit('close'); // Fecha o modal
}

// 3. Adiciona a função de submit para EDIÇÃO
async function handleEditSubmit() {
  if (!form.value || !form.value.id) return;
  await clientStore.updateClient(form.value.id, form.value);
  emit('close');
}

// --- Lógica dos Formulários de Mensagem ---
const messageForm = ref({
  default: '',
  vencido: '',
});

async function handleMessageSubmit(type) {
  const message = (type === 'vencido') ? messageForm.value.vencido : messageForm.value.default;
  await clientStore.saveMessage(message, type);
  emit('close');
}

// --- Watcher para carregar dados ---
// 4. Atualiza o Watcher para lidar com TODOS os casos
watch(() => props.isOpen, (newVal) => {
  if (newVal === true) {
    // Caso 1: Abrindo modal de REGISTRO
    if (props.modalType === 'register') {
      form.value = defaultForm();
    }
    
    // Caso 2: Abrindo modal de EDIÇÃO
    if (props.modalType === 'editClient' && props.clientData) {
      // Formata a data de '...T00:00:00.000Z' para 'YYYY-MM-DD'
      const vencimento = props.clientData.vencimento.split('T')[0];
      form.value = { ...props.clientData, vencimento: vencimento };
    }

    // Caso 3: Abrindo modal de MENSAGEM PADRÃO
    if (props.modalType === 'editMessage') {
      clientStore.fetchMessage('default').then(msg => {
        messageForm.value.default = msg;
      });
    }
    
    // Caso 4: Abrindo modal de MENSAGEM VENCIDO
    if (props.modalType === 'editVencidoMessage') {
      clientStore.fetchMessage('vencido').then(msg => {
        messageForm.value.vencido = msg;
      });
    }
  } else {
    // Limpa o formulário principal ao fechar o modal
    form.value = null; 
  }
});
</script>