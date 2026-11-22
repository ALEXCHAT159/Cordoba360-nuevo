<script setup>
import EncabezadoSitio from "@/components/EncabezadoSitio.vue";
import PieSitio from "@/components/PieSitio.vue";
import BotonesFlotantes from "@/components/BotonesFlotantes.vue";
import AvisosFlotantes from "@/components/AvisosFlotantes.vue";
</script>

<template>
  <div class="pagina">
    <a class="saltar-contenido" href="#contenido">Saltar al contenido</a>
    <EncabezadoSitio />
    <main id="contenido">
      <!-- Aquí Vue Router pinta la vista de la ruta actual, sin recargar -->
      <RouterView v-slot="{ Component, route }">
        <Transition name="vista" mode="out-in">
          <component :is="Component" :key="route.name" />
        </Transition>
      </RouterView>
    </main>
    <BotonesFlotantes />
    <PieSitio />
    <AvisosFlotantes />
  </div>
</template>
