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
/**
 * @fileoverview Componente de diálogo de confirmação reutilizável
 * @description Modal acessível para confirmações de ações críticas (excluir, sair, etc)
 * @component ConfirmDialog
 *
 * @prop {boolean} modelValue - Controla visibilidade do diálogo (v-model)
 * @prop {string} title - Título do diálogo
 * @prop {string} message - Mensagem principal (obrigatório)
 * @prop {string} [details=''] - Texto de detalhes/aviso adicional
 * @prop {string} [icon='mdi-help-circle-outline'] - Ícone Material Design Icons
 * @prop {string} [iconColor='warning'] - Cor do ícone Vuetify
 * @prop {string} [confirmText='Confirmar'] - Texto do botão de confirmação
 * @prop {string} [cancelText='Cancelar'] - Texto do botão de cancelar
 * @prop {string} [confirmColor='error'] - Cor do botão de confirmação
 * @prop {string} [cancelColor='grey-darken-1'] - Cor do botão de cancelar
 *
 * @emits update:modelValue - Emitido para fechar o diálogo (v-model)
 * @emits confirm - Emitido quando usuário confirma a ação
 * @emits cancel - Emitido quando usuário cancela
 *
 * @accessibility
 * - role="alertdialog" para leitores de tela
 * - aria-labelledby e aria-describedby para semântica
 * - Auto-focus no botão de confirmação ao abrir
 * - IDs únicos gerados para cada instância
 *
 * @example
 * <ConfirmDialog
 *   v-model="deleteDialog"
 *   title="Excluir Cliente"
 *   message="Tem certeza que deseja excluir?"
 *   details="Esta ação não pode ser desfeita."
 *   icon="mdi-delete-alert-outline"
 *   icon-color="error"
 *   @confirm="handleDelete"
 * />
 */

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

/**
 * Emite eventos do diálogo
 * @fires update:modelValue - Para v-model (fechar diálogo)
 * @fires confirm - Quando usuário confirma
 * @fires cancel - Quando usuário cancela
 */
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

/**
 * ID único para o título (acessibilidade)
 * @type {import('vue').ComputedRef<string>}
 */
const titleId = computed(() => `confirm-dialog-title-${Math.random().toString(36).substr(2, 9)}`);

/**
 * ID único para a mensagem (acessibilidade)
 * @type {import('vue').ComputedRef<string>}
 */
const messageId = computed(() => `confirm-dialog-message-${Math.random().toString(36).substr(2, 9)}`);

/** @type {import('vue').Ref<HTMLElement|null>} Referência ao botão de confirmação para auto-focus */
const confirmBtn = ref(null);

/**
 * Handler de confirmação
 * Emite evento 'confirm' e fecha o diálogo
 * @returns {void}
 */
function handleConfirm() {
  emit('confirm');
  emit('update:modelValue', false);
}

/**
 * Handler de cancelamento
 * Emite evento 'cancel' e fecha o diálogo
 * @returns {void}
 */
function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}

/**
 * Watcher para auto-focus no botão de confirmação quando diálogo abre
 * Melhora acessibilidade para navegação por teclado
 * @param {boolean} newVal - Novo valor de modelValue
 */
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    nextTick(() => {
      confirmBtn.value?.$el?.focus();
    });
  }
});
</script>
