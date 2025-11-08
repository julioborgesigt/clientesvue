/**
 * @file notificationStore.js
 * @description Store Pinia para gerenciamento de notificações toast/snackbar
 * Controla exibição de mensagens de sucesso, erro, aviso e informação
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Store de Notificações usando Composition API
 * Gerencia snackbars/toasts para feedback visual ao usuário
 * @returns {Object} Store de notificações com state e actions
 */
export const useNotificationStore = defineStore('notification', () => {
  // --- State ---
  /** @type {import('vue').Ref<boolean>} Controla visibilidade da notificação */
  const visible = ref(false);

  /** @type {import('vue').Ref<string>} Texto da mensagem a exibir */
  const text = ref('');

  /** @type {import('vue').Ref<'success'|'error'|'warning'|'info'>} Cor/tipo da notificação */
  const color = ref('success');

  /** @type {import('vue').Ref<number>} Tempo em ms antes da notificação fechar automaticamente */
  const timeout = ref(3000);

  /**
   * Exibe uma notificação genérica
   * @param {string} message - Mensagem a ser exibida
   * @param {'success'|'error'|'warning'|'info'} [notificationColor='success'] - Tipo/cor da notificação
   * @param {number} [notificationTimeout=3000] - Tempo em ms antes de fechar automaticamente
   * @returns {void}
   * @example
   * notificationStore.show('Operação realizada', 'info', 5000)
   */
  function show(message, notificationColor = 'success', notificationTimeout = 3000) {
    text.value = message;
    color.value = notificationColor;
    timeout.value = notificationTimeout;
    visible.value = true; 
  }

  /**
   * Exibe uma notificação de sucesso (verde)
   * @param {string} message - Mensagem de sucesso
   * @param {number} [notificationTimeout=3000] - Tempo em ms antes de fechar
   * @returns {void}
   * @example
   * notificationStore.success('Cliente salvo com sucesso!')
   */
  function success(message, notificationTimeout = 3000) {
    show(message, 'success', notificationTimeout);
  }

  /**
   * Exibe uma notificação de erro (vermelha)
   * Erros ficam visíveis por 4 segundos (mais que sucesso)
   * @param {string} message - Mensagem de erro
   * @param {number} [notificationTimeout=4000] - Tempo em ms antes de fechar
   * @returns {void}
   * @example
   * notificationStore.error('Erro ao salvar cliente. Tente novamente.')
   */
  function error(message, notificationTimeout = 4000) {
    show(message, 'error', notificationTimeout);
  }

  /**
   * Exibe uma notificação de aviso (laranja/amarelo)
   * @param {string} message - Mensagem de aviso
   * @param {number} [notificationTimeout=4000] - Tempo em ms antes de fechar
   * @returns {void}
   * @example
   * notificationStore.warning('Mensagem WhatsApp não configurada.')
   */
  function warning(message, notificationTimeout = 4000) { 
    show(message, 'warning', notificationTimeout);
  }

  /**
   * Exibe uma notificação informativa (azul)
   * @param {string} message - Mensagem informativa
   * @param {number} [notificationTimeout=3000] - Tempo em ms antes de fechar
   * @returns {void}
   * @example
   * notificationStore.info('Carregando dados...')
   */
  function info(message, notificationTimeout = 3000) { 
    show(message, 'info', notificationTimeout);
  }

  /**
   * Esconde a notificação manualmente
   * Normalmente o timeout automático cuida disso
   * @returns {void}
   * @example
   * notificationStore.hide()
   */
  function hide() {
    visible.value = false;
    // Opcional: Resetar texto e cor ao esconder
    // text.value = '';
    // color.value = 'success'; 
  }

  // --- Export ---
  return { 
    visible, 
    text, 
    color, 
    timeout, 
    show, 
    success, 
    error, 
    warning,
    info,
    hide 
  };
});