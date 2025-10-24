<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        
        <v-card class="elevation-12">
          
          <v-tabs v-model="tab" bg-color="primary" grow>
            <v-tab value="login">Login</v-tab>
            <v-tab value="register">Cadastro</v-tab>
          </v-tabs>

          <v-window v-model="tab">
            <v-window-item value="login">
              <v-card-text>
                <v-form @submit.prevent="handleLogin">
                  <v-text-field
                    label="Email"
                    v-model="loginEmail"
                    prepend-icon="mdi-account"
                    type="email"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="Senha"
                    v-model="loginPassword"
                    prepend-icon="mdi-lock"
                    type="password"
                    required
                  ></v-text-field>
                  <v-btn type="submit" color="primary" block>Entrar</v-btn>
                </v-form>
              </v-card-text>
            </v-window-item>

            <v-window-item value="register">
              <v-card-text>
                <v-form @submit.prevent="handleRegister">
                  <v-text-field
                    label="Nome"
                    v-model="registerName"
                    prepend-icon="mdi-account"
                    type="text"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="Email"
                    v-model="registerEmail"
                    prepend-icon="mdi-email"
                    type="email"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="Senha"
                    v-model="registerPassword"
                    prepend-icon="mdi-lock"
                    type="password"
                    required
                  ></v-text-field>
                  <v-btn type="submit" color="primary" block>Registrar</v-btn>
                </v-form>
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// O v-tabs usa 'tab' para controlar qual aba está ativa
const tab = ref('login'); // 'login' ou 'register'

// A lógica de dados permanece a mesma
const loginEmail = ref('');
const loginPassword = ref('');
const registerName = ref('');
const registerEmail = ref('');
const registerPassword = ref('');

const handleLogin = () => {
  authStore.login(loginEmail.value, loginPassword.value);
};

const handleRegister = () => {
  authStore.register(registerName.value, registerEmail.value, registerPassword.value);
  // Opcional: mudar para a aba de login após o registro
  tab.value = 'login';
};
</script>

<style scoped>
/* Nosso CSS customizado foi REDUZIDO A ZERO! */
/* O Vuetify cuida de todo o layout e estilo. */
.fill-height {
  min-height: 100vh;
}
</style>