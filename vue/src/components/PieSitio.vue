<script setup>
import IconoSvg from "./IconoSvg.vue";
import LogoMarca from "./LogoMarca.vue";
import { faFacebookF, faInstagram, faLinkedinIn, faYoutube, faPhone, faEnvelope, faLocationDot } from "@/iconos";

const redes = [
  { nombre: "Facebook", url: "https://facebook.com", icono: faFacebookF },
  { nombre: "Instagram", url: "https://instagram.com", icono: faInstagram },
  { nombre: "LinkedIn", url: "https://linkedin.com", icono: faLinkedinIn },
  { nombre: "YouTube", url: "https://youtube.com", icono: faYoutube }
];

const enlacesRapidos = [
  { texto: "Inicio", ruta: { name: "inicio" } },
  { texto: "Destinos", ruta: { name: "destinos" } },
  { texto: "Experiencias", ruta: { name: "experiencias" } },
  { texto: "Conoce Córdoba", ruta: { name: "informacion" } },
  { texto: "Contacto", ruta: { name: "contacto" } }
];

const anio = new Date().getFullYear();
</script>

<template>
  <footer class="pie">
    <div class="contenedor pie__rejilla">
      <section class="pie__marca" aria-label="Córdoba 360">
        <RouterLink class="logo" :to="{ name: 'inicio' }"><LogoMarca /></RouterLink>
        <p>Turismo, cultura y naturaleza del Caribe cordobés.</p>
        <ul class="redes">
          <li v-for="red in redes" :key="red.nombre">
            <a :href="red.url" target="_blank" rel="noopener" :aria-label="red.nombre"><IconoSvg :icono="red.icono" /></a>
          </li>
        </ul>
      </section>
      <nav class="pie__columna" aria-label="Enlaces rápidos">
        <h2>Enlaces rápidos</h2>
        <ul class="pie__lista">
          <li v-for="enlace in enlacesRapidos" :key="enlace.texto">
            <RouterLink :to="enlace.ruta">{{ enlace.texto }}</RouterLink>
          </li>
        </ul>
      </nav>
      <nav class="pie__columna" aria-label="Información">
        <h2>Informacion</h2>
        <ul class="pie__lista">
          <li><RouterLink :to="{ name: 'informacion' }">Quiénes somos</RouterLink></li>
          <li><a href="#">Términos y condiciones</a></li>
          <li><a href="#">Políticas de privacidad</a></li>
          <li><RouterLink :to="{ name: 'contacto' }">Preguntas frecuentes</RouterLink></li>
        </ul>
      </nav>
      <section class="pie__columna" aria-label="Contáctanos">
        <h2>Contáctanos</h2>
        <address>
          <ul class="pie__contacto">
            <li><IconoSvg :icono="faPhone" /><a href="tel:+577654321987">+57 765 432 1987</a></li>
            <li><IconoSvg :icono="faEnvelope" /><a href="mailto:guiaturistica@gmail.com">guiaturistica@gmail.com</a></li>
            <li><IconoSvg :icono="faLocationDot" />Córdoba, Colombia</li>
          </ul>
        </address>
      </section>
    </div>
    <div class="pie__legal">
      <div class="contenedor">
        <p>Copyright © {{ anio }} <strong>Córdoba 360</strong>. Todos los derechos reservados.</p>
        <nav aria-label="Legal">
          <a href="#">Términos y condiciones</a> | <a href="#">Política de privacidad</a>
        </nav>
      </div>
    </div>
  </footer>
</template>
