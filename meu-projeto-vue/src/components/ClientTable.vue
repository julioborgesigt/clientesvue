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

    <v-data-table
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="clients"
      :search="search"
      :loading="clients.length === 0"
      density="compact"
    >
      <template v-slot:item.valor_cobrado="{ value }">
        R$ {{ value.toFixed(2) }}
      </template>
      
      <template v-slot:item.custo="{ value }">
        R$ {{ value.toFixed(2) }}
      </template>
      
      <template v-slot:item.status="{ value }">
        <v-chip :color="getStatusColor(value)" size="small">
          {{ value }}
        </v-chip>
      </template>

      <template v-slot:item.vencimento="{ value }">
        {{ formatDate(value) }}
      </template>
      
      <template v-slot:item.actions="{ item }">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
          </template>
          <v-list density="compact">
            <v-list-item title="Editar" @click="handleAction('edit', item)"></v-list-item>
            <v-divider></v-divider>
            <v-list-item title="+1 Mês" @click="handleDate('MONTH', 1, item.id)"></v-list-item>
            <v-list-item title="-1 Mês" @click="handleDate('MONTH', -1, item.id)"></v-list-item>
            <v-divider></v-divider>
            <v-list-item title="WhatsApp" @click="handleAction('whatsapp', item)"></v-list-item>
            <v-list-item title="WhatsApp (Vencido)" @click="handleAction('whatsapp-vencido', item)"></v-list-item>
            <v-divider></v-divider>
            <v-list-item title="Status: Não Pagou" @click="handleStatus('pending', item.id)"></v-list-item>
            <v-list-item title="Status: Cobrança Feita" @click="handleStatus('paid', item.id)"></v-list-item>
            <v-list-item title="Status: Pag. em Dias" @click="handleStatus('in-day', item.id)"></v-list-item>
            <v-divider></v-divider>
            <v-list-item title="Excluir" color="red" @click="handleDelete(item)"></v-list-item>
          </v-list>
        </v-menu>
      </template>

    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useClientStore } from '@/stores/clientStore';

defineProps({
  clients: Array,
});
const clientStore = useClientStore();

// --- Lógica do v-data-table ---
const search = ref('');
const itemsPerPage = ref(10); // Quantos itens por página
const emit = defineEmits(['open-edit-modal']);


// Definição das colunas da tabela
const headers = [
  { title: 'ID', key: 'id', align: 'start' },
  { title: 'Nome', key: 'name' },
  { title: 'Vencimento', key: 'vencimento' },
  { title: 'Serviço', key: 'servico' },
  { title: 'WhatsApp', key: 'whatsapp' },
  { title: 'Valor (R$)', key: 'valor_cobrado' },
  { title: 'Custo (R$)', key: 'custo' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'end' },
];
// --- Fim da lógica ---


// --- Funções de Ação (agora chamam a store) ---
const handleStatus = (statusAction, clientId) => {
  clientStore.updateClientStatus(clientId, statusAction);
};

const handleDate = (unit, value, clientId) => {
  clientStore.adjustClientDate(clientId, value, unit);
};

const handleDelete = (client) => {
  if (confirm(`Excluir cliente ${client.name}?`)) {
    clientStore.deleteClient(client.id);
  }
};

const handleAction = (action, client) => {
  if (action === 'edit') {
    // EMITA O EVENTO PARA O COMPONENTE PAI (DashboardView)
    emit('open-edit-modal', client); 
  } else {
    // (Lógica futura do whatsapp)
    console.log('Ação:', action, client.name);
  }
};
// --- Funções de Formatação (Helpers) ---
const getStatusColor = (status) => {
  if (status === 'Não pagou') return 'red-darken-1';
  if (status === 'cobrança feita') return 'orange-darken-1';
  if (status === 'Pag. em dias') return 'green-darken-1';
  return 'grey';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};
</script>