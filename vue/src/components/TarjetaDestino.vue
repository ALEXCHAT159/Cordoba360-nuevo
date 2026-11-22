<script setup>
import { computed } from "vue";
import ImagenAdaptable from "./ImagenAdaptable.vue";

// Tarjeta de un destino del catálogo.
// Props: los datos del destino y si es favorito (padre → hijo).
// Evento: "alternar-favorito" cuando se toca el corazón (hijo → padre).
const props = defineProps({
  destino: { type: Object, required: true },
  esFavorito: { type: Boolean, default: false }
});
const emit = defineEmits(["alternar-favorito"]);

const textoDistancia = computed(() =>
  props.destino.kmDesdeMonteria === 0
    ? "Capital del departamento"
    : `A unos ${props.destino.kmDesdeMonteria} km de Montería`
);

const etiquetaCorazon = computed(() =>
  props.esFavorito
    ? `Quitar ${props.destino.nombre} de favoritos`
    : `Agregar ${props.destino.nombre} a favoritos`
);
</script>

<template>
  <article class="ficha">
    <ImagenAdaptable :nombre="destino.imagen" :alt="destino.alt" />
    <button
      type="button"
      class="btn-favorito"
      :aria-pressed="esFavorito"
      :aria-label="etiquetaCorazon"
      @click="emit('alternar-favorito', destino)"
    >
      {{ esFavorito ? "♥" : "♡" }}
    </button>
    <div class="ficha__cuerpo">
      <h3>{{ destino.nombre }}</h3>
      <p>{{ destino.descripcion }}</p>
      <div class="etiquetas">
        <span v-for="etiqueta in destino.etiquetas" :key="etiqueta">{{ etiqueta }}</span>
      </div>
      <small class="distancia">{{ textoDistancia }}</small>
      <RouterLink class="btn" :to="{ name: 'detalle', params: { id: destino.id } }">Ver destino →</RouterLink>
    </div>
  </article>
</template>
