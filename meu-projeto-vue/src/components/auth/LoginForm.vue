<template>
  <div>
    <!-- Título Responsivo -->
    <v-card-title class="text-center auth-title auth-spacing-md pa-0">
      <v-icon icon="mdi-login" class="me-2 auth-icon" color="warning"></v-icon>
      Entre no Portal
    </v-card-title>

    <v-card-text class="pa-0">
      <!-- Formulário de Login -->
      <v-form ref="loginForm" @submit.prevent="handleLogin">
        <!-- Email -->
        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          :rules="[rules.required, rules.email]"
          density="comfortable"
          class="auth-spacing-md custom-input"
          :disabled="isLoading"
          autocomplete="email"
        ></v-text-field>

        <!-- Senha -->
        <v-text-field
          v-model="form.password"
          label="Senha"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
          variant="outlined"
          :rules="[rules.required]"
          density="comfortable"
          class="auth-spacing-md custom-input"
          :disabled="isLoading"
          autocomplete="current-password"
        ></v-text-field>

        <!-- Botão de Login -->
        <v-btn
          type="submit"
          color="warning"
          block
          class="auth-button auth-spacing-md"
          :loading="isLoading"
          :disabled="isLoading"
        >
          <v-icon icon="mdi-login" class="me-2"></v-icon>
          Entrar
        </v-btn>

        <!-- Link para Esqueci a Senha -->
        <div class="text-center auth-spacing-md">
          <a
            class="auth-link"
            @click="goToForgotPassword"
            :class="{ 'auth-loading': isLoading }"
            tabindex="0"
            @keyup.enter="goToForgotPassword"
          >
            <v-icon icon="mdi-lock-reset" size="small" class="me-1"></v-icon>
            Esqueceu a senha?
          </a>
        </div>
      </v-form>

      <!-- Divisor Customizado -->
      <div class="auth-divider">
        <span>ou</span>
      </div>

      <!-- Botão para Criar Conta -->
      <v-btn
        prepend-icon="mdi-account-plus"
        variant="outlined"
        color="warning"
        block
        class="auth-button-secondary"
        @click="goToRegister"
        :disabled="isLoading"
      >
        Criar Nova Conta
      </v-btn>
    </v-card-text>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Refs
const loginForm = ref(null);
const isLoading = ref(false);
const showPassword = ref(false);

// Dados do formulário
const form = ref({
  email: '',
  password: ''
});

// Regras de validação
const rules = {
  required: (value) => !!value || 'Campo obrigatório',
  email: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'E-mail inválido';
  }
};

/**
 * Manipula o login
 */
async function handleLogin() {
  // Valida o formulário
  const { valid } = await loginForm.value.validate();
  if (!valid) {
    notificationStore.warning('Por favor, corrija os erros no formulário.');
    return;
  }

  isLoading.value = true;

  try {
    await authStore.login(form.value.email, form.value.password);
    // O redirecionamento é feito no authStore (incluindo detecção de primeiro login)
  } catch (error) {
    // Erro já tratado no authStore
  } finally {
    isLoading.value = false;
  }
}

/**
 * Navegação
 */
function goToRegister() {
  router.push('/auth/register');
}

function goToForgotPassword() {
  router.push('/auth/forgot-password');
}
</script>

<style scoped>
/* Estilos específicos do Login - A maioria vem de auth-styles.css */

/* Mensagens de erro */
:deep(.custom-input .v-field--error .v-label) {
  color: #FF5252 !important;
  font-weight: 700 !important;
}

:deep(.custom-input .v-messages__message) {
  font-weight: 600 !important;
  color: #FF5252 !important;
  font-size: 13px !important;
  margin-top: 4px;
}

@media (max-width: 599px) {
  :deep(.custom-input .v-messages__message) {
    font-size: 12px !important;
  }
}
</style>
