<script setup>
// Recuadro de "cargando" o de error, con botón para reintentar.
// El padre decide qué hacer al reintentar escuchando el evento.
defineProps({
  estado: { type: String, required: true }, // cargando | error
  mensaje: { type: String, default: "" },
  textoCarga: { type: String, default: "Cargando..." }
});
defineEmits(["reintentar"]);
</script>

<template>
  <div v-if="estado === 'cargando'" class="estado estado--cargando" role="status">
    <span class="spinner" aria-hidden="true"></span>
    <p>{{ textoCarga }}</p>
  </div>
  <div v-else-if="estado === 'error'" class="estado estado--error" role="alert">
    <strong>Algo salió mal</strong>
    <p>{{ mensaje }}</p>
    <button type="button" class="btn" @click="$emit('reintentar')">Reintentar</button>
  </div>
</template>
