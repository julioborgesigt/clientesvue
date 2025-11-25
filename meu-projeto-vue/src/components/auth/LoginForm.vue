<template>
  <div>
    <!-- Título -->
    <v-card-title class="text-center text-h5 font-weight-bold pb-6" style="color: white;">
      <v-icon icon="mdi-login" class="me-2" color="primary" size="large"></v-icon>
      Entre no Portal
    </v-card-title>

    <v-card-text>
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
          class="mb-3 custom-input"
          :disabled="isLoading"
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
          class="custom-input"
          :disabled="isLoading"
        ></v-text-field>

        <!-- Botão de Login -->
        <v-btn
          type="submit"
          color="primary"
          block
          size="x-large"
          class="mt-5 mb-4 font-weight-bold"
          :loading="isLoading"
          :disabled="isLoading"
          style="font-size: 16px;"
        >
          <v-icon icon="mdi-login" class="me-2"></v-icon>
          Entrar
        </v-btn>

        <!-- Link para Esqueci a Senha -->
        <div class="text-center mb-4">
          <v-btn
            variant="text"
            size="small"
            color="error"
            @click="goToForgotPassword"
            :disabled="isLoading"
            class="font-weight-bold"
          >
            <v-icon icon="mdi-lock-reset" size="small" class="me-1"></v-icon>
            Esqueceu a senha?
          </v-btn>
        </div>
      </v-form>

      <!-- Divisor -->
      <v-divider class="my-4">
        <span class="text-caption font-weight-bold" style="color: white;">ou</span>
      </v-divider>

      <!-- Botão para Criar Conta -->
      <v-btn
        prepend-icon="mdi-account-plus"
        variant="outlined"
        color="warning"
        block
        size="large"
        @click="goToRegister"
        :disabled="isLoading"
        class="font-weight-bold"
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
/* Melhora a legibilidade dos inputs */
:deep(.custom-input .v-field__input) {
  font-weight: 600 !important;
  color: white !important;
  font-size: 15px !important;
}

:deep(.custom-input .v-label) {
  font-weight: 600 !important;
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 14px !important;
}

:deep(.custom-input .v-field--error .v-label) {
  color: #ff5252 !important;
}

:deep(.custom-input .v-messages__message) {
  font-weight: 600 !important;
  color: #ff5252 !important;
}
</style>
