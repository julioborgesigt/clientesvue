<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500px"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon
          v-if="icon"
          :icon="icon"
          :color="iconColor"
          class="me-3"
          size="28"
        ></v-icon>
        <span>{{ title }}</span>
      </v-card-title>

      <v-card-text class="pt-4">
        <p class="text-body-1">{{ message }}</p>
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
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          variant="flat"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
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

function handleConfirm() {
  emit('confirm');
  emit('update:modelValue', false);
}

function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>
