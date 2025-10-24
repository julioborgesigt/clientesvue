<template>
  <v-row>
    
    <v-col cols="6" sm="4" md="3">
      <v-card variant="tonal">
        <v-card-title class="text-caption">Custo Total</v-card-title>
        <v-card-text class="text-h6">
          R$ {{ stats.custoTotal?.toFixed(2) || '0.00' }}
        </v-card-text>
      </v-card>
    </v-col>
    
    <v-col cols="6" sm="4" md="3">
      <v-card variant="tonal">
        <v-card-title class="text-caption">Previsão (Apurado)</v-card-title>
        <v-card-text class="text-h6">
          R$ {{ stats.valorApurado?.toFixed(2) || '0.00' }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card variant="tonal">
        <v-card-title class="text-caption">Lucro</v-card-title>
        <v-card-text class="text-h6">
          R$ {{ stats.lucro?.toFixed(2) || '0.00' }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card variant="tonal">
        <v-card-title class="text-caption">Resto Mês (Previsto)</v-card-title>
        <v-card-text class="text-h6">
          R$ {{ stats.previsto?.toFixed(2) || '0.00' }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card
        color="blue-lighten-5"
        hover
        @click="$emit('filter', 'totalClientes')"
      >
        <v-card-title class="text-caption">Clientes Totais</v-card-title>
        <v-card-text class="text-h6">
          {{ stats.totalClientes || 0 }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card
        color="red-lighten-5"
        hover
        @click="$emit('filter', 'vencidos')"
      >
        <v-card-title class="text-caption">Vencidos</v-card-title>
        <v-card-text class="text-h6">
          {{ stats.vencidos || 0 }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card
        color="orange-lighten-5"
        hover
        @click="$emit('filter', 'vence3')"
      >
        <v-card-title class="text-caption">Vence em 3 dias</v-card-title>
        <v-card-text class="text-h6">
          {{ stats.vence3 || 0 }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card
        color="green-lighten-5"
        hover
        @click="$emit('filter', 'emdias')"
      >
        <v-card-title class="text-caption">Em Dias</v-card-title>
        <v-card-text class="text-h6">
          {{ stats.emdias || 0 }}
        </v-card-text>
      </v-card>
    </v-col>

  </v-row>
</template>

<script setup>
// A seção <script> não muda em nada!
// Ela já está correta, recebendo as 'props' e emitindo o evento 'filter'.
defineProps({
  stats: Object,
});
defineEmits(['filter']);
</script>

<style scoped>
/* Este CSS é opcional, mas ajuda o título a não quebrar em telas muito pequenas */
.v-card-title {
  white-space: nowrap;
  font-size: 0.8rem; /* Ajuste fino do tamanho da fonte */
}
</style>