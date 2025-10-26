<template>
  <v-app>
    <v-main>
      <RouterView />
    </v-main>

    <v-snackbar
      v-model="notificationStore.visible"
      :color="notificationStore.color"
      :timeout="notificationStore.timeout"
      location="top right" 
      multi-line
    >
      {{ notificationStore.text }}
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="notificationStore.hide()"
        ></v-btn>
      </template>
    </v-snackbar>
    </v-app>
</template>

<script setup>
import { RouterView } from 'vue-router'
// 1. Importar a store
import { useNotificationStore } from '@/stores/notificationStore'; 

// 2. Instanciar a store
const notificationStore = useNotificationStore(); 
</script>

<style>
/* ... */
</style>