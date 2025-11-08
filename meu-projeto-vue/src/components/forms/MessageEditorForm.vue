<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-textarea
      :label="label"
      v-model="message"
      :rules="[rules.required]"
      rows="5"
      auto-grow
      density="compact"
      :prepend-inner-icon="icon"
      class="mb-4"
      variant="outlined"
    ></v-textarea>
    <v-btn type="submit" :color="submitButtonColor" block class="mt-2">
      Salvar Mensagem
    </v-btn>
  </v-form>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useTheme } from 'vuetify';
import { rules } from '@/utils/validators';

const props = defineProps({
  messageType: {
    type: String,
    default: 'default', // 'default' ou 'vencido'
  },
  initialMessage: {
    type: String,
    default: '',
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit']);

const theme = useTheme();
const formRef = ref(null);
const submitButtonColor = theme.global.current.value.dark ? 'grey-darken-1' : 'primary';

const message = ref('');

const label = computed(() => {
  return props.messageType === 'vencido'
    ? 'Mensagem para clientes (VENCIDOS)*'
    : 'Mensagem para clientes (a vencer)*';
});

const icon = computed(() => {
  return props.messageType === 'vencido'
    ? 'mdi-message-alert-outline'
    : 'mdi-message-text-outline';
});

async function handleSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  emit('submit', message.value, props.messageType);
}

// Load initial message when dialog opens
watch(() => props.initialMessage, (newVal) => {
  if (newVal && props.isOpen) {
    message.value = newVal;
  }
}, { immediate: true });

// Reset validation when dialog closes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    formRef.value?.resetValidation();
  }
});

defineExpose({
  resetValidation: () => formRef.value?.resetValidation(),
});
</script>
