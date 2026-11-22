<script setup>
import ImagenAdaptable from "@/components/ImagenAdaptable.vue";
import IconoSvg from "@/components/IconoSvg.vue";
import { faArrowRight } from "@/iconos";

const populares = [
  { id: "lorica", nombre: "Lorica", imagen: "lorica-mercado", alt: "Mercado público de Santa Cruz de Lorica" },
  { id: "san-antero", nombre: "San Antero", imagen: "san-antero", alt: "Playa de San Antero con lancha y palmeras" },
  { id: "monteria", nombre: "Monteria", imagen: "monteria", alt: "Esculturas iluminadas en la Ronda del Sinú, Montería" },
  { id: "ayapel", nombre: "Ayapel", imagen: "ayapel-catedral", alt: "Iglesia de Ayapel al atardecer" },
  { id: "tuchin", nombre: "Tuchin", imagen: "tuchin", alt: "Letrero colorido de Tuchín con motivos del sombrero vueltiao" }
];

const experiencias = [
  { id: "naturaleza", titulo: "Naturaleza", imagen: "naturaleza-sabana", alt: "Sabanas y humedales verdes de Córdoba" },
  { id: "cultura", titulo: "Cultura", imagen: "cultura-festival", alt: "Músicos y bailarines en el Festival del Porro" },
  { id: "gastronomia", titulo: "Gastronomia", imagen: "gastronomia-pescado", alt: "Pescado frito con arroz de coco y patacón" },
  { id: "eventos", titulo: "Eventos", imagen: "eventos-san-juan", alt: "Fiesta de San Juan con fogata en la playa" }
];
</script>

<template>
  <div>
    <section class="hero" aria-labelledby="titulo-hero">
      <ImagenAdaptable nombre="hero-rio-sinu" alt="Atardecer sobre el río Sinú con una lancha de pasajeros" prioridad :ancho="1600" :alto="577" />
      <div class="contenedor hero__contenido">
        <h1 id="titulo-hero">Córdoba,<br />tierra de ensueño, te espera</h1>
        <p>naturaleza, playas, cultura, historia...<br />¡Tu próximo gran destino está aquí!</p>
        <RouterLink class="btn" :to="{ name: 'destinos' }">Explorar Destinos <IconoSvg :icono="faArrowRight" /></RouterLink>
      </div>
    </section>

    <section class="seccion contenedor" aria-labelledby="titulo-destinos">
      <h2 id="titulo-destinos" class="seccion__titulo seccion__titulo--verde">DESTINOS POPULARES</h2>
      <div class="carrusel">
        <ul class="destinos">
          <li v-for="destino in populares" :key="destino.id" class="tarjeta-destino">
            <RouterLink :to="{ name: 'detalle', params: { id: destino.id } }">
              <ImagenAdaptable :nombre="destino.imagen" :alt="destino.alt" />
              <h3>{{ destino.nombre }}</h3>
            </RouterLink>
          </li>
        </ul>
        <RouterLink class="ver-mas" :to="{ name: 'destinos' }">
          <IconoSvg :icono="faArrowRight" /><span>Ver<br />más</span><b class="sr-only">Ver más destinos</b>
        </RouterLink>
      </div>
    </section>

    <section class="seccion contenedor" aria-labelledby="titulo-exp">
      <h2 id="titulo-exp" class="seccion__titulo">
        <span class="solo-escritorio">Explora experiencias</span>
        <span class="solo-movil">¿Qué quieres descubrir de Córdoba?</span>
      </h2>
      <div class="experiencias-inicio">
        <article v-for="exp in experiencias" :key="exp.id" class="tarjeta-exp">
          <h3>{{ exp.titulo }}</h3>
          <ImagenAdaptable :nombre="exp.imagen" :alt="exp.alt" />
          <RouterLink class="tarjeta-exp__mas" :to="{ name: 'experiencias', hash: `#${exp.id}` }">
            Ver más<span class="sr-only"> sobre {{ exp.titulo }}</span>
          </RouterLink>
        </article>
      </div>
    </section>
  </div>
</template>
