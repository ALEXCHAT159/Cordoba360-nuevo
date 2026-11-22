<script setup>
// Barra de búsqueda, categorías y orden del catálogo.
// Usa defineModel: el padre escribe v-model:busqueda, v-model:categoria y
// v-model:orden, y los cambios viajan en los dos sentidos.
const busqueda = defineModel("busqueda", { type: String, default: "" });
const categoria = defineModel("categoria", { type: String, default: "todas" });
const orden = defineModel("orden", { type: String, default: "nombre-asc" });

defineProps({
  totalFavoritos: { type: Number, default: 0 }
});

const categorias = [
  { valor: "todas", texto: "Todas" },
  { valor: "playas", texto: "Playas" },
  { valor: "pueblos", texto: "Pueblos y Municipios" },
  { valor: "naturaleza", texto: "Naturaleza" },
  { valor: "favoritos", texto: "Mis favoritos" }
];
</script>

<template>
  <section class="herramientas-destinos" aria-label="Buscar y filtrar destinos">
    <div class="campo campo--buscar">
      <label for="buscar-destino">Buscar destino</label>
      <input id="buscar-destino" v-model="busqueda" type="search" placeholder="Ej. Lorica, playa, artesanías..." autocomplete="off" maxlength="40" />
    </div>
    <div class="filtros" role="group" aria-label="Categorías">
      <button
        v-for="c in categorias"
        :key="c.valor"
        type="button"
        class="filtro"
        :aria-pressed="categoria === c.valor"
        @click="categoria = c.valor"
      >
        {{ c.texto }}
        <span v-if="c.valor === 'favoritos'" class="contador">{{ totalFavoritos }}</span>
      </button>
    </div>
    <div class="campo campo--orden">
      <label for="ordenar">Ordenar por</label>
      <select id="ordenar" v-model="orden">
        <option value="nombre-asc">Nombre (A a Z)</option>
        <option value="nombre-desc">Nombre (Z a A)</option>
        <option value="distancia">Más cerca de Montería</option>
      </select>
    </div>
  </section>
</template>
