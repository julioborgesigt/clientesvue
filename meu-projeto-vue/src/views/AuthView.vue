<template>
  <v-container fluid class="fill-height pa-4 auth-background">
    <v-row align="center" justify="center" class="fill-height fill-width ma-0">
      <v-col cols="11" sm="8" md="6" lg="5" xl="4">

        <!-- Logo -->
        <div class="text-center mb-6">
          <v-img
            src="https://domcloud.co/img/logo.png"
            max-height="80"
            contain
          ></v-img>
        </div>

        <!-- Container Unificado com Transição -->
        <transition name="fade-slide" mode="out-in">
          <v-card :key="currentRoute" class="frosted-glass-card pa-4">
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
  position: relative;
  min-height: 100vh;
}

/* Garante que o conteúdo fique na frente da imagem */
.fill-width {
  width: 100%;
  z-index: 1;
}

/* 2. Card "Frosted Glass" (Estilo Light) */
.frosted-glass-card.v-card {
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(8px) saturate(150%);
  -webkit-backdrop-filter: blur(8px) saturate(150%);
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
}

/* 3. Correção do Autofill */
.frosted-glass-card .v-text-field input:-webkit-autofill,
.frosted-glass-card .v-text-field input:-webkit-autofill:hover,
.frosted-glass-card .v-text-field input:-webkit-autofill:focus,
.frosted-glass-card .v-text-field input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.7) inset !important;
  -webkit-text-fill-color: #333 !important;
  caret-color: #333 !important;
  transition: background-color 5000s ease-in-out 0s;
}

.frosted-glass-card .v-text-field .v-field__overlay {
  background-color: transparent !important;
}

.frosted-glass-card .v-text-field .v-input__control .v-field {
  background-color: rgba(255, 255, 255, 0.3) !important;
}

/* 4. Transições Suaves */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
