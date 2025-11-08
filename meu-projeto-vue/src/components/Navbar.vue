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
/**
 * @fileoverview Componente de navegação principal do Dashboard
 * @description Barra de navegação superior com menu de ações e logout
 * @component Navbar
 *
 * @emits open-modal - Emitido quando usuário clica em "Cadastrar Cliente", "Editar Mensagem Padrão", etc
 *   @param {'register'|'editMessage'|'editVencidoMessage'} modalType - Tipo de modal a abrir
 *
 * @example
 * <Navbar @open-modal="handleOpenModal" />
 */

import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

/**
 * Define os eventos que este componente pode emitir
 * @fires open-modal - Evento para abrir modais de cadastro e edição de mensagens
 */
defineEmits(['open-modal']);

const authStore = useAuthStore();

/** @type {import('vue').Ref<boolean>} Controla exibição do diálogo de confirmação de logout */
const logoutDialog = ref(false);

/**
 * Abre diálogo de confirmação de logout
 * @returns {void}
 */
const handleLogout = () => {
  logoutDialog.value = true;
};

/**
 * Executa logout após confirmação do usuário
 * Chama authStore.logout() que limpa sessão e redireciona para /login
 * @returns {void}
 */
const handleLogoutConfirmed = () => {
  authStore.logout();
};
</script>