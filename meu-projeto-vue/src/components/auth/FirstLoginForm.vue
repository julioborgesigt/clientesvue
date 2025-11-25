<template>
  <div>
    <!-- Título -->
    <v-card-title class="text-center text-h5 font-weight-bold pb-6" style="color: white;">
      <v-icon icon="mdi-shield-key" class="me-2" color="warning" size="large"></v-icon>
      Primeiro Login
    </v-card-title>

    <v-card-text>
      <!-- Alert de Informação -->
      <v-alert type="info" variant="tonal" density="comfortable" class="mb-4" prominent>
        <template v-slot:prepend>
          <v-icon icon="mdi-information"></v-icon>
        </template>
        <div style="color: white; font-weight: 600; font-size: 14px;">
          <strong style="font-size: 15px;">✨ Primeira vez no sistema?</strong><br>
          Para concluir seu registro, forneça o código de recuperação que foi mostrado após o cadastro.
        </div>
      </v-alert>

      <!-- Formulário de Primeiro Login -->
      <v-form ref="firstLoginForm" @submit.prevent="handleFirstLogin">
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
          class="mb-3 custom-input"
          :disabled="isLoading"
        ></v-text-field>

        <!-- Código de Recuperação -->
        <v-text-field
          v-model="form.recoveryCode"
          label="Código de Recuperação"
          prepend-inner-icon="mdi-key-variant"
          variant="outlined"
          hint="Formato: XXXX-XXXX-XXXX-XXXX"
          persistent-hint
          :rules="[rules.required, rules.recoveryCode]"
          density="comfortable"
          class="mb-5 custom-input"
          :disabled="isLoading"
          placeholder="A1B2-C3D4-E5F6-G7H8"
        ></v-text-field>

        <!-- Botão de Primeiro Login -->
        <v-btn
          type="submit"
          color="warning"
          block
          size="x-large"
          :loading="isLoading"
          :disabled="isLoading"
          class="mb-4 font-weight-bold"
          style="font-size: 16px;"
        >
          <v-icon icon="mdi-check-circle" class="me-2"></v-icon>
          Confirmar e Entrar
        </v-btn>
      </v-form>

      <!-- Divisor -->
      <v-divider class="my-4">
        <span class="text-caption font-weight-bold" style="color: white;">ou</span>
      </v-divider>

      <!-- Links de Navegação -->
      <div class="text-center mb-4">
        <v-btn
          variant="text"
          size="small"
          color="primary"
          @click="goToLogin"
          :disabled="isLoading"
          class="me-2 font-weight-bold"
        >
          <v-icon icon="mdi-arrow-left" size="small" class="me-1"></v-icon>
          Voltar ao Login
        </v-btn>
        <v-btn
          variant="text"
          size="small"
          color="error"
          @click="goToForgotPassword"
          :disabled="isLoading"
          class="font-weight-bold"
        >
          <v-icon icon="mdi-lock-reset" size="small" class="me-1"></v-icon>
          Esqueci meu código
        </v-btn>
      </div>

      <!-- Card de Ajuda -->
      <v-alert type="info" variant="tonal" density="comfortable" class="mt-2">
        <template v-slot:prepend>
          <v-icon icon="mdi-help-circle" color="info"></v-icon>
        </template>
        <div style="color: white; font-weight: 600; font-size: 13px;">
          <strong style="font-size: 14px;">📌 Precisa de Ajuda?</strong>
          <ul class="mt-1 ms-2">
            <li>O código foi mostrado após seu cadastro</li>
            <li>Formato: XXXX-XXXX-XXXX-XXXX</li>
            <li>Se perdeu, entre em contato com o administrador</li>
          </ul>
        </div>
      </v-alert>
    </v-card-text>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Refs
const firstLoginForm = ref(null);
const isLoading = ref(false);
const showPassword = ref(false);

// Dados do formulário
const form = ref({
  email: '',
  password: '',
  recoveryCode: ''
});

// Regras de validação
const rules = {
  required: (value) => !!value || 'Campo obrigatório',
  email: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'E-mail inválido';
  },
  recoveryCode: (value) => {
    if (!value) return 'Código de recuperação é obrigatório';
    const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
    return pattern.test(value) || 'Formato inválido. Use: XXXX-XXXX-XXXX-XXXX';
  }
};

/**
 * Manipula o primeiro login
 */
async function handleFirstLogin() {
  // Valida o formulário
  const { valid } = await firstLoginForm.value.validate();
  if (!valid) {
    notificationStore.warning('Por favor, corrija os erros no formulário.');
    return;
  }

  isLoading.value = true;

  try {
    await authStore.firstLogin(
      form.value.email,
      form.value.password,
      form.value.recoveryCode
    );
    // O redirecionamento é feito no authStore
  } catch (error) {
    // Erro já tratado no authStore
  } finally {
    isLoading.value = false;
  }
}

/**
 * Navegação
 */
function goToLogin() {
  router.push('/auth/login');
}

function goToForgotPassword() {
  // 🔒 SEGURANÇA: Usa state ao invés de query para não expor email na URL
  router.push({
    name: 'ForgotPassword',
    state: { email: form.value.email }
  });
}

// Preenche email se vier do router state (seguro) ou fallback para query
onMounted(() => {
  // 🔒 SEGURANÇA: Prioriza state (não expõe na URL), fallback para query para compatibilidade
  const state = history.state || {};
  const email = state.email || route.query.email || '';

  if (email) {
    form.value.email = email;
  }
});
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
