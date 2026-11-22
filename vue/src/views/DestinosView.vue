<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useDestinosStore } from "@/stores/destinos";
import { useFavoritosStore } from "@/stores/favoritos";
import { normalizar } from "@/servicios/utilidades";
import FiltrosDestinos from "@/components/FiltrosDestinos.vue";
import TarjetaDestino from "@/components/TarjetaDestino.vue";
import EstadoCarga from "@/components/EstadoCarga.vue";

// Catálogo de destinos: búsqueda, categorías, orden y favoritos.
// Para probar el manejo de errores: /destinos?fuente=data/no-existe.json
const route = useRoute();
const router = useRouter();
const destinosStore = useDestinosStore();
const { lista, estado, error } = storeToRefs(destinosStore);
const favoritos = useFavoritosStore();

const CATEGORIAS = ["todas", "playas", "pueblos", "naturaleza", "favoritos"];

// Los filtros se leen de la URL (?q=...&categoria=...) para que el buscador
// del encabezado y el mega menú puedan abrir el catálogo ya filtrado
const busqueda = ref(route.query.q || "");
const categoria = ref(CATEGORIAS.includes(route.query.categoria) ? route.query.categoria : "todas");
const orden = ref("nombre-asc");
const fuente = computed(() => route.query.fuente || "data/destinos.json");

watch(() => route.query, (q) => {
  if (route.name !== "destinos") return; // la vista se está cerrando
  busqueda.value = q.q || "";
  categoria.value = CATEGORIAS.includes(q.categoria) ? q.categoria : "todas";
});

// Y al revés: cuando cambian los filtros se actualiza la URL sin recargar
watch([busqueda, categoria], ([q, c]) => {
  if (route.name !== "destinos") return;
  const query = { ...route.query, q: q || undefined, categoria: c !== "todas" ? c : undefined };
  router.replace({ query });
});

const visibles = computed(() => {
  const termino = normalizar(busqueda.value.trim());
  const filtrados = lista.value.filter((d) => {
    const enCategoria =
      categoria.value === "todas" ||
      (categoria.value === "favoritos" ? favoritos.esFavorito(d.id) : d.categoria === categoria.value);
    const texto = normalizar([d.nombre, d.descripcion, ...d.etiquetas].join(" "));
    return enCategoria && texto.includes(termino);
  });

  return filtrados.sort((a, b) => {
    if (orden.value === "distancia") return a.kmDesdeMonteria - b.kmDesdeMonteria;
    const comparacion = a.nombre.localeCompare(b.nombre, "es");
    return orden.value === "nombre-desc" ? -comparacion : comparacion;
  });
});

const mensajeVacio = computed(() =>
  categoria.value === "favoritos" && favoritos.total === 0
    ? "Todavía no tienes favoritos. Toca el corazón de un destino para guardarlo."
    : "No hay destinos que coincidan con tu búsqueda."
);

function cargar(forzar = false) {
  destinosStore.cargar(fuente.value, { forzar });
}

onMounted(() => cargar());
watch(fuente, () => { if (route.name === "destinos") cargar(); });
</script>

<template>
  <div>
    <header class="intro-experiencias contenedor">
      <h1>DESTINOS DE CÓRDOBA</h1>
      <p>Playas, pueblos con historia y naturaleza por descubrir</p>
    </header>
    <div class="contenedor seccion seccion--sin-arriba">
      <FiltrosDestinos
        v-model:busqueda="busqueda"
        v-model:categoria="categoria"
        v-model:orden="orden"
        :total-favoritos="favoritos.total"
      />

      <p class="resultado-busqueda" aria-live="polite">
        <template v-if="estado === 'listo'">{{ visibles.length }} de {{ lista.length }} destinos</template>
      </p>

      <div class="rejilla-destinos">
        <EstadoCarga
          v-if="estado === 'cargando' || estado === 'error' || estado === 'inicial'"
          :estado="estado === 'error' ? 'error' : 'cargando'"
          :mensaje="error"
          texto-carga="Cargando destinos..."
          @reintentar="cargar(true)"
        />
        <p v-else-if="visibles.length === 0" class="estado">{{ mensajeVacio }}</p>
        <TransitionGroup v-else name="lista">
          <TarjetaDestino
            v-for="destino in visibles"
            :key="destino.id"
            :destino="destino"
            :es-favorito="favoritos.esFavorito(destino.id)"
            @alternar-favorito="favoritos.alternar"
          />
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>
