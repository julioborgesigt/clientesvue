<template>
  <v-container fluid class="fill-height auth-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <!-- Cartão de Registro -->
        <v-card elevation="8" class="auth-card">
          <v-card-title class="text-h5 text-center pa-4 bg-primary">
            <v-icon icon="mdi-account-plus" class="me-2"></v-icon>
            Criar Conta
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form ref="registerForm" @submit.prevent="handleRegister">
              <!-- Nome -->
              <v-text-field
                v-model="form.name"
                label="Nome Completo"
                prepend-inner-icon="mdi-account"
                :rules="[rules.required, rules.name]"
                variant="outlined"
                class="mb-3"
                :disabled="isLoading"
              ></v-text-field>

              <!-- Email -->
              <v-text-field
                v-model="form.email"
                label="E-mail"
                type="email"
                prepend-inner-icon="mdi-email"
                :rules="[rules.required, rules.email]"
                variant="outlined"
                class="mb-3"
                :disabled="isLoading"
              ></v-text-field>

              <!-- Senha -->
              <v-text-field
                v-model="form.password"
                label="Senha"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :rules="[rules.required, rules.password]"
                variant="outlined"
                class="mb-3"
                :disabled="isLoading"
              ></v-text-field>

              <!-- Confirmar Senha -->
              <v-text-field
                v-model="form.confirmPassword"
                label="Confirmar Senha"
                :type="showConfirmPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                :rules="[rules.required, rules.matchPassword]"
                variant="outlined"
                class="mb-4"
                :disabled="isLoading"
              ></v-text-field>

              <!-- Requisitos de Senha -->
              <v-alert type="info" density="compact" variant="tonal" class="mb-4">
                <div class="text-caption">
                  <strong>Requisitos da senha:</strong>
                  <ul class="mt-2">
                    <li>Mínimo de 12 caracteres</li>
                    <li>Pelo menos uma letra maiúscula</li>
                    <li>Pelo menos uma letra minúscula</li>
                    <li>Pelo menos um número</li>
                    <li>Pelo menos um caractere especial (@$!%*?&)</li>
                  </ul>
                </div>
              </v-alert>

              <!-- Botão Registrar -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="isLoading"
                :disabled="isLoading"
                class="mb-4"
              >
                Criar Conta
              </v-btn>

              <!-- Link para Login -->
              <div class="text-center">
                <span class="text-body-2 text-grey">Já tem uma conta?</span>
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  @click="goToLogin"
                  :disabled="isLoading"
                >
                  Fazer Login
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de Código de Recuperação -->
    <v-dialog v-model="recoveryDialog" persistent max-width="600">
      <v-card>
        <v-card-title class="text-h5 bg-warning pa-4">
          <v-icon icon="mdi-shield-key" class="me-2"></v-icon>
          Guarde seu Código de Recuperação
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert type="warning" variant="tonal" class="mb-4">
            <template v-slot:prepend>
              <v-icon icon="mdi-alert"></v-icon>
            </template>
            <strong>ATENÇÃO:</strong> Este código será mostrado APENAS UMA VEZ!
          </v-alert>

          <!-- Código de Recuperação -->
          <div class="recovery-code-display text-center py-4 mb-4">
            <div class="text-h4 font-weight-bold text-primary mb-2">
              {{ recoveryCode }}
            </div>
            <v-btn
              prepend-icon="mdi-content-copy"
              variant="tonal"
              color="primary"
              @click="copyRecoveryCode"
              class="mt-2"
            >
              Copiar Código
            </v-btn>
          </div>

          <!-- Instruções -->
          <div class="instructions">
            <p class="text-subtitle-2 font-weight-bold mb-2">Instruções Importantes:</p>
            <ul>
              <li>Anote este código em um local seguro</li>
              <li>NÃO compartilhe com ninguém</li>
              <li>Você precisará dele no primeiro login</li>
              <li>Este código é necessário para recuperar sua conta se esquecer a senha</li>
            </ul>
          </div>

          <!-- Checkbox de Confirmação -->
          <v-checkbox
            v-model="confirmedSaved"
            label="Confirmo que guardei meu código de recuperação em local seguro"
            color="warning"
            class="mt-4"
          ></v-checkbox>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            size="large"
            :disabled="!confirmedSaved"
            @click="goToFirstLogin"
          >
            Prosseguir para Primeiro Login
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Refs do formulário
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

// Dialog do Recovery Code
const recoveryDialog = ref(false);
const recoveryCode = ref('');
const confirmedSaved = ref(false);

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
    if (!/(?=.*[a-z])/.test(value)) return 'Senha deve conter pelo menos uma letra minúscula';
    if (!/(?=.*[A-Z])/.test(value)) return 'Senha deve conter pelo menos uma letra maiúscula';
    if (!/(?=.*\d)/.test(value)) return 'Senha deve conter pelo menos um número';
    if (!/(?=.*[@$!%*?&])/.test(value)) return 'Senha deve conter pelo menos um caractere especial (@$!%*?&)';
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
    // Chama o método de registro do authStore
    const result = await authStore.register(
      form.value.name,
      form.value.email,
      form.value.password
    );

    // Se sucesso, mostra o dialog com o recovery code
    if (result.success) {
      recoveryCode.value = result.recoveryCode;
      recoveryDialog.value = true;
    }
  } catch (error) {
    // Erro já tratado no authStore
  } finally {
    isLoading.value = false;
  }
}

/**
 * Copia o código de recuperação para a área de transferência
 */
async function copyRecoveryCode() {
  try {
    await navigator.clipboard.writeText(recoveryCode.value);
    notificationStore.success('Código copiado para a área de transferência!');
  } catch (error) {
    notificationStore.error('Erro ao copiar código.');
  }
}

/**
 * Redireciona para a tela de primeiro login
 */
function goToFirstLogin() {
  router.push({
    name: 'FirstLogin',
    query: { email: form.value.email }
  });
}

/**
 * Redireciona para a tela de login
 */
function goToLogin() {
  router.push('/login');
}
</script>

<style scoped>
.auth-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.auth-card {
  border-radius: 16px;
  overflow: hidden;
}

.recovery-code-display {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-radius: 8px;
  border: 2px dashed rgb(var(--v-theme-primary));
}

.instructions {
  background-color: rgba(var(--v-theme-surface), 0.5);
  padding: 16px;
  border-radius: 8px;
}

.instructions ul {
  padding-left: 20px;
  margin: 0;
}

.instructions li {
  margin-bottom: 8px;
  line-height: 1.6;
}
</style>
