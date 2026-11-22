<script setup>
import { useAvisosStore } from "@/stores/avisos";

// Muestra los avisos (toast) guardados en la tienda de avisos
const avisos = useAvisosStore();
</script>

<template>
  <TransitionGroup tag="div" name="aviso" class="avisos" aria-live="polite">
    <p v-for="aviso in avisos.lista" :key="aviso.id" :class="['aviso', `aviso--${aviso.tipo}`]" @click="avisos.quitar(aviso.id)">
      {{ aviso.texto }}
    </p>
  </TransitionGroup>
</template>
