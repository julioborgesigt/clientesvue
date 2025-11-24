<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <!-- Barra de formatação -->
    <div class="formatting-toolbar mb-2">
      <v-btn-group density="compact" variant="outlined" divided>
        <v-btn
          size="small"
          @click="applyFormat('bold')"
          title="Negrito (*texto*)"
          :prepend-icon="'mdi-format-bold'"
        >
          Negrito
        </v-btn>
        <v-btn
          size="small"
          @click="applyFormat('italic')"
          title="Itálico (_texto_)"
          :prepend-icon="'mdi-format-italic'"
        >
          Itálico
        </v-btn>
        <v-btn
          size="small"
          @click="applyFormat('strikethrough')"
          title="Tachado (~texto~)"
          :prepend-icon="'mdi-format-strikethrough'"
        >
          Tachado
        </v-btn>
        <v-btn
          size="small"
          @click="applyFormat('monospace')"
          title="Monoespaçado (```texto```)"
          :prepend-icon="'mdi-code-tags'"
        >
          Código
        </v-btn>
      </v-btn-group>
    </div>

    <v-textarea
      ref="textareaRef"
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

    <v-alert type="info" density="compact" class="mb-3">
      <small>Formatação WhatsApp: *negrito*, _itálico_, ~tachado~, ```código```</small>
    </v-alert>

    <v-btn type="submit" :color="submitButtonColor" block class="mt-2">
      Salvar Mensagem
    </v-btn>
  </v-form>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';
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
const textareaRef = ref(null);
const submitButtonColor = theme.global.current.value.dark ? 'grey-darken-1' : 'primary';

const message = ref('');

// Formatos do WhatsApp
const formatMap = {
  bold: { prefix: '*', suffix: '*' },
  italic: { prefix: '_', suffix: '_' },
  strikethrough: { prefix: '~', suffix: '~' },
  monospace: { prefix: '```', suffix: '```' },
};

// Aplica formatação ao texto selecionado ou na posição do cursor
async function applyFormat(formatType) {
  await nextTick();

  // Acessa o elemento textarea nativo do Vuetify
  const textarea = textareaRef.value?.$el?.querySelector('textarea');
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = message.value.substring(start, end);
  const format = formatMap[formatType];

  let newText;
  let cursorPosition;

  if (selectedText) {
    // Se há texto selecionado, envolve com a formatação
    newText =
      message.value.substring(0, start) +
      format.prefix +
      selectedText +
      format.suffix +
      message.value.substring(end);
    cursorPosition = end + format.prefix.length + format.suffix.length;
  } else {
    // Se não há seleção, insere os marcadores e posiciona o cursor entre eles
    newText =
      message.value.substring(0, start) +
      format.prefix +
      format.suffix +
      message.value.substring(end);
    cursorPosition = start + format.prefix.length;
  }

  message.value = newText;

  // Aguarda o DOM atualizar e reposiciona o cursor
  await nextTick();
  textarea.focus();
  textarea.setSelectionRange(cursorPosition, cursorPosition);
}

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

<style scoped>
.formatting-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.formatting-toolbar :deep(.v-btn) {
  text-transform: none;
}
</style>
