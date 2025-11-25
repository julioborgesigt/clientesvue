<template>
  <div>
    <!-- Título -->
    <v-card-title class="text-center text-h5 font-weight-bold pb-6" style="color: white;">
      <v-icon icon="mdi-account-plus" class="me-2" color="warning"></v-icon>
      Criar Nova Conta
    </v-card-title>

    <v-card-text>
      <!-- Formulário de Registro -->
      <v-form ref="registerForm" @submit.prevent="handleRegister">
        <!-- Nome Completo -->
        <v-text-field
          v-model="form.name"
          label="Nome Completo"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          :rules="[rules.required, rules.name]"
          density="comfortable"
          class="mb-3 custom-input"
          :disabled="isLoading"
        ></v-text-field>

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
          :rules="[rules.required, rules.password]"
          density="comfortable"
          class="mb-3 custom-input"
          :disabled="isLoading"
        ></v-text-field>

        <!-- Confirmar Senha -->
        <v-text-field
          v-model="form.confirmPassword"
          label="Confirmar Senha"
          :type="showConfirmPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-check-outline"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
          variant="outlined"
          :rules="[rules.required, rules.matchPassword]"
          density="comfortable"
          class="mb-4 custom-input"
          :disabled="isLoading"
        ></v-text-field>

        <!-- Requisitos de Senha -->
        <v-alert type="warning" density="comfortable" variant="tonal" class="mb-4">
          <template v-slot:prepend>
            <v-icon icon="mdi-information-outline" color="warning"></v-icon>
          </template>
          <div style="color: white; font-weight: 600; font-size: 14px;">
            <strong style="font-size: 15px;">📋 Requisitos da senha:</strong>
            <ul class="mt-1 ms-2">
              <li>Mínimo de 12 caracteres</li>
              <li>Letra maiúscula, minúscula e número</li>
              <li>Caractere especial (@$!%*?&)</li>
            </ul>
          </div>
        </v-alert>

        <!-- Botão Registrar -->
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
          <v-icon icon="mdi-account-plus" class="me-2"></v-icon>
          Criar Conta
        </v-btn>
      </v-form>

      <!-- Divisor -->
      <v-divider class="my-4">
        <span class="text-caption font-weight-bold" style="color: white;">ou</span>
      </v-divider>

      <!-- Link para Login -->
      <div class="text-center">
        <span class="text-body-2" style="color: white; font-weight: 600;">Já tem uma conta?</span>
        <v-btn
          variant="text"
          color="warning"
          size="small"
          @click="goToLogin"
          :disabled="isLoading"
          class="font-weight-bold"
        >
          Fazer Login
        </v-btn>
      </div>
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
const registerForm = ref(null);
const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Dados do formulário
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// Regras de validação
const rules = {
  required: (value) => !!value || 'Campo obrigatório',
  name: (value) => {
    if (!value) return 'Nome é obrigatório';
    if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (value.length > 100) return 'Nome deve ter no máximo 100 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Nome deve conter apenas letras';
    return true;
  },
  email: (value) => {
    if (!value) return 'E-mail é obrigatório';
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'E-mail inválido';
  },
  password: (value) => {
    if (!value) return 'Senha é obrigatória';
    if (value.length < 12) return 'Senha deve ter no mínimo 12 caracteres';
    if (!/(?=.*[a-z])/.test(value)) return 'Deve conter letra minúscula';
    if (!/(?=.*[A-Z])/.test(value)) return 'Deve conter letra maiúscula';
    if (!/(?=.*\d)/.test(value)) return 'Deve conter número';
    if (!/(?=.*[@$!%*?&])/.test(value)) return 'Deve conter caractere especial (@$!%*?&)';
    return true;
  },
  matchPassword: (value) => {
    return value === form.value.password || 'As senhas não coincidem';
  }
};

/**
 * Manipula o registro do usuário
 */
async function handleRegister() {
  // Valida o formulário
  const { valid } = await registerForm.value.validate();
  if (!valid) {
    notificationStore.warning('Por favor, corrija os erros no formulário.');
    return;
  }

  isLoading.value = true;

  try {
    // Limpa qualquer sessão antiga antes do registro
    sessionStorage.clear();
    authStore.token = null;
    authStore.accessToken = null;
    authStore.refreshToken = null;
    authStore.tokenExpiry = null;

    // Chama o método de registro do authStore
    const result = await authStore.register(
      form.value.name,
      form.value.email,
      form.value.password
    );

    // Se sucesso, navega para a tela de código de recuperação
    // 🔒 SEGURANÇA: Usa state ao invés de query params para não expor código na URL
    if (result.success) {
      router.push({
        name: 'RecoveryCode',
        state: {
          code: result.recoveryCode,
          email: form.value.email
        }
      });
    }
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
