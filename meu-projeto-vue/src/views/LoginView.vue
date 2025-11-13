<template>
  <v-container fluid class="fill-height pa-4 login-background">
    
    <v-row align="center" justify="center" class="fill-height fill-width ma-0">

      <v-col cols="11" sm="8" md="6" lg="4" xl="3">

        <!-- Aviso de Modo Anônimo/Privado -->
        <v-alert
          v-if="isPrivateMode && !dismissedPrivateWarning"
          type="warning"
          variant="tonal"
          prominent
          closable
          class="mb-4"
          @click:close="dismissedPrivateWarning = true"
        >
          <v-alert-title class="d-flex align-center">
            <v-icon icon="mdi-incognito" class="me-2"></v-icon>
            Modo Anônimo Detectado
          </v-alert-title>
          <div class="text-body-2 mt-2">
            O login pode não funcionar em modo privado/anônimo devido a restrições de cookies de segurança.
            <strong>Se tiver problemas, use uma guia normal.</strong>
          </div>
        </v-alert>

        <div class="text-center mb-6">
          <v-img
            src="https://domcloud.co/img/logo.png"
            max-height="80"
            contain
          ></v-img>
        </div>

        <v-card class="frosted-glass-card pa-4">

          <v-card-title class="text-center text-h5 font-weight-medium pb-6">
            {{ cardTitle }} </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="handleLogin" v-if="mode === 'login'">
              <v-text-field
                label="Email"
                v-model="loginEmail"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                type="email"
                required
                class="mb-3"
                density="compact"
              ></v-text-field>
              <v-text-field
                label="Senha"
                v-model="loginPassword"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                :type="showPassword ? 'text' : 'password'"
                required
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                density="compact"
              ></v-text-field>
              <v-btn type="submit" color="primary" block size="large" class="mt-4 mb-4">
                Entrar
              </v-btn>
              
              <div class="text-center mb-4">
                <a href="#" class="text-caption text-decoration-none text-white">
                  Esqueceu a senha?
                </a>
              </div>
            </v-form>

            <v-form @submit.prevent="handleRegister" v-if="mode === 'register'">
              <v-text-field label="Nome" v-model="registerName" prepend-inner-icon="mdi-account-outline" variant="outlined" required class="mb-3" density="compact"></v-text-field>
              <v-text-field label="Email" v-model="registerEmail" prepend-inner-icon="mdi-email-outline" variant="outlined" type="email" required class="mb-3" density="compact"></v-text-field>
              <v-text-field label="Senha" v-model="registerPassword" prepend-inner-icon="mdi-lock-outline" variant="outlined" type="password" required density="compact"></v-text-field>
              <v-btn type="submit" color="primary" block size="large" class="mt-4">
                Registrar
              </v-btn>
            </v-form>

            <v-divider class="my-4">Ou</v-divider>

            <v-btn 
              v-if="mode === 'login'"
              prepend-icon="mdi-email-outline" 
              variant="outlined" 
              block 
              class="mb-3"
              @click="switchToRegister"
            >
              Registrar com Email
            </v-btn>
             <v-btn 
              v-if="mode === 'register'"
              prepend-icon="mdi-arrow-left" 
              variant="outlined" 
              block 
              class="mb-3"
              @click="switchToLogin"
            >
              Voltar para Login
            </v-btn>

       

          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// --- DETECÇÃO DE MODO PRIVADO/ANÔNIMO ---
const isPrivateMode = ref(false);
const dismissedPrivateWarning = ref(false);

onMounted(() => {
  // Método 1: Storage API
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(estimate => {
      // Em modo privado, quota é muito baixa (< 120 MB)
      if (estimate.quota < 120000000) {
        isPrivateMode.value = true;
      }
    }).catch(() => {
      // Erro ao acessar storage = provavelmente modo privado
      isPrivateMode.value = true;
    });
  }

  // Método 2: IndexedDB (fallback)
  try {
    const openRequest = indexedDB.open('test');
    openRequest.onerror = () => {
      isPrivateMode.value = true;
    };
  } catch {
    isPrivateMode.value = true;
  }
});
// --- FIM DA DETECÇÃO DE MODO PRIVADO ---

// --- LÓGICA PARA ALTERNAR ENTRE LOGIN E REGISTRO ---
const mode = ref('login'); // 'login' ou 'register'
const cardTitle = computed(() => mode.value === 'login' ? 'Entre no Portal' : 'Registre-se');

const switchToRegister = () => mode.value = 'register';
const switchToLogin = () => mode.value = 'login';
// --- FIM DA LÓGICA DE ALTERNÂNCIA ---


// --- DADOS DOS FORMULÁRIOS E FUNÇÕES (Iguais) ---
const loginEmail = ref('');
const loginPassword = ref('');
const showPassword = ref(false); // Para o botão de mostrar/ocultar senha
const registerName = ref('');
const registerEmail = ref('');
const registerPassword = ref('');

const handleLogin = () => {
  authStore.login(loginEmail.value, loginPassword.value);
};

const handleRegister = () => {
  authStore.register(registerName.value, registerEmail.value, registerPassword.value);
  // Após registrar, volta para a tela de login
  switchToLogin(); 
};
</script>

<style scoped>
/* 1. O Fundo da Página com Imagem */
.login-background {
  /* Substitua pela URL da sua imagem de fundo */
  background-image: url('https://images.unsplash.com/photo-1520995075477-7fddc4fc8cd6?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) center/cover #004494; position: relative'); 
  background-size: cover;
  background-position: center center;
  position: relative; /* Necessário para o z-index do conteúdo */
}

/* Garante que o conteúdo fique na frente da imagem */
.fill-width {
  width: 100%;
  z-index: 1; 
}

/* 2. O Card "Frosted Glass" (Estilo Light) */
.frosted-glass-card.v-card {
  /* Transparência Branca */
  background: rgba(255, 255, 255, 0.4) !important; /* Aumentei um pouco a opacidade */
  
  /* Blur */
  backdrop-filter: blur(8px) saturate(150%); /* Diminui um pouco o blur */
  -webkit-backdrop-filter: blur(8px) saturate(150%);
  
  /* Bordas mais arredondadas e borda sutil */
  border-radius: 16px !important; /* Aumentei o raio */
  border: 1px solid rgba(255, 255, 255, 0.2); /* Borda branca mais sutil */
  
  /* Sombra mais suave */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important; 
}

/* 3. Correção do Autofill (Ajustada para o fundo mais claro) */
.frosted-glass-card .v-text-field input:-webkit-autofill,
.frosted-glass-card .v-text-field input:-webkit-autofill:hover,
.frosted-glass-card .v-text-field input:-webkit-autofill:focus,
.frosted-glass-card .v-text-field input:-webkit-autofill:active {
  /* Fundo branco ainda mais sutil */
  -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.7) inset !important; 
  -webkit-text-fill-color: #333 !important; /* Texto um pouco mais escuro */
  caret-color: #333 !important; 
  transition: background-color 5000s ease-in-out 0s;
}

.frosted-glass-card .v-text-field .v-field__overlay {
  background-color: transparent !important;
}
.frosted-glass-card .v-text-field .v-input__control .v-field {
   background-color: rgba(255, 255, 255, 0.3) !important; /* Fundo do campo um pouco mais opaco */
}
</style>