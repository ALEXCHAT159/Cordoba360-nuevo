<script setup>
// Mega menú de Destinos. Las columnas salen de un arreglo con v-for
// en lugar de estar escritas una por una en el HTML.
const destino = (id) => ({ name: "detalle", params: { id } });
const categoria = (c) => ({ name: "destinos", query: { categoria: c } });

const columnas = [
  {
    titulo: "Playas",
    enlaces: [
      { texto: "San Antero", ruta: destino("san-antero") },
      { texto: "Moñitos", ruta: destino("monitos") },
      { texto: "Puerto Escondido", ruta: destino("puerto-escondido") },
      { texto: "San Bernardo del Viento", ruta: destino("san-bernardo") },
      { texto: "Todas las playas", ruta: categoria("playas") }
    ]
  },
  {
    titulo: "Pueblos y Municipios",
    enlaces: [
      { texto: "Lorica", ruta: destino("lorica") },
      { texto: "Montería", ruta: destino("monteria") },
      { texto: "Ayapel", ruta: destino("ayapel") },
      { texto: "Tuchín", ruta: destino("tuchin") },
      { texto: "Todos los pueblos", ruta: categoria("pueblos") }
    ]
  },
  {
    titulo: "Naturaleza",
    enlaces: [
      { texto: "Tierralta y Paramillo", ruta: destino("paramillo") },
      { texto: "Ciénaga de Ayapel", ruta: destino("cienaga-ayapel") },
      { texto: "Río Sinú", ruta: destino("rio-sinu") },
      { texto: "Toda la naturaleza", ruta: categoria("naturaleza") }
    ]
  },
  {
    titulo: "Información",
    enlaces: [
      { texto: "Conoce Córdoba", ruta: { name: "informacion" } },
      { texto: "Nuestra historia", ruta: { name: "informacion", hash: "#historia" } },
      { texto: "Cultura y tradición", ruta: { name: "experiencias", hash: "#cultura" } },
      { texto: "Gastronomía típica", ruta: { name: "experiencias", hash: "#gastronomia" } },
      { texto: "Datos del departamento", ruta: { name: "informacion", hash: "#cifras" } }
    ]
  }
];
</script>

<template>
  <div id="mega-destinos" class="mega">
    <div v-for="columna in columnas" :key="columna.titulo">
      <h3>{{ columna.titulo }}</h3>
      <ul>
        <li v-for="enlace in columna.enlaces" :key="enlace.texto">
          <RouterLink :to="enlace.ruta">{{ enlace.texto }}</RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
