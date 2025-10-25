<template>
  <v-row>
    
    <v-col cols="6" sm="4" md="3">
      <v-card variant="outlined">
        <v-card-title class="text-caption d-flex align-center">
          <v-icon start size="small">mdi-currency-usd</v-icon>
          Custo Total
        </v-card-title>
        <v-card-text class="text-h6 pt-1">
          R$ {{ stats.custoTotal?.toFixed(2) || '0.00' }}
        </v-card-text>
      </v-card>
    </v-col>
    
    <v-col cols="6" sm="4" md="3">
      <v-card variant="outlined">
         <v-card-title class="text-caption d-flex align-center">
           <v-icon start size="small">mdi-finance</v-icon>
           Previsão (Apurado)
         </v-card-title>
        <v-card-text class="text-h6 pt-1">
          R$ {{ stats.valorApurado?.toFixed(2) || '0.00' }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card variant="outlined">
         <v-card-title class="text-caption d-flex align-center">
           <v-icon start size="small">mdi-trending-up</v-icon>
           Lucro
         </v-card-title>
        <v-card-text class="text-h6 pt-1">
          R$ {{ stats.lucro?.toFixed(2) || '0.00' }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card variant="outlined">
         <v-card-title class="text-caption d-flex align-center">
           <v-icon start size="small">mdi-calendar-arrow-right</v-icon>
           Resto Mês (Previsto)
         </v-card-title>
        <v-card-text class="text-h6 pt-1">
          R$ {{ stats.previsto?.toFixed(2) || '0.00' }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card
        variant="tonal" 
        color="blue-grey" 
        hover
        @click="$emit('filter', 'totalClientes')"
      >
        <v-card-title class="text-caption d-flex align-center">
          <v-icon start size="small">mdi-account-group</v-icon>
          Clientes Totais
        </v-card-title>
        <v-card-text class="text-h6 pt-1">
          {{ stats.totalClientes || 0 }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card
        variant="tonal"
        color="red-darken-1" 
        hover
        @click="$emit('filter', 'vencidos')"
      >
        <v-card-title class="text-caption d-flex align-center">
          <v-icon start size="small">mdi-alert-circle-outline</v-icon>
          Vencidos
        </v-card-title>
        <v-card-text class="text-h6 pt-1">
          {{ stats.vencidos || 0 }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card
        variant="tonal"
        color="orange-darken-1"
        hover
        @click="$emit('filter', 'vence3')"
      >
        <v-card-title class="text-caption d-flex align-center">
          <v-icon start size="small">mdi-clock-alert-outline</v-icon>
          Vence em 3 dias
        </v-card-title>
        <v-card-text class="text-h6 pt-1">
          {{ stats.vence3 || 0 }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" sm="4" md="3">
      <v-card
        variant="tonal"
        color="green-darken-1"
        hover
        @click="$emit('filter', 'emdias')"
      >
        <v-card-title class="text-caption d-flex align-center">
          <v-icon start size="small">mdi-check-circle-outline</v-icon>
          Em Dias
        </v-card-title>
        <v-card-text class="text-h6 pt-1">
          {{ stats.emdias || 0 }}
        </v-card-text>
      </v-card>
    </v-col>

  </v-row>
</template>

<script setup>
defineProps({
  stats: Object,
});
defineEmits(['filter']);
</script>

<style scoped>
/* Ajustes finos nos títulos e espaçamento */
.v-card-title {
  white-space: nowrap;
  font-size: 0.8rem; 
  padding-bottom: 4px; /* Menos espaço abaixo do título */
}
.v-card-text {
  padding-top: 0; /* Menos espaço acima do número */
}
</style>