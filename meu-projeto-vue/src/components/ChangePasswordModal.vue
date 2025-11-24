<template>
  <v-dialog :model-value="isOpen" @update:model-value="$emit('close')" max-width="500" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center pa-4 bg-warning">
        <div class="d-flex align-center">
          <v-icon icon="mdi-lock-reset" class="me-2"></v-icon>
          <span>Alterar Senha</span>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="handleClose"
          :disabled="isLoading"
        ></v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Por segurança, você será desconectado após alterar a senha e precisará fazer login novamente.
        </v-alert>

        <v-form ref="changePasswordForm" @submit.prevent="handleChangePassword">
          <!-- Senha Atual -->
          <v-text-field
            v-model="form.currentPassword"
            label="Senha Atual"
            :type="showCurrentPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
            :rules="[rules.required]"
            variant="outlined"
            class="mb-3"
            :disabled="isLoading"
          ></v-text-field>

          <!-- Nova Senha -->
          <v-text-field
            v-model="form.newPassword"
            label="Nova Senha"
            :type="showNewPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-plus"
            :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showNewPassword = !showNewPassword"
            :rules="[rules.required, rules.password, rules.differentPassword]"
            variant="outlined"
            class="mb-3"
            :disabled="isLoading"
          ></v-text-field>

          <!-- Confirmar Nova Senha -->
          <v-text-field
            v-model="form.confirmPassword"
            label="Confirmar Nova Senha"
            :type="showConfirmPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-check"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            :rules="[rules.required, rules.matchPassword]"
            variant="outlined"
            class="mb-4"
            :disabled="isLoading"
          ></v-text-field>

          <!-- Requisitos de Senha -->
          <v-expansion-panels class="mb-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon icon="mdi-information-outline" class="me-2" size="small"></v-icon>
                <span class="text-caption">Requisitos da Nova Senha</span>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <ul class="text-caption">
                  <li>Mínimo de 12 caracteres</li>
                  <li>Pelo menos uma letra maiúscula</li>
                  <li>Pelo menos uma letra minúscula</li>
                  <li>Pelo menos um número</li>
                  <li>Pelo menos um caractere especial (@$!%*?&)</li>
                  <li>Diferente da senha atual</li>
                </ul>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-btn
          color="grey"
          variant="text"
          @click="handleClose"
          :disabled="isLoading"
        >
          Cancelar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="warning"
          variant="elevated"
          @click="handleChangePassword"
          :loading="isLoading"
          :disabled="isLoading"
        >
          Alterar Senha
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

// Emits
const emit = defineEmits(['close']);

// Stores
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Refs do formulário
const changePasswordForm = ref(null);
const isLoading = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Dados do formulário
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Regras de validação
const rules = {
  required: (value) => !!value || 'Campo obrigatório',
  password: (value) => {
    if (!value) return 'Senha é obrigatória';
    if (value.length < 12) return 'Senha deve ter no mínimo 12 caracteres';
    if (!/(?=.*[a-z])/.test(value)) return 'Deve conter letra minúscula';
    if (!/(?=.*[A-Z])/.test(value)) return 'Deve conter letra maiúscula';
    if (!/(?=.*\d)/.test(value)) return 'Deve conter número';
    if (!/(?=.*[@$!%*?&])/.test(value)) return 'Deve conter caractere especial (@$!%*?&)';
    return true;
  },
  differentPassword: (value) => {
    return value !== form.value.currentPassword || 'Nova senha deve ser diferente da atual';
  },
  matchPassword: (value) => {
    return value === form.value.newPassword || 'As senhas não coincidem';
  }
};

/**
 * Manipula a alteração de senha
 */
async function handleChangePassword() {
  // Valida o formulário
  const { valid } = await changePasswordForm.value.validate();
  if (!valid) {
    notificationStore.warning('Por favor, corrija os erros no formulário.');
    return;
  }

  isLoading.value = true;

  try {
    // Chama o método de alteração de senha do authStore
    await authStore.changePassword(
      form.value.currentPassword,
      form.value.newPassword
    );

    // Fecha o modal
    handleClose();
  } catch (error) {
    // Erro já tratado no authStore
  } finally {
    isLoading.value = false;
  }
}

/**
 * Fecha o modal e reseta o formulário
 */
function handleClose() {
  form.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  changePasswordForm.value?.reset();
  emit('close');
}

// Reseta o formulário quando o modal é fechado
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    form.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    if (changePasswordForm.value) {
      changePasswordForm.value.reset();
    }
  }
});
</script>
