<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit" role="form" aria-label="Formulário de cadastro de cliente">
    <h4 class="text-subtitle-1 mb-2 mt-2" id="client-data-heading">Dados do Cliente</h4>
    <v-row no-gutters role="group" aria-labelledby="client-data-heading">
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
          aria-describedby="vencimento-hint"
        ></v-text-field>
        <span id="vencimento-hint" class="sr-only">Formato: DD/MM/AAAA</span>
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
          label="WhatsApp (ex: 55...)*"
          v-model="formData.whatsapp"
          :rules="[rules.required, rules.whatsappFormat]"
          prepend-inner-icon="mdi-whatsapp"
          density="compact"
          class="mb-4"
          variant="outlined"
          aria-label="Número de WhatsApp com código do país (obrigatório)"
          aria-required="true"
          aria-describedby="whatsapp-hint"
          type="tel"
          autocomplete="tel"
        ></v-text-field>
        <span id="whatsapp-hint" class="sr-only">Exemplo: +5511987654321</span>
      </v-col>
    </v-row>

    <h4 class="text-subtitle-1 mb-2" id="values-heading">Valores</h4>
    <v-row no-gutters role="group" aria-labelledby="values-heading">
      <v-col cols="12" sm="6" class="py-0 pe-sm-2">
        <v-text-field
          label="Valor Cobrado (R$)*"
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

    <h4 class="text-subtitle-1 mb-2" id="observations-heading">Observações</h4>
    <v-row no-gutters role="group" aria-labelledby="observations-heading">
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
      Salvar Cliente
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
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit']);

const theme = useTheme();
const formRef = ref(null);
const submitButtonColor = theme.global.current.value.dark ? 'grey-darken-1' : 'primary';

const defaultFormData = () => ({
  name: '',
  vencimento: new Date().toISOString().split('T')[0],
  servico: props.servicos.length > 0 ? props.servicos[0].nome : 'Serviço Padrão',
  whatsapp: '55',
  observacoes: '',
  valor_cobrado: 15.00,
  custo: 6.00,
});

const formData = ref(defaultFormData());

async function handleSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const sanitizedData = sanitizeClientData(formData.value);
  emit('submit', sanitizedData);
}

// Reset form when dialog opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    formData.value = defaultFormData();
  } else {
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

/* Screen-reader only class - visível apenas para leitores de tela */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
