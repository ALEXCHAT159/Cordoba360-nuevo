<script setup>
// Logo de Córdoba 360° en SVG. Se usa en el encabezado y en el pie.
defineProps({
  conTexto: { type: Boolean, default: true }
});
</script>

<template>
  <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M22 6.1A18 18 0 1 0 41.9 26h-8.2A10 10 0 1 1 22 14.3z" />
    <path fill="currentColor" d="M26.5 3.5c8.6.9 15.4 7.6 16.6 16.2l-8.3.1c-.8-3.9-3.6-7-7.3-8.1z" />
    <circle cx="24" cy="24" r="4.2" fill="currentColor" />
  </svg>
  <span v-if="conTexto"><b>Córdoba</b>360°</span>
</template>
