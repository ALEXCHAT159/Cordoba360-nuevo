<script setup>
// Ruta de navegación (Inicio > Destinos > ...). Recibe los pasos por prop.
defineProps({
  pasos: { type: Array, required: true } // [{ texto, ruta? }]
});
</script>

<template>
  <nav class="migas contenedor" aria-label="Ruta de navegación">
    <ol>
      <li v-for="(paso, i) in pasos" :key="paso.texto" :aria-current="i === pasos.length - 1 ? 'page' : null">
        <RouterLink v-if="paso.ruta" :to="paso.ruta">{{ paso.texto }}</RouterLink>
        <template v-else>{{ paso.texto }}</template>
      </li>
    </ol>
  </nav>
</template>
