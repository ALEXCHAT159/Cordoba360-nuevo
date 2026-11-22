<script setup>
import { ref } from "vue";
import ImagenAdaptable from "@/components/ImagenAdaptable.vue";
import IconoSvg from "@/components/IconoSvg.vue";
import { faMap, faPlaneArrival, faBed, faBus } from "@/iconos";

const cifras = [
  { valor: "30", texto: "Municipios" },
  { valor: "20+", texto: "Ríos y ciénagas" },
  { valor: "1000", texto: "Áreas de cultivo" },
  { valor: "500", texto: "Años de historia" }
];

const tarjetas = [
  { titulo: "Sobre Córdoba", icono: faMap, texto: "Departamento del Caribe colombiano con capital en Montería, bañado por el mar en el golfo de Morrosquillo y por los ríos Sinú y San Jorge." },
  { titulo: "Cómo llegar", icono: faPlaneArrival, texto: "Vuelos directos al aeropuerto Los Garzones de Montería y conexiones terrestres desde Medellín, Cartagena y Sincelejo." },
  { titulo: "Hospedaje", icono: faBed, texto: "Hoteles en Montería, cabañas frente al mar en Coveñas y San Antero, y posadas nativas en las zonas rurales." },
  { titulo: "Transporte", icono: faBus, texto: "Buses intermunicipales, lanchas por el río Sinú y mototaxis para trayectos cortos dentro de los municipios." }
];

const consejos = [
  "Usa ropa fresca, bloqueador solar y repelente.",
  "Hidrátate: la temperatura promedio supera los 28 °C.",
  "Prueba el mote de queso y el bollo limpio.",
  "Compra artesanías directamente a los artesanos de Tuchín."
];

// "Ver más" despliega el resto de la historia (v-if / v-else)
const historiaCompleta = ref(false);
</script>

<template>
  <div>
    <section class="hero hero--conoce" aria-labelledby="titulo-conoce">
      <ImagenAdaptable nombre="pescador-atarraya" alt="Pescador lanzando la atarraya al atardecer" prioridad :ancho="676" :alto="374" />
      <div class="contenedor hero__contenido">
        <h1 id="titulo-conoce">CONOCE <span>CÓRDOBA</span></h1>
        <p>Córdoba es un territorio de costumbres, ríos, ciénagas y playas.</p>
      </div>
    </section>

    <section id="historia" class="historia seccion" aria-labelledby="titulo-historia">
      <div class="contenedor historia__rejilla">
        <article class="historia__texto">
          <h2 id="titulo-historia">Nuestra Historia</h2>
          <p>Antes de la llegada de los españoles, el pueblo Zenú habitó las sabanas y los valles de los ríos Sinú y San Jorge. Construyeron un sistema de canales para controlar las inundaciones y cultivar la tierra, y su legado sigue vivo en la caña flecha y el sombrero vueltiao.</p>
          <Transition name="desplegar">
            <div v-if="historiaCompleta" class="historia__mas">
              <p>Durante la Colonia la región perteneció a la provincia de Cartagena. Montería se fundó en 1777 a orillas del Sinú y Lorica se convirtió en un puerto comercial muy activo, al que llegaron inmigrantes sirios y libaneses a finales del siglo XIX.</p>
              <p>El departamento de Córdoba se creó por ley en 1951, separándose de Bolívar, empezó a funcionar en 1952 y tomó su nombre del general José María Córdova, héroe de la independencia.</p>
            </div>
          </Transition>
          <button type="button" class="btn" :aria-expanded="historiaCompleta" @click="historiaCompleta = !historiaCompleta">
            {{ historiaCompleta ? "Ver menos" : "Ver más" }}
          </button>
        </article>
        <figure>
          <ImagenAdaptable nombre="historia-zenu" alt="Ilustración de una aldea zenú con bohíos y campos de cultivo" />
        </figure>
      </div>
    </section>

    <section id="cifras" class="contenedor" aria-labelledby="titulo-cifras">
      <h2 id="titulo-cifras" class="cifras-titulo">CÓRDOBA EN CIFRAS</h2>
      <ul class="cifras">
        <li v-for="cifra in cifras" :key="cifra.texto" class="cifra"><strong>{{ cifra.valor }}</strong><span>{{ cifra.texto }}</span></li>
      </ul>
    </section>

    <section id="info-util" class="seccion contenedor info-util" aria-labelledby="titulo-info">
      <div>
        <h2 id="titulo-info" class="seccion__titulo">Antes de viajar</h2>
        <div class="info-util__tarjetas">
          <article v-for="t in tarjetas" :key="t.titulo" class="info-card">
            <IconoSvg :icono="t.icono" />
            <div><h3>{{ t.titulo }}</h3><p>{{ t.texto }}</p></div>
          </article>
        </div>
      </div>
      <aside class="consejos" aria-labelledby="titulo-consejos">
        <h2 id="titulo-consejos">Consejos de viaje</h2>
        <ul>
          <li v-for="consejo in consejos" :key="consejo">{{ consejo }}</li>
        </ul>
        <ImagenAdaptable nombre="viaje-avion" alt="Vista del atardecer desde la ventana de un avión" />
      </aside>
    </section>

    <section class="contenedor fuentes" aria-labelledby="titulo-fuentes">
      <h2 id="titulo-fuentes">Fuentes</h2>
      <ul>
        <li>Colombia Travel. (s. f.). <cite>Descubre Colombia a través de sus regiones</cite>. <a href="https://colombia.travel/es/donde-ir" target="_blank" rel="noopener">colombia.travel/es/donde-ir</a></li>
        <li>Gobernación de Córdoba. (2021). <cite>Turismo</cite>. <a href="https://www.cordoba.gov.co/publicaciones/18/turismo/" target="_blank" rel="noopener">cordoba.gov.co/publicaciones/18/turismo</a></li>
        <li>Ministerio de Comercio, Industria y Turismo. (s. f.). <cite>Portal de Información Turística de Colombia</cite>. <a href="https://portucolombia.mincit.gov.co/" target="_blank" rel="noopener">portucolombia.mincit.gov.co</a></li>
      </ul>
    </section>
  </div>
</template>
