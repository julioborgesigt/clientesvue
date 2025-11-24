<template>
  <v-container fluid class="fill-height auth-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <!-- Cartão de Recuperação de Senha -->
        <v-card elevation="8" class="auth-card">
          <v-card-title class="text-h5 text-center pa-4 bg-error">
            <v-icon icon="mdi-lock-reset" class="me-2"></v-icon>
            Recuperar Senha
          </v-card-title>

          <v-card-text class="pa-6">
            <v-alert type="warning" variant="tonal" class="mb-4">
              <template v-slot:prepend>
                <v-icon icon="mdi-alert"></v-icon>
              </template>
              <strong>Atenção:</strong> Você precisará do código de recuperação fornecido no registro.
            </v-alert>

            <v-form ref="forgotPasswordForm" @submit.prevent="handleResetPassword">
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

              <!-- Código de Recuperação -->
              <v-text-field
                v-model="form.recoveryCode"
                label="Código de Recuperação"
                prepend-inner-icon="mdi-key-variant"
                hint="Formato: XXXX-XXXX-XXXX-XXXX"
                persistent-hint
                :rules="[rules.required, rules.recoveryCode]"
                variant="outlined"
                class="mb-3"
                :disabled="isLoading"
                placeholder="A1B2-C3D4-E5F6-G7H8"
              ></v-text-field>

              <!-- Nova Senha -->
              <v-text-field
                v-model="form.newPassword"
                label="Nova Senha"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :rules="[rules.required, rules.password]"
                variant="outlined"
                class="mb-3"
                :disabled="isLoading"
              ></v-text-field>

              <!-- Confirmar Nova Senha -->
              <v-text-field
                v-model="form.confirmPassword"
                label="Confirmar Nova Senha"
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
              <v-expansion-panels class="mb-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon icon="mdi-information-outline" class="me-2"></v-icon>
                    Requisitos da Senha
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <ul class="text-caption">
                      <li>Mínimo de 12 caracteres</li>
                      <li>Pelo menos uma letra maiúscula</li>
                      <li>Pelo menos uma letra minúscula</li>
                      <li>Pelo menos um número</li>
                      <li>Pelo menos um caractere especial (@$!%*?&)</li>
                    </ul>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <!-- Botão de Reset -->
              <v-btn
                type="submit"
                color="error"
                size="large"
                block
                :loading="isLoading"
                :disabled="isLoading"
                class="mb-4"
              >
                Redefinir Senha
              </v-btn>

              <!-- Link para Login -->
              <div class="text-center">
                <span class="text-body-2 text-grey">Lembrou sua senha?</span>
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  @click="goToLogin"
                  :disabled="isLoading"
                >
                  Voltar ao Login
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Card de Ajuda -->
        <v-card elevation="4" class="mt-4">
          <v-card-title class="text-subtitle-1">
            <v-icon icon="mdi-help-circle" class="me-2" color="info"></v-icon>
            Não tem o Código de Recuperação?
          </v-card-title>
          <v-card-text class="text-caption">
            <p class="mb-2">
              O código de recuperação foi fornecido quando você criou sua conta.
              Ele é necessário para redefinir sua senha.
            </p>
            <p>
              Se você perdeu o código, entre em contato com o administrador do sistema
              para assistência.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de Sucesso -->
    <v-dialog v-model="successDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-success text-center pa-4">
          <v-icon icon="mdi-check-circle" size="large" class="mb-2"></v-icon>
          <div>Senha Redefinida!</div>
        </v-card-title>
        <v-card-text class="text-center pa-6">
          <p>Sua senha foi redefinida com sucesso.</p>
          <p class="text-caption text-grey">
            Por segurança, você foi desconectado de todos os dispositivos.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="elevated" @click="goToLogin">
            Fazer Login
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
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

// Refs do formulário
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
    if (!/(?=.*[a-z])/.test(value)) return 'Senha deve conter pelo menos uma letra minúscula';
    if (!/(?=.*[A-Z])/.test(value)) return 'Senha deve conter pelo menos uma letra maiúscula';
    if (!/(?=.*\d)/.test(value)) return 'Senha deve conter pelo menos um número';
    if (!/(?=.*[@$!%*?&])/.test(value)) return 'Senha deve conter pelo menos um caractere especial (@$!%*?&)';
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
    // Chama o método de reset de senha do authStore
    const success = await authStore.resetPasswordWithCode(
      form.value.email,
      form.value.recoveryCode,
      form.value.newPassword
    );

    if (success) {
      // Mostra dialog de sucesso
      successDialog.value = true;
    }
  } catch (error) {
    // Erro já tratado no authStore
  } finally {
    isLoading.value = false;
  }
}

/**
 * Redireciona para o login
 */
function goToLogin() {
  router.push('/login');
}

// Preenche email se vier da query string
onMounted(() => {
  if (route.query.email) {
    form.value.email = route.query.email;
  }
});
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
</style>
