<template>
  <div class="dropdown">
    <button class="dropdown-toggle" @click.stop="toggleDropdown">
      Ações
    </button>
    
    <div class="dropdown-menu" v-if="isOpen" :style="menuStyle">
      <a href="#" @click.prevent="handleAction('edit')">Editar</a>
      <a href="#" @click.prevent="handleAction('whatsapp')">WhatsApp</a>
      <a href="#" @click.prevent="handleAction('whatsapp-vencido')">WhatsApp (Vencido)</a>
      <div class="dropdown-divider"></div>
      <a href="#" @click.prevent="handleStatus('pending')">Status: Não pagou</a>
      <a href="#" @click.prevent="handleStatus('paid')">Status: Cobrança feita</a>
      <a href="#" @click.prevent="handleStatus('in-day')">Status: Pag. em dias</a>
      <div class="dropdown-divider"></div>
      <a href="#" @click.prevent="handleDate('MONTH', 1)">Ajustar: +1 mês</a>
      <a href="#" @click.prevent="handleDate('MONTH', -1)">Ajustar: -1 mês</a>
      <div class="dropdown-divider"></div>
      <a href="#" class="dropdown-delete" @click.prevent="handleDelete">Excluir</a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useClientStore } from '@/stores/clientStore';

// Recebe o cliente específico da linha da tabela
const props = defineProps({
  client: Object,
});

const clientStore = useClientStore();

// Estado local para controlar o menu
const isOpen = ref(false);
// (A lógica de posicionamento complexa do seu JS original pode ser adicionada aqui depois)
const menuStyle = computed(() => ({
  // Estilos simples por enquanto
  position: 'absolute',
  right: '0',
  backgroundColor: 'white',
  zIndex: 10,
}));

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Funções que chamam as ações do Pinia
const handleStatus = (statusAction) => {
  clientStore.updateClientStatus(props.client.id, statusAction);
  isOpen.value = false;
};

const handleDate = (unit, value) => {
  clientStore.adjustClientDate(props.client.id, value, unit);
  isOpen.value = false;
};

const handleDelete = () => {
  if (confirm(`Excluir cliente ${props.client.name}?`)) {
    clientStore.deleteClient(props.client.id);
  }
  isOpen.value = false;
};

const handleAction = (action) => {
  // Lógica para 'edit', 'whatsapp', etc.
  console.log(action, props.client.id);
  isOpen.value = false;
  // (Lógica do modal de edição e do whatsapp virá aqui)
};
</script>