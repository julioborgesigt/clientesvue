<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit" role="form" aria-label="Formulário de edição de cliente">
    <h4 class="text-subtitle-1 mb-2 mt-2" id="edit-client-data-heading">Dados do Cliente</h4>
    <v-row no-gutters role="group" aria-labelledby="edit-client-data-heading">
      <v-col cols="12" class="py-0">
        <v-text-field
          label="Nome*"
          v-model="formData.name"
          :rules="[rules.required, rules.nameValid]"
          density="compact"
          prepend-inner-icon="mdi-account"
          class="mb-2"
          variant="outlined"
          aria-label="Nome completo do cliente (obrigatório)"
          aria-required="true"
          autocomplete="name"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" class="py-0 pe-sm-2">
        <v-text-field
          label="Vencimento*"
          v-model="formData.vencimento"
          type="date"
          :rules="[rules.required, rules.dateValid]"
          density="compact"
          prepend-inner-icon="mdi-calendar-month"
          class="mb-2"
          variant="outlined"
          aria-label="Data de vencimento da assinatura (obrigatório)"
          aria-required="true"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" class="py-0 ps-sm-0">
        <v-select
          label="Serviço"
          v-model="formData.servico"
          :items="servicos"
          item-title="nome"
          item-value="nome"
          density="compact"
          prepend-inner-icon="mdi-briefcase-outline"
          class="mb-2"
          variant="outlined"
          aria-label="Tipo de serviço contratado"
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" class="py-0">
        <v-text-field
          label="WhatsApp"
          v-model="formData.whatsapp"
          :rules="[rules.whatsappFormat]"
          prepend-inner-icon="mdi-whatsapp"
          density="compact"
          class="mb-4"
          variant="outlined"
          aria-label="Número de WhatsApp com código do país"
          type="tel"
          autocomplete="tel"
        ></v-text-field>
      </v-col>
    </v-row>

    <h4 class="text-subtitle-1 mb-2" id="edit-values-heading">Valores</h4>
    <v-row no-gutters role="group" aria-labelledby="edit-values-heading">
      <v-col cols="12" sm="6" class="py-0 pe-sm-2">
        <v-text-field
          label="Valor (R$)*"
          v-model.number="formData.valor_cobrado"
          :rules="[rules.required, rules.positiveNumber]"
          type="number"
          prefix="R$"
          density="compact"
          prepend-inner-icon="mdi-currency-usd"
          class="mb-2"
          variant="outlined"
          aria-label="Valor cobrado do cliente em reais (obrigatório)"
          aria-required="true"
          inputmode="decimal"
          step="0.01"
          min="0"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" class="py-0 ps-sm-0">
        <v-text-field
          label="Custo (R$)*"
          v-model.number="formData.custo"
          :rules="[rules.required, rules.positiveNumber]"
          type="number"
          prefix="R$"
          density="compact"
          prepend-inner-icon="mdi-hand-coin-outline"
          class="mb-4"
          variant="outlined"
          aria-label="Custo operacional em reais (obrigatório)"
          aria-required="true"
          inputmode="decimal"
          step="0.01"
          min="0"
        ></v-text-field>
      </v-col>
    </v-row>

    <h4 class="text-subtitle-1 mb-2" id="edit-observations-heading">Observações</h4>
    <v-row no-gutters role="group" aria-labelledby="edit-observations-heading">
      <v-col cols="12" class="py-0">
        <v-textarea
          label="Observações"
          v-model="formData.observacoes"
          :rules="[rules.observacoesValid]"
          rows="2"
          density="compact"
          prepend-inner-icon="mdi-comment-text-outline"
          class="mb-4"
          variant="outlined"
          counter="500"
          aria-label="Observações adicionais sobre o cliente (opcional)"
          maxlength="500"
        ></v-textarea>
      </v-col>
    </v-row>
    <v-btn type="submit" :color="submitButtonColor" block class="mt-2">
      Salvar Alterações
    </v-btn>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTheme } from 'vuetify';
import { rules } from '@/utils/validators';
import { sanitizeClientData } from '@/utils/sanitize';

const props = defineProps({
  servicos: {
    type: Array,
    default: () => [],
  },
  clientData: {
    type: Object,
    default: null,
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

const formData = ref({
  id: null,
  name: '',
  vencimento: '',
  servico: '',
  whatsapp: '',
  valor_cobrado: 0,
  custo: 0,
  observacoes: '',
});

async function handleSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  if (!formData.value || !formData.value.id) return;

  const sanitizedData = sanitizeClientData(formData.value);
  emit('submit', formData.value.id, sanitizedData);
}

// Populate form when clientData changes
watch(() => props.clientData, (newData) => {
  if (newData && props.isOpen) {
    // Validar formato antes de fazer split
    const vencimento = newData.vencimento?.includes('T')
      ? newData.vencimento.split('T')[0]
      : newData.vencimento || '';
    formData.value = { ...newData, vencimento };
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
:deep(.v-input__details) {
  padding-bottom: 4px !important;
}
</style>
