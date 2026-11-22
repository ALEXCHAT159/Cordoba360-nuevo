<script setup>
import { computed } from "vue";

// Barra que muestra qué tan segura es la contraseña.
// Todo es computed: se recalcula solo cada vez que cambia la prop.
const props = defineProps({
  clave: { type: String, default: "" }
});

const NIVELES = ["", "Muy débil", "Débil", "Aceptable", "Buena", "Muy buena"];

const nivel = computed(() => {
  const v = props.clave;
  if (!v) return 0;
  let puntos = 0;
  if (v.length >= 8) puntos++;
  if (v.length >= 12) puntos++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) puntos++;
  if (/[0-9]/.test(v)) puntos++;
  if (/[^A-Za-z0-9]/.test(v)) puntos++;
  return Math.max(1, puntos);
});
</script>

<template>
  <div :class="['fuerza', nivel ? `fuerza--${nivel}` : '']" aria-hidden="true">
    <span :style="{ width: `${nivel * 20}%` }"></span>
  </div>
  <span class="ayuda" aria-live="polite">
    {{ nivel ? `Seguridad: ${NIVELES[nivel]}` : "Al menos 8 caracteres, una mayúscula y un número." }}
  </span>
</template>
