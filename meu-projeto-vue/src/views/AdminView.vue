<template>
  <v-app-bar color="primary" density="compact">
    <v-toolbar-title>Painel de Administração</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn icon="mdi-view-dashboard" @click="navigateToDashboard">
      <v-tooltip activator="parent" location="bottom">Voltar ao Dashboard</v-tooltip>
    </v-btn>

    <v-btn icon="mdi-logout" @click="handleLogout">
      <v-tooltip activator="parent" location="bottom">Sair</v-tooltip>
    </v-btn>
  </v-app-bar>

  <v-container fluid class="pa-4">
    <!-- Título e Descrição -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 mb-2">Administração do Sistema</h1>
        <p class="text-body-2 text-grey">
          Gerencie backups, monitore a saúde do sistema e configure parâmetros avançados.
        </p>
      </v-col>
    </v-row>

    <!-- Status do Sistema -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon icon="mdi-heart-pulse" class="me-2" color="error"></v-icon>
              <span>Status do Sistema</span>
            </div>
            <v-btn
              icon="mdi-refresh"
              variant="text"
              size="small"
              @click="refreshHealthStatus"
              :loading="isLoadingHealth"
            ></v-btn>
          </v-card-title>

          <v-card-text>
            <v-row v-if="healthStatus" dense>
              <v-col cols="12" sm="6" md="3">
                <v-list-item density="compact">
                  <v-list-item-title class="text-caption text-grey">
                    Status do Servidor
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="healthStatus.status === 'healthy' ? 'success' : 'error'"
                      size="small"
                      class="mt-1"
                    >
                      {{ healthStatus.status }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-list-item density="compact">
                  <v-list-item-title class="text-caption text-grey">
                    Uptime
                  </v-list-item-title>
                  <v-list-item-subtitle class="mt-1">
                    {{ healthStatus.uptime?.formatted || 'N/A' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-list-item density="compact">
                  <v-list-item-title class="text-caption text-grey">
                    Memória Usada
                  </v-list-item-title>
                  <v-list-item-subtitle class="mt-1">
                    {{ formatBytes(healthStatus.memory?.process?.heapUsed) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-list-item density="compact">
                  <v-list-item-title class="text-caption text-grey">
                    Banco de Dados
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="healthStatus.checks?.database?.status === 'healthy' ? 'success' : 'error'"
                      size="small"
                      class="mt-1"
                    >
                      {{ healthStatus.checks?.database?.status || 'unknown' }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
            </v-row>

            <v-alert v-else type="info" variant="tonal" class="mt-2">
              Clique em "Atualizar" para ver o status do sistema
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gerenciamento de Backups -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon icon="mdi-database" class="me-2" color="primary"></v-icon>
              <span>Gerenciamento de Backups</span>
              <v-chip size="small" class="ms-2" v-if="backupStore.backups.length > 0">
                {{ backupStore.backups.length }} {{ backupStore.backups.length === 1 ? 'backup' : 'backups' }}
              </v-chip>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                prepend-icon="mdi-plus"
                color="primary"
                @click="createBackup"
                :loading="backupStore.isCreating"
                size="small"
              >
                Criar Backup
              </v-btn>
              <v-btn
                icon="mdi-refresh"
                variant="text"
                size="small"
                @click="refreshBackups"
                :loading="backupStore.isLoading"
              ></v-btn>
            </div>
          </v-card-title>

          <v-card-subtitle v-if="backupStore.config" class="ps-4 pb-2">
            <v-icon icon="mdi-information-outline" size="16" class="me-1"></v-icon>
            Backups automáticos {{ backupStore.config.enabled ? 'ativados' : 'desativados' }}
            •
            Retenção: {{ backupStore.config.retention || 'N/A' }} dias
            •
            Total: {{ backupStore.totalSizeFormatted }}
          </v-card-subtitle>

          <v-card-text class="pa-4 pt-2">
            <!-- Loading State -->
            <v-progress-linear
              v-if="backupStore.isLoading"
              indeterminate
              color="primary"
            ></v-progress-linear>

            <!-- Empty State -->
            <v-alert
              v-if="!backupStore.isLoading && backupStore.backups.length === 0"
              type="info"
              variant="tonal"
              class="mt-2"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-information-outline"></v-icon>
              </template>
              Nenhum backup disponível. Crie um backup manual ou aguarde o backup automático.
            </v-alert>

            <!-- Backups Table -->
            <v-data-table
              v-if="!backupStore.isLoading && backupStore.backups.length > 0"
              :headers="backupHeaders"
              :items="backupStore.backups"
              :items-per-page="10"
              class="elevation-1 mt-2"
              density="compact"
            >
              <template v-slot:item.filename="{ item }">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <span v-bind="props" class="text-truncate d-inline-block" style="max-width: 300px;">
                      {{ item.filename }}
                    </span>
                  </template>
                  {{ item.filename }}
                </v-tooltip>
              </template>

              <template v-slot:item.size="{ item }">
                {{ formatBytes(item.size) }}
              </template>

              <template v-slot:item.created="{ item }">
                {{ formatDate(item.created) }}
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon="mdi-download"
                  variant="text"
                  size="small"
                  @click="downloadBackup(item.filename)"
                  color="primary"
                >
                  <v-tooltip activator="parent" location="top">Download</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  @click="confirmDelete(item)"
                  color="error"
                >
                  <v-tooltip activator="parent" location="top">Excluir</v-tooltip>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Dialog de Confirmação de Exclusão -->
  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">
        <v-icon icon="mdi-alert" color="warning" class="me-2"></v-icon>
        Confirmar Exclusão
      </v-card-title>
      <v-card-text>
        Deseja realmente excluir o backup <strong>{{ backupToDelete?.filename }}</strong>?
        <br><br>
        <v-alert type="warning" density="compact" variant="tonal">
          Esta ação não pode ser desfeita!
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="deleteDialog = false">
          Cancelar
        </v-btn>
        <v-btn color="error" variant="elevated" @click="deleteBackup">
          Excluir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBackupStore } from '@/stores/backupStore';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/api/axios';
import { useNotificationStore } from '@/stores/notificationStore';

const router = useRouter();
const backupStore = useBackupStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Estados
const healthStatus = ref(null);
const isLoadingHealth = ref(false);
const deleteDialog = ref(false);
const backupToDelete = ref(null);

// Headers da tabela de backups
const backupHeaders = [
  { title: 'Nome do Arquivo', key: 'filename', sortable: true },
  { title: 'Tamanho', key: 'size', sortable: true },
  { title: 'Data de Criação', key: 'created', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false, align: 'center' }
];

/**
 * Formata bytes para formato legível
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formata data para exibição
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  } catch {
    return dateString;
  }
}

/**
 * Busca status de saúde do sistema
 */
async function refreshHealthStatus() {
  isLoadingHealth.value = true;
  try {
    const response = await apiClient.get('/health/detailed');
    healthStatus.value = response.data;
  } catch (error) {
    notificationStore.error('Erro ao buscar status do sistema.');
    healthStatus.value = null;
  } finally {
    isLoadingHealth.value = false;
  }
}

/**
 * Atualiza lista de backups
 */
async function refreshBackups() {
  await backupStore.fetchBackups();
  await backupStore.fetchBackupConfig();
}

/**
 * Cria novo backup
 */
async function createBackup() {
  await backupStore.createBackup();
}

/**
 * Faz download de um backup
 */
async function downloadBackup(filename) {
  await backupStore.downloadBackup(filename);
}

/**
 * Abre dialog de confirmação de exclusão
 */
function confirmDelete(backup) {
  backupToDelete.value = backup;
  deleteDialog.value = true;
}

/**
 * Exclui backup após confirmação
 */
async function deleteBackup() {
  if (backupToDelete.value) {
    const success = await backupStore.deleteBackup(backupToDelete.value.filename);
    if (success) {
      deleteDialog.value = false;
      backupToDelete.value = null;
    }
  }
}

/**
 * Navega de volta ao dashboard
 */
function navigateToDashboard() {
  router.push('/dashboard');
}

/**
 * Faz logout
 */
function handleLogout() {
  authStore.logout();
  router.push('/login');
}

// Carrega dados ao montar
onMounted(async () => {
  await Promise.all([
    backupStore.fetchBackups(),
    backupStore.fetchBackupConfig(),
    refreshHealthStatus()
  ]);

  // Auto-refresh do health status a cada 30 segundos
  setInterval(refreshHealthStatus, 30000);
});
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
