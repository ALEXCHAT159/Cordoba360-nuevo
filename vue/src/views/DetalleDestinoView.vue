<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useDestinosStore } from "@/stores/destinos";
import { useFavoritosStore } from "@/stores/favoritos";
import MigasPan from "@/components/MigasPan.vue";
import GaleriaFotos from "@/components/GaleriaFotos.vue";
import ClimaDestino from "@/components/ClimaDestino.vue";
import EstadoCarga from "@/components/EstadoCarga.vue";
import ImagenAdaptable from "@/components/ImagenAdaptable.vue";
import TarjetaDestino from "@/components/TarjetaDestino.vue";
import IconoSvg from "@/components/IconoSvg.vue";
import LogoMarca from "@/components/LogoMarca.vue";
import { faLocationDot, faCloudSun, faCalendarDays, faClock, faArrowRight } from "@/iconos";

// Detalle de un destino (ruta dinámica /destinos/:id).
// El id llega como prop gracias a "props: true" en el router.
const props = defineProps({
  id: { type: String, required: true }
});

const destinosStore = useDestinosStore();
const { estado, error } = storeToRefs(destinosStore);
const favoritos = useFavoritosStore();

const destino = computed(() => destinosStore.buscarPorId(props.id));
const resumenClima = ref("");

// Hasta 3 destinos de la misma categoría para seguir explorando
const relacionados = computed(() =>
  destino.value
    ? destinosStore.porCategoria(destino.value.categoria).filter((d) => d.id !== destino.value.id).slice(0, 3)
    : []
);

const nombreCategoria = { playas: "Playas", pueblos: "Pueblos y Municipios", naturaleza: "Naturaleza" };

const pasos = computed(() => [
  { texto: "Inicio", ruta: { name: "inicio" } },
  { texto: "Destinos", ruta: { name: "destinos" } },
  ...(destino.value
    ? [{ texto: nombreCategoria[destino.value.categoria], ruta: { name: "destinos", query: { categoria: destino.value.categoria } } }]
    : []),
  { texto: destino.value?.nombre || "Destino" }
]);

const enlaceMapa = computed(() =>
  destino.value ? `https://maps.google.com/?q=${destino.value.lat},${destino.value.lon}` : "#"
);

onMounted(() => destinosStore.cargar());

// Título de la pestaña con el nombre del destino; el resumen del clima se
// limpia al pasar de un destino a otro
watch(destino, (d) => {
  resumenClima.value = "";
  if (d) document.title = `Córdoba 360 | ${d.nombre}`;
}, { immediate: true });
</script>

<template>
  <div>
    <MigasPan :pasos="pasos" />

    <div v-if="estado !== 'listo'" class="contenedor seccion">
      <EstadoCarga :estado="estado === 'error' ? 'error' : 'cargando'" :mensaje="error" texto-carga="Cargando destino..." @reintentar="destinosStore.cargar(undefined, { forzar: true })" />
    </div>

    <section v-else-if="!destino" class="contenedor seccion no-encontrado">
      <h1>No encontramos ese destino</h1>
      <p>Puede que el enlace esté mal escrito. Mira el listado completo.</p>
      <RouterLink class="btn" :to="{ name: 'destinos' }">Ver todos los destinos</RouterLink>
    </section>

    <article v-else>
      <section class="contenedor destino-cabecera" aria-labelledby="titulo-destino">
        <div class="destino-cabecera__texto">
          <h1 id="titulo-destino">{{ destino.nombre }}</h1>
          <p class="subtitulo">{{ destino.subtitulo }}</p>
          <ul class="datos-destino">
            <li class="dato"><IconoSvg :icono="faLocationDot" /><div><h3>Ubicación</h3><p>{{ destino.ubicacion }}</p></div></li>
            <li class="dato"><IconoSvg :icono="faCloudSun" /><div><h3>Clima</h3><p>{{ resumenClima || "Cálido, 27 a 32 °C" }}</p></div></li>
            <li class="dato"><IconoSvg :icono="faCalendarDays" /><div><h3>Mejor agenda</h3><p>{{ destino.mejorEpoca }}</p></div></li>
            <li class="dato"><IconoSvg :icono="faClock" /><div><h3>Días sugeridos</h3><p>{{ destino.dias }}</p></div></li>
          </ul>
          <button
            type="button"
            class="btn btn--favorito-detalle"
            :aria-pressed="favoritos.esFavorito(destino.id)"
            @click="favoritos.alternar(destino)"
          >
            {{ favoritos.esFavorito(destino.id) ? "♥ En tus favoritos" : "♡ Guardar en favoritos" }}
          </button>
        </div>
        <GaleriaFotos :fotos="destino.galeria" :titulo="`Galería de fotos de ${destino.nombre}`" />
      </section>

      <section class="contenedor sobre-destino" aria-labelledby="titulo-sobre">
        <div>
          <h2 id="titulo-sobre">Sobre {{ destino.nombre }}</h2>
          <p>{{ destino.historia }}</p>
          <div class="etiquetas etiquetas--detalle">
            <span v-for="etiqueta in destino.etiquetas" :key="etiqueta">{{ etiqueta }}</span>
          </div>
          <ClimaDestino :lat="destino.lat" :lon="destino.lon" :lugar="destino.nombre" @actualizado="resumenClima = $event" />
        </div>
        <figure class="mapa">
          <a :href="enlaceMapa" target="_blank" rel="noopener">
            <ImagenAdaptable v-if="destino.mapa" :nombre="destino.mapa" :alt="`Mapa ilustrativo de la ubicación de ${destino.nombre}`" />
            <ImagenAdaptable v-else :nombre="destino.imagen" :alt="destino.alt" />
          </a>
          <figcaption>Abre la ubicación de {{ destino.nombre }} en Google Maps.</figcaption>
        </figure>
      </section>

      <aside class="contenedor" aria-labelledby="titulo-cta">
        <div class="cta-destino">
          <span class="cta-destino__logo"><LogoMarca :con-texto="false" /></span>
          <div>
            <h2 id="titulo-cta">Explora experiencias en {{ destino.nombre }}</h2>
            <p>Recorridos, cultura, gastronomía y planes al aire libre en la región.</p>
          </div>
          <RouterLink class="btn" :to="{ name: 'experiencias' }">Ver experiencias <IconoSvg :icono="faArrowRight" /></RouterLink>
        </div>
      </aside>

      <section v-if="relacionados.length" class="contenedor seccion" aria-labelledby="titulo-relacionados">
        <h2 id="titulo-relacionados" class="seccion__titulo">Otros destinos de {{ nombreCategoria[destino.categoria] }}</h2>
        <div class="rejilla-destinos">
          <TarjetaDestino
            v-for="d in relacionados"
            :key="d.id"
            :destino="d"
            :es-favorito="favoritos.esFavorito(d.id)"
            @alternar-favorito="favoritos.alternar"
          />
        </div>
      </section>
    </article>
  </div>
</template>
