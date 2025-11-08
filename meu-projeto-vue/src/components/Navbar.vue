<template>
  <nav class="navbar">
    <div class="navbar-left">
      <a href="#" @click.prevent="$emit('open-modal', 'register')">Cadastrar Cliente</a>
      <a href="#" @click.prevent="$emit('open-modal', 'editMessage')">Editar Mensagem Padrão</a>
      <a href="#" @click.prevent="$emit('open-modal', 'editVencidoMessage')">Editar Mensagem (Vencido)</a>
    </div>
    <div class="navbar-right">
      <button id="logoutButton" @click="handleLogout">Logout</button>
    </div>
  </nav>

  <button id="menuToggle" class="menu-toggle">☰</button>

  <!-- Diálogo de Confirmação de Logout -->
  <ConfirmDialog
    v-model="logoutDialog"
    title="Confirmar Saída"
    message="Deseja realmente sair do sistema?"
    icon="mdi-logout"
    icon-color="warning"
    confirm-text="Sair"
    cancel-text="Cancelar"
    @confirm="handleLogoutConfirmed"
  />
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

// Define os eventos que este componente pode emitir
defineEmits(['open-modal']);

const authStore = useAuthStore();
const logoutDialog = ref(false);

const handleLogout = () => {
  logoutDialog.value = true;
};

const handleLogoutConfirmed = () => {
  authStore.logout();
};
</script>