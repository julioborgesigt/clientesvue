<template>
  <div id="pagination-container">
    <button
      id="prevPageButton"
      class="btn btn-secondary"
      :disabled="currentPage === 1"
      @click="$emit('page-change', currentPage - 1)"
    >
      Anterior
    </button>
    
    <span id="pageInfo">{{ pageInfo }}</span>
    
    <button
      id="nextPageButton"
      class="btn btn-secondary"
      :disabled="currentPage >= totalPages"
      @click="$emit('page-change', currentPage + 1)"
    >
      Próxima
    </button>
  </div>
</template>

<script setup>
// Recebe os dados de paginação do DashboardView
defineProps({
  currentPage: Number,
  totalPages: Number,
  pageInfo: String,
});

// Define o evento que este componente pode emitir
defineEmits(['page-change']);
</script>