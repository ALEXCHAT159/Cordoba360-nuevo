<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
  <section class="contenedor seccion no-encontrado">
    <p class="no-encontrado__codigo" aria-hidden="true">404</p>
    <h1>Esta página no existe</h1>
    <p>No encontramos <code>{{ route.fullPath }}</code>. Puede que el enlace esté mal escrito o que la página se haya movido.</p>
    <div class="acciones-form">
      <RouterLink class="btn" :to="{ name: 'inicio' }">Volver al inicio</RouterLink>
      <RouterLink class="btn btn--secundario" :to="{ name: 'destinos' }">Ver destinos</RouterLink>
    </div>
  </section>
</template>
