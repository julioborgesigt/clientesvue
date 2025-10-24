<template>
  <div id="search-container">
    <input
      type="text"
      id="searchInput"
      placeholder="Pesquisa por nome do cliente"
      v-model="searchQuery"
      @input="$emit('search', searchQuery)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Estado local para o campo de busca
const searchQuery = ref('');

// Define o evento que este componente pode emitir
defineEmits(['search']);
</script>