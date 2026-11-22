<script setup>
import { ref, computed, watch } from "vue";
import ImagenAdaptable from "./ImagenAdaptable.vue";

// Galería con foto principal y miniaturas.
// En el Avance 1 funcionaba con anclas (#foto-2); ahora la foto activa
// es un dato reactivo y las flechas solo cambian el índice.
const props = defineProps({
  fotos: { type: Array, required: true }, // [{ imagen, alt }]
  titulo: { type: String, default: "Galería de fotos" }
});

const activa = ref(0);
const fotoActiva = computed(() => props.fotos[activa.value]);

function mover(paso) {
  const total = props.fotos.length;
  activa.value = (activa.value + paso + total) % total;
}

// Al cambiar de destino se vuelve a la primera foto
watch(() => props.fotos, () => { activa.value = 0; });
</script>

<template>
  <section class="galeria" :aria-label="titulo">
    <div class="galeria__principal galeria__principal--vue">
      <Transition name="foto" mode="out-in">
        <figure :key="fotoActiva.imagen">
          <ImagenAdaptable :nombre="fotoActiva.imagen" :alt="fotoActiva.alt" prioridad />
          <figcaption class="sr-only">Foto {{ activa + 1 }} de {{ fotos.length }}</figcaption>
        </figure>
      </Transition>
    </div>
    <div class="galeria__miniaturas">
      <button type="button" class="flecha" aria-label="Foto anterior" @click="mover(-1)">&lt;</button>
      <ul>
        <li v-for="(foto, i) in fotos" :key="foto.imagen">
          <button
            type="button"
            :class="{ 'miniatura--activa': i === activa }"
            :aria-label="`Ver foto ${i + 1}`"
            :aria-current="i === activa"
            @click="activa = i"
          >
            <ImagenAdaptable :nombre="foto.imagen" />
          </button>
        </li>
      </ul>
      <button type="button" class="flecha" aria-label="Foto siguiente" @click="mover(1)">&gt;</button>
    </div>
  </section>
</template>
