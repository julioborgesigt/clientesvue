<template>
  <div>
    <!-- Título -->
    <v-card-title class="text-center text-h5 font-weight-bold pb-6" style="color: white;">
      <v-icon icon="mdi-shield-key" class="me-2" color="warning" size="large"></v-icon>
      Guarde seu Código de Recuperação
    </v-card-title>

    <v-card-text>
      <!-- Alert de Atenção -->
      <v-alert type="warning" variant="tonal" density="comfortable" class="mb-4" prominent>
        <template v-slot:prepend>
          <v-icon icon="mdi-alert" size="large"></v-icon>
        </template>
        <div style="color: white; font-weight: 600; font-size: 15px;">
          <strong style="font-size: 16px;">⚠️ ATENÇÃO:</strong><br>
          Este código será mostrado APENAS UMA VEZ!
        </div>
      </v-alert>

      <!-- Código de Recuperação -->
      <div class="recovery-code-display text-center py-6 mb-5">
        <div class="text-overline mb-2" style="color: white; font-weight: 600; letter-spacing: 1px;">
          SEU CÓDIGO DE RECUPERAÇÃO
        </div>
        <div class="recovery-code mb-3">
          {{ recoveryCode }}
        </div>
        <v-btn
          prepend-icon="mdi-content-copy"
          variant="elevated"
          color="warning"
          size="large"
          @click="copyRecoveryCode"
          class="mt-2 font-weight-bold"
        >
          Copiar Código
        </v-btn>
      </div>

      <!-- Instruções -->
      <div class="instructions mb-4">
        <p class="text-subtitle-1 font-weight-bold mb-3" style="color: white; font-size: 16px;">
          📋 Instruções Importantes:
        </p>
        <ul class="instructions-list">
          <li>✍️ Anote este código em um local seguro</li>
          <li>🔒 NÃO compartilhe com ninguém</li>
          <li>🔑 Você precisará dele no primeiro login</li>
          <li>💾 Use-o para recuperar sua conta se esquecer a senha</li>
        </ul>
      </div>

      <!-- Botão Deslizante (Slide to Unlock) -->
      <div class="slide-container mt-6">
        <div class="slide-track" :style="{ background: trackGradient }">
          <!-- Texto de Instrução -->
          <div class="slide-text" :style="{ opacity: slideTextOpacity }">
            <v-icon icon="mdi-arrow-right" class="me-2"></v-icon>
            Deslize para o Primeiro Login
            <v-icon icon="mdi-arrow-right" class="ms-2"></v-icon>
          </div>

          <!-- Botão Deslizante -->
          <div
            class="slide-button"
            :style="{ left: sliderPosition + 'px' }"
            @mousedown="startDrag"
            @touchstart="startDrag"
          >
            <v-icon icon="mdi-chevron-double-right" size="x-large" color="white"></v-icon>
          </div>
        </div>

        <!-- Texto de ajuda -->
        <div class="text-center mt-2">
          <span style="color: rgba(255, 255, 255, 0.9); font-weight: 600; font-size: 13px;">
            👆 Arraste a seta para confirmar que guardou o código
          </span>
        </div>
      </div>
    </v-card-text>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useNotificationStore } from '@/stores/notificationStore';

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();

// Refs
const recoveryCode = ref('');
const userEmail = ref('');

// Slide to unlock
const sliderPosition = ref(0);
const isDragging = ref(false);
const maxSlide = ref(0);
const trackWidth = 400; // Largura aproximada do track

// Computed properties para o slider
const slideProgress = computed(() => {
  return Math.min(sliderPosition.value / maxSlide.value, 1);
});

const slideTextOpacity = computed(() => {
  return 1 - slideProgress.value;
});

const trackGradient = computed(() => {
  const progress = slideProgress.value * 100;
  return `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${progress}%, rgba(255, 152, 0, 0.3) ${progress}%, rgba(255, 152, 0, 0.3) 100%)`;
});

// Pega os dados da rota
onMounted(() => {
  // 🔒 SEGURANÇA: Lê do state ao invés de query params (não expõe código na URL)
  const state = history.state || {};
  recoveryCode.value = state.code || '';
  userEmail.value = state.email || '';

  // Debug: Verifica os dados recebidos
  console.log('RecoveryCodeForm montado com:');
  console.log('- Código:', recoveryCode.value ? 'Presente (oculto)' : 'Ausente');
  console.log('- Email:', userEmail.value);
  console.log('- Source:', state.code ? 'Router State (seguro)' : 'Não encontrado');

  // Se não tiver código, redireciona para registro
  if (!recoveryCode.value) {
    notificationStore.error('Código de recuperação não encontrado. Por favor, faça o registro novamente.');
    router.push({ name: 'Register' });
  }

  // Aviso se não tiver email
  if (!userEmail.value) {
    console.warn('AVISO: Email não foi fornecido!');
  }
});

/**
 * Copia o código de recuperação para a área de transferência
 */
async function copyRecoveryCode() {
  try {
    await navigator.clipboard.writeText(recoveryCode.value);
    notificationStore.success('✅ Código copiado para a área de transferência!');
  } catch (error) {
    notificationStore.error('❌ Erro ao copiar código.');
  }
}

/**
 * Funções do Slide to Unlock
 */
function startDrag(event) {
  event.preventDefault();
  isDragging.value = true;

  // Calcula a largura máxima do slide (largura do track - largura do botão)
  const trackElement = event.target.closest('.slide-track');
  if (trackElement) {
    maxSlide.value = trackElement.offsetWidth - 70; // 70px é a largura do botão
  }

  // Adiciona listeners para mouse e touch
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchmove', onDrag);
  document.addEventListener('touchend', onDragEnd);
}

function onDrag(event) {
  if (!isDragging.value) return;

  const trackElement = document.querySelector('.slide-track');
  if (!trackElement) return;

  const trackRect = trackElement.getBoundingClientRect();
  let clientX;

  if (event.type === 'touchmove') {
    clientX = event.touches[0].clientX;
  } else {
    clientX = event.clientX;
  }

  // Calcula a nova posição
  let newPosition = clientX - trackRect.left - 35; // 35px é metade da largura do botão

  // Limita entre 0 e maxSlide
  newPosition = Math.max(0, Math.min(newPosition, maxSlide.value));

  sliderPosition.value = newPosition;

  // Se chegou no final (95% ou mais), desbloqueia
  if (sliderPosition.value >= maxSlide.value * 0.95) {
    onDragEnd();
    // Aguarda um momento para o efeito visual
    setTimeout(() => {
      goToFirstLogin();
    }, 300);
  }
}

function onDragEnd() {
  isDragging.value = false;

  // Remove listeners
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', onDragEnd);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', onDragEnd);

  // Se não chegou no final, volta para o início
  if (sliderPosition.value < maxSlide.value * 0.95) {
    // Animação de volta
    const startPos = sliderPosition.value;
    const duration = 300;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing out
      const easeOut = 1 - Math.pow(1 - progress, 3);

      sliderPosition.value = startPos * (1 - easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        sliderPosition.value = 0;
      }
    };

    animate();
  }
}

// Limpa listeners quando o componente é desmontado
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', onDragEnd);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', onDragEnd);
});

/**
 * Redireciona para a tela de primeiro login
 */
function goToFirstLogin() {
  // Validação - certifica que temos o email
  if (!userEmail.value) {
    notificationStore.error('Email não encontrado. Por favor, faça o registro novamente.');
    router.push({ name: 'Register' });
    return;
  }

  // Log para debug
  console.log('Navegando para primeiro login com email:', userEmail.value);

  try {
    // 🔒 SEGURANÇA: Usa state ao invés de query para não expor email na URL
    router.push({
      name: 'FirstLogin',
      state: { email: userEmail.value }
    });

    console.log('Navegação iniciada com sucesso');
  } catch (error) {
    console.error('Erro ao navegar para primeiro login:', error);
    notificationStore.error('Erro ao redirecionar. Tente novamente.');
  }
}
</script>

<style scoped>
.recovery-code-display {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 193, 7, 0.2));
  border-radius: 12px;
  border: 3px dashed #FF9800;
  box-shadow: 0 0 20px rgba(255, 152, 0, 0.3);
}

.recovery-code {
  font-size: 32px;
  font-weight: 900;
  color: #FF6F00;
  letter-spacing: 4px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.9);
  padding: 16px 24px;
  border-radius: 8px;
  display: inline-block;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.instructions {
  background: rgba(255, 152, 0, 0.15);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #FF9800;
}

.instructions-list {
  padding-left: 0;
  margin: 0;
  list-style: none;
}

.instructions-list li {
  margin-bottom: 12px;
  line-height: 1.6;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding-left: 0;
}

/* Container do Slide to Unlock */
.slide-container {
  width: 100%;
  user-select: none;
}

/* Track do slider */
.slide-track {
  position: relative;
  width: 100%;
  height: 70px;
  background: rgba(255, 152, 0, 0.3);
  border-radius: 35px;
  overflow: hidden;
  border: 3px solid #FF9800;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
  cursor: grab;
  transition: all 0.3s ease;
}

.slide-track:active {
  cursor: grabbing;
}

/* Texto de instrução no centro do track */
.slide-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: 700;
  font-size: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
  transition: opacity 0.3s ease;
}

/* Botão deslizante */
.slide-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #FF9800, #F57C00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.3),
    inset 0 2px 5px rgba(255, 255, 255, 0.3);
  transition: all 0.1s ease;
  z-index: 10;
  border: 3px solid white;
}

.slide-button:active {
  cursor: grabbing;
  transform: translateY(-50%) scale(1.05);
  box-shadow:
    0 6px 15px rgba(0, 0, 0, 0.4),
    inset 0 2px 5px rgba(255, 255, 255, 0.3);
}

.slide-button:hover {
  background: linear-gradient(135deg, #FFa726, #FB8C00);
  box-shadow:
    0 6px 15px rgba(255, 152, 0, 0.6),
    inset 0 2px 5px rgba(255, 255, 255, 0.3);
}

/* Animação de pulso para chamar atenção */
@keyframes pulse {
  0%, 100% {
    transform: translateY(-50%) scale(1);
  }
  50% {
    transform: translateY(-50%) scale(1.05);
  }
}

.slide-button {
  animation: pulse 2s infinite;
}

.slide-button:active {
  animation: none;
}
</style>
