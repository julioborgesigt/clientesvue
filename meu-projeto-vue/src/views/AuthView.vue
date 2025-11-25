<template>
  <v-container fluid class="fill-height auth-background">
    <v-row align="center" justify="center" class="fill-height fill-width ma-0">
      <v-col cols="12" sm="7" md="5" lg="4" xl="3" class="auth-col">

        <!-- Logo Responsiva -->
        <div class="text-center logo-container">
          <v-img
            src="https://domcloud.co/img/logo.png"
            :max-height="$vuetify.display.xs ? 60 : 80"
            contain
            class="logo-image"
          ></v-img>
        </div>

        <!-- Container Unificado com Transição -->
        <transition name="fade-slide" mode="out-in">
          <v-card :key="currentRoute" class="frosted-glass-card auth-card">
            <!-- Renderiza o componente filho da rota -->
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </v-card>
        </transition>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Detecta qual rota está ativa para animações
const currentRoute = computed(() => route.name);
</script>

<style scoped>
/* 1. Fundo da Página com Imagem */
.auth-background {
  background-image: url('https://images.unsplash.com/photo-1520995075477-7fddc4fc8cd6?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;
  position: relative;
  min-height: 100vh;
  padding: 16px;
}

/* Mobile - Fundo fixo causa problemas no iOS */
@media (max-width: 599px) {
  .auth-background {
    background-attachment: scroll;
    padding: 8px;
  }
}

/* Garante que o conteúdo fique na frente da imagem */
.fill-width {
  width: 100%;
  z-index: 1;
}

/* Coluna de autenticação */
.auth-col {
  max-width: 100%;
  padding: 0;
}

/* Logo Container */
.logo-container {
  margin-bottom: 24px;
  animation: fadeInDown 0.6s ease-out;
}

@media (max-width: 599px) {
  .logo-container {
    margin-bottom: 16px;
  }
}

.logo-image {
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

/* 2. Card "Frosted Glass" (Estilo Light) - Responsivo */
.frosted-glass-card.v-card {
  background: rgba(255, 255, 255, 0.45) !important;
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border-radius: 20px !important;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
  overflow: hidden;
}

.auth-card {
  padding: 32px 28px;
  animation: fadeInUp 0.6s ease-out;
}

/* Mobile - Padding reduzido */
@media (max-width: 599px) {
  .frosted-glass-card.v-card {
    border-radius: 16px !important;
    border-width: 1.5px;
  }

  .auth-card {
    padding: 20px 16px;
  }
}

/* Tablet */
@media (min-width: 600px) and (max-width: 959px) {
  .auth-card {
    padding: 28px 24px;
  }
}

/* 3. Correção do Autofill - Melhorado */
.frosted-glass-card .v-text-field input:-webkit-autofill,
.frosted-glass-card .v-text-field input:-webkit-autofill:hover,
.frosted-glass-card .v-text-field input:-webkit-autofill:focus,
.frosted-glass-card .v-text-field input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.8) inset !important;
  -webkit-text-fill-color: #2c3e50 !important;
  caret-color: #FF9800 !important;
  transition: background-color 5000s ease-in-out 0s;
  border-radius: 8px;
}

.frosted-glass-card .v-text-field .v-field__overlay {
  background-color: transparent !important;
}

.frosted-glass-card .v-text-field .v-input__control .v-field {
  background-color: rgba(255, 255, 255, 0.4) !important;
  border-radius: 12px !important;
  border: 1.5px solid rgba(255, 152, 0, 0.3);
  transition: all 0.3s ease;
}

.frosted-glass-card .v-text-field .v-input__control .v-field:hover {
  background-color: rgba(255, 255, 255, 0.5) !important;
  border-color: rgba(255, 152, 0, 0.5);
}

.frosted-glass-card .v-text-field .v-input__control .v-field--focused {
  background-color: rgba(255, 255, 255, 0.6) !important;
  border-color: #FF9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.2);
}

/* 4. Transições Suaves */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 5. Animações de Entrada */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 6. Scroll Suave no Mobile */
@media (max-width: 599px) {
  .auth-background {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* 7. Ajustes para telas muito pequenas */
@media (max-width: 360px) {
  .auth-card {
    padding: 16px 12px;
  }

  .frosted-glass-card.v-card {
    border-radius: 12px !important;
  }
}
</style>
