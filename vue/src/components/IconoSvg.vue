<script setup>
import { computed } from "vue";

// Dibuja un ícono de Font Awesome como SVG en línea.
// Se envuelve en <i> para que sigan sirviendo las reglas de styles.css
// (tamaño, color y ancho de los íconos).
const props = defineProps({
  icono: { type: Object, required: true }
});

const datos = computed(() => {
  const [ancho, alto, , , trazo] = props.icono.icon;
  return { ancho, alto, trazos: Array.isArray(trazo) ? trazo : [trazo] };
});
</script>

<template>
  <i class="icono" aria-hidden="true">
    <svg
      :viewBox="`0 0 ${datos.ancho} ${datos.alto}`"
      :style="{ width: `${datos.ancho / datos.alto}em`, height: '1em' }"
      focusable="false"
    >
      <path v-for="(d, i) in datos.trazos" :key="i" :d="d" fill="currentColor" />
    </svg>
  </i>
</template>
