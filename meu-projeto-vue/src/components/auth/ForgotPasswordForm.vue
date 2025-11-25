<template>
  <div>
    <!-- Título -->
    <v-card-title class="text-center text-h5 font-weight-bold pb-6" style="color: white;">
      <v-icon icon="mdi-lock-reset" class="me-2" color="error" size="large"></v-icon>
      Recuperar Senha
    </v-card-title>

    <v-card-text>
      <!-- Alert de Atenção -->
      <v-alert type="warning" variant="tonal" density="comfortable" class="mb-4" prominent>
        <template v-slot:prepend>
          <v-icon icon="mdi-alert" color="warning"></v-icon>
        </template>
        <div style="color: white; font-weight: 600; font-size: 14px;">
          <strong style="font-size: 15px;">⚠️ Atenção:</strong> Você precisará do código de recuperação fornecido no registro.
        </div>
      </v-alert>

      <!-- Formulário de Recuperação -->
      <v-form ref="forgotPasswordForm" @submit.prevent="handleResetPassword">
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
          class="mb-4 custom-input"
          :disabled="isLoading"
          placeholder="A1B2-C3D4-E5F6-G7H8"
        ></v-text-field>

        <!-- Nova Senha -->
        <v-text-field
          v-model="form.newPassword"
          label="Nova Senha"
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

        <!-- Confirmar Nova Senha -->
        <v-text-field
          v-model="form.confirmPassword"
          label="Confirmar Nova Senha"
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
            <strong style="font-size: 15px;">📋 Requisitos da Nova Senha:</strong>
            <ul class="mt-1 ms-2">
              <li>Mínimo de 12 caracteres</li>
              <li>Letra maiúscula, minúscula e número</li>
              <li>Caractere especial (@$!%*?&)</li>
            </ul>
          </div>
        </v-alert>

        <!-- Botão de Reset -->
        <v-btn
          type="submit"
          color="error"
          block
          size="x-large"
          :loading="isLoading"
          :disabled="isLoading"
          class="mb-4 font-weight-bold"
          style="font-size: 16px;"
        >
          <v-icon icon="mdi-lock-reset" class="me-2"></v-icon>
          Redefinir Senha
        </v-btn>
      </v-form>

      <!-- Divisor -->
      <v-divider class="my-4">
        <span class="text-caption font-weight-bold" style="color: white;">ou</span>
      </v-divider>

      <!-- Link para Login -->
      <div class="text-center mb-4">
        <span class="text-body-2" style="color: white; font-weight: 600;">Lembrou sua senha?</span>
        <v-btn
          variant="text"
          color="warning"
          size="small"
          @click="goToLogin"
          :disabled="isLoading"
          class="font-weight-bold"
        >
          <v-icon icon="mdi-arrow-left" size="small" class="me-1"></v-icon>
          Voltar ao Login
        </v-btn>
      </div>

      <!-- Card de Ajuda -->
      <v-alert type="warning" variant="tonal" density="comfortable" class="mt-2">
        <template v-slot:prepend>
          <v-icon icon="mdi-help-circle" color="warning"></v-icon>
        </template>
        <div style="color: white; font-weight: 600; font-size: 13px;">
          <strong style="font-size: 14px;">❓ Não tem o Código?</strong>
          <p class="mb-0 mt-1">
            O código foi fornecido quando você criou sua conta.
            Se perdeu, entre em contato com o administrador.
          </p>
        </div>
      </v-alert>
    </v-card-text>

    <!-- Dialog de Sucesso -->
    <v-dialog v-model="successDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-success text-center pa-4">
          <v-icon icon="mdi-check-circle" size="large" class="mb-2"></v-icon>
          <div style="color: white; font-weight: bold;">Senha Redefinida!</div>
        </v-card-title>
        <v-card-text class="text-center pa-6">
          <p class="font-weight-medium">Sua senha foi redefinida com sucesso.</p>
          <p class="text-caption text-grey">
            Por segurança, você foi desconectado de todos os dispositivos.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="success" variant="elevated" @click="goToLogin" class="font-weight-bold">
            <v-icon icon="mdi-login" class="me-2"></v-icon>
            Fazer Login
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
const forgotPasswordForm = ref(null);
const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const successDialog = ref(false);

// Dados do formulário
const form = ref({
  email: '',
  recoveryCode: '',
  newPassword: '',
  confirmPassword: ''
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
    return value === form.value.newPassword || 'As senhas não coincidem';
  }
};

/**
 * Manipula o reset de senha
 */
async function handleResetPassword() {
  // Valida o formulário
  const { valid } = await forgotPasswordForm.value.validate();
  if (!valid) {
    notificationStore.warning('Por favor, corrija os erros no formulário.');
    return;
  }

  isLoading.value = true;

  try {
    const success = await authStore.resetPasswordWithCode(
      form.value.email,
      form.value.recoveryCode,
      form.value.newPassword
    );

    if (success) {
      successDialog.value = true;
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
