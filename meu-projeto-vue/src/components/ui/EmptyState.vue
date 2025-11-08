<template>
  <div class="empty-state text-center py-12">
    <v-icon :icon="icon" :size="iconSize" :color="iconColor" class="mb-4"></v-icon>
    <h3 class="text-h6 mb-2 text-medium-emphasis">{{ title }}</h3>
    <p v-if="description" class="text-body-2 text-disabled mb-4">
      {{ description }}
    </p>
    <slot name="action"></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: 'mdi-inbox',
  },
  iconSize: {
    type: [String, Number],
    default: 64,
  },
  iconColor: {
    type: String,
    default: 'grey-lighten-1',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.empty-state {
  max-width: 400px;
  margin: 0 auto;
}
</style>
