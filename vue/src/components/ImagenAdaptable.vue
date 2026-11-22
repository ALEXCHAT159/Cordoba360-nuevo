<script setup>
import { rutaImagen } from "@/servicios/utilidades";

// <picture> con WebP y respaldo JPG, como en las entregas anteriores
defineProps({
  nombre: { type: String, required: true },
  alt: { type: String, default: "" },
  prioridad: { type: Boolean, default: false },
  ancho: { type: [Number, String], default: null },
  alto: { type: [Number, String], default: null }
});
</script>

<template>
  <picture>
    <source :srcset="rutaImagen(nombre, 'webp')" type="image/webp" />
    <img
      :src="rutaImagen(nombre)"
      :alt="alt"
      :width="ancho"
      :height="alto"
      :loading="prioridad ? 'eager' : 'lazy'"
      :fetchpriority="prioridad ? 'high' : null"
      decoding="async"
    />
  </picture>
</template>
