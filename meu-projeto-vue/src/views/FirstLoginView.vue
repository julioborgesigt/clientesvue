<template>
  <v-container fluid class="fill-height auth-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <!-- Cartão de Primeiro Login -->
        <v-card elevation="8" class="auth-card">
          <v-card-title class="text-h5 text-center pa-4 bg-primary">
            <v-icon icon="mdi-shield-key" class="me-2"></v-icon>
            Primeiro Login
          </v-card-title>

          <v-card-text class="pa-6">
            <v-alert type="info" variant="tonal" class="mb-4">
              <template v-slot:prepend>
                <v-icon icon="mdi-information"></v-icon>
              </template>
              <strong>Primeira vez no sistema?</strong><br>
              Para concluir seu registro, você precisa fornecer o código de recuperação que foi mostrado após o cadastro.
            </v-alert>

            <v-form ref="firstLoginForm" @submit.prevent="handleFirstLogin">
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
                :rules="[rules.required]"
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
                class="mb-4"
                :disabled="isLoading"
                placeholder="A1B2-C3D4-E5F6-G7H8"
              ></v-text-field>

              <!-- Botão de Primeiro Login -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="isLoading"
                :disabled="isLoading"
                class="mb-4"
              >
                Confirmar e Entrar
              </v-btn>

              <!-- Links -->
              <div class="text-center">
                <v-btn
                  variant="text"
                  color="grey"
                  size="small"
                  @click="goToLogin"
                  :disabled="isLoading"
                  class="me-2"
                >
                  Voltar ao Login
                </v-btn>
                <v-btn
                  variant="text"
                  color="error"
                  size="small"
                  @click="goToForgotPassword"
                  :disabled="isLoading"
                >
                  Esqueci meu código
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Card de Ajuda -->
        <v-card elevation="4" class="mt-4">
          <v-card-title class="text-subtitle-1">
            <v-icon icon="mdi-help-circle" class="me-2" color="info"></v-icon>
            Precisa de Ajuda?
          </v-card-title>
          <v-card-text>
            <ul class="text-caption">
              <li>O código de recuperação foi mostrado após seu cadastro</li>
              <li>Ele tem o formato: XXXX-XXXX-XXXX-XXXX</li>
              <li>Se perdeu o código, entre em contato com o administrador do sistema</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
    // Formato esperado: XXXX-XXXX-XXXX-XXXX
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
    // Chama o método de primeiro login do authStore
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
 * Redireciona para o login normal
 */
function goToLogin() {
  router.push('/login');
}

/**
 * Redireciona para recuperação de senha
 */
function goToForgotPassword() {
  router.push({
    name: 'ForgotPassword',
    query: { email: form.value.email }
  });
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
