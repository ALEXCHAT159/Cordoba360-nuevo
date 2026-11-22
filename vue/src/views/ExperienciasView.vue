<script setup>
import ImagenAdaptable from "@/components/ImagenAdaptable.vue";

// Cada categoría lleva al catálogo con un filtro o una búsqueda ya aplicada
const experiencias = [
  { id: "playas", titulo: "PLAYAS", emoji: "🏖️", imagen: "playas", alt: "Playa del Caribe cordobés al atardecer", ruta: { name: "destinos", query: { categoria: "playas" } } },
  { id: "naturaleza", titulo: "NATURALEZA", emoji: "🌳", imagen: "naturaleza-camino", alt: "Camino rodeado de árboles en la zona rural", ruta: { name: "destinos", query: { categoria: "naturaleza" } } },
  { id: "aventura", titulo: "AVENTURA", emoji: "🛶", imagen: "aventura-rio", alt: "Canoas en un río rodeado de palmeras", ruta: { name: "destinos", query: { q: "aventura" } } },
  { id: "eventos", titulo: "EVENTOS", emoji: "🎉", imagen: "eventos-san-juan", alt: "Fiesta de San Juan con fogata frente al mar", ruta: { name: "destinos", query: { q: "cultura" } } },
  { id: "cultura", titulo: "CULTURA", emoji: "🥁", imagen: "cultura-gaitas", alt: "Músicos tradicionales con tambores y sombrero vueltiao", ruta: { name: "destinos", query: { q: "cultura" } } },
  { id: "gastronomia", titulo: "GASTRONOMIA", emoji: "🍽️", imagen: "gastronomia-tipica", alt: "Platos típicos cordobeses servidos en cazuelas de barro", ruta: { name: "destinos", query: { q: "gastronomia" } } }
];
</script>

<template>
  <div>
    <header class="intro-experiencias contenedor">
      <h1>VIVE EXPERIENCIAS INOLVIDABLES</h1>
      <p>Elige el plan que más te guste y descubre todo lo que Córdoba tiene para ti</p>
    </header>
    <section class="banda-experiencias" aria-label="Categorías de experiencias">
      <div class="contenedor">
        <ul class="rejilla-experiencias">
          <li v-for="exp in experiencias" :id="exp.id" :key="exp.id">
            <RouterLink class="tile" :to="exp.ruta">
              <ImagenAdaptable :nombre="exp.imagen" :alt="exp.alt" />
              <span class="tile__texto">{{ exp.titulo }} <span class="tile__emoji" aria-hidden="true">{{ exp.emoji }}</span></span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
