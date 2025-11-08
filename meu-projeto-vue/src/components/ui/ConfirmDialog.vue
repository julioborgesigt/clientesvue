<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500px"
    persistent
    role="alertdialog"
    :aria-labelledby="titleId"
    :aria-describedby="messageId"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon
          v-if="icon"
          :icon="icon"
          :color="iconColor"
          class="me-3"
          size="28"
          aria-hidden="true"
        ></v-icon>
        <span :id="titleId">{{ title }}</span>
      </v-card-title>

      <v-card-text class="pt-4">
        <p :id="messageId" class="text-body-1">{{ message }}</p>
        <p v-if="details" class="text-body-2 text-disabled mt-2">
          {{ details }}
        </p>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn
          :color="cancelColor"
          variant="text"
          @click="handleCancel"
          :aria-label="`${cancelText} e fechar diálogo`"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          variant="flat"
          @click="handleConfirm"
          :aria-label="`${confirmText} ação`"
          ref="confirmBtn"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirmar ação',
  },
  message: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'mdi-help-circle-outline',
  },
  iconColor: {
    type: String,
    default: 'warning',
  },
  confirmText: {
    type: String,
    default: 'Confirmar',
  },
  cancelText: {
    type: String,
    default: 'Cancelar',
  },
  confirmColor: {
    type: String,
    default: 'error',
  },
  cancelColor: {
    type: String,
    default: 'grey-darken-1',
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

// Generate unique IDs for accessibility
const titleId = computed(() => `confirm-dialog-title-${Math.random().toString(36).substr(2, 9)}`);
const messageId = computed(() => `confirm-dialog-message-${Math.random().toString(36).substr(2, 9)}`);

const confirmBtn = ref(null);

function handleConfirm() {
  emit('confirm');
  emit('update:modelValue', false);
}

function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}

// Auto-focus confirm button when dialog opens (accessibility)
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    nextTick(() => {
      confirmBtn.value?.$el?.focus();
    });
  }
});
</script>
