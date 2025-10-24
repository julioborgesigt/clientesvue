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
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';

// Define os eventos que este componente pode emitir
defineEmits(['open-modal']);

const authStore = useAuthStore();

const handleLogout = () => {
  if (confirm('Deseja realmente sair?')) {
    authStore.logout();
  }
};
</script>