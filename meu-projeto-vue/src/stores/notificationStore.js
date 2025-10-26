import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  // --- State ---
  const visible = ref(false);
  const text = ref('');
  const color = ref('success'); // 'success', 'error', 'warning', 'info'
  const timeout = ref(3000); // Tempo em milissegundos (3 segundos)

  // --- Actions ---
  function show(message, notificationColor = 'success', notificationTimeout = 3000) {
    text.value = message;
    color.value = notificationColor;
    timeout.value = notificationTimeout;
    visible.value = true; 
  }

  function success(message, notificationTimeout = 3000) {
    show(message, 'success', notificationTimeout);
  }

  function error(message, notificationTimeout = 4000) { // Erros ficam um pouco mais
    show(message, 'error', notificationTimeout);
  }
  
  function warning(message, notificationTimeout = 4000) { 
    show(message, 'warning', notificationTimeout);
  }

  function info(message, notificationTimeout = 3000) { 
    show(message, 'info', notificationTimeout);
  }

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