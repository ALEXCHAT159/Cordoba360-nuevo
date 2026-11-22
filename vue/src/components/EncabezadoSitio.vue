<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useSesionStore } from "@/stores/sesion";
import { useFavoritosStore } from "@/stores/favoritos";
import { useAvisosStore } from "@/stores/avisos";
import IconoSvg from "./IconoSvg.vue";
import LogoMarca from "./LogoMarca.vue";
import MenuDestinos from "./MenuDestinos.vue";
import CuentaUsuario from "./CuentaUsuario.vue";
import { faXmark, faBars, faChevronRight, faChevronDown, faHeart } from "@/iconos";

const route = useRoute();
const router = useRouter();
const sesion = useSesionStore();
const { usuario, haySesion } = storeToRefs(sesion);
const favoritos = useFavoritosStore();
const { avisar } = useAvisosStore();

// El menú móvil sigue siendo un checkbox (como en el Avance 1),
// pero ahora su estado está unido a una variable con v-model
const menuAbierto = ref(false);
const submenuAbierto = ref(false);
const busqueda = ref("");
// Después de elegir un destino del mega menú se esconde, aunque el mouse
// siga encima; vuelve a funcionar cuando el mouse sale del menú
const megaEscondido = ref(false);

const enlaces = [
  { texto: "Experiencias", ruta: { name: "experiencias" } },
  { texto: "Informacion", ruta: { name: "informacion" } },
  { texto: "Contacto", ruta: { name: "contacto" } }
];

// Al cambiar de vista se cierran el menú y el submenú
watch(() => route.fullPath, () => {
  menuAbierto.value = false;
  submenuAbierto.value = false;
  megaEscondido.value = true;
});

function buscar(evento) {
  const termino = busqueda.value.trim();
  if (termino.length < 2) return;
  router.push({ name: "destinos", query: { q: termino } });
  busqueda.value = "";
  evento.target.querySelector("input")?.blur();
}

function cerrarSesion() {
  const nombre = usuario.value?.nombre;
  sesion.cerrar();
  avisar(`Hasta pronto, ${nombre}.`, "info");
}
</script>

<template>
  <header class="encabezado">
    <div class="contenedor barra">
      <RouterLink class="logo" :to="{ name: 'inicio' }" aria-label="Córdoba 360°, ir al inicio">
        <LogoMarca />
      </RouterLink>

      <input id="menu" v-model="menuAbierto" type="checkbox" class="menu-toggle" aria-label="Abrir menú" />
      <label for="menu" class="velo" aria-hidden="true"></label>
      <nav class="nav" aria-label="Navegación principal">
        <label for="menu" class="menu-cerrar" aria-label="Cerrar menú"><IconoSvg :icono="faXmark" /></label>
        <ul class="nav__lista">
          <li class="nav__item">
            <RouterLink class="nav__enlace" :to="{ name: 'inicio' }">
              Inicio <IconoSvg :icono="faChevronRight" />
            </RouterLink>
          </li>
          <li :class="['nav__item', 'nav__item--mega', { 'mega-escondido': megaEscondido }]" @mouseleave="megaEscondido = false">
            <input id="sub-destinos" v-model="submenuAbierto" type="checkbox" class="sub-toggle" />
            <div class="nav__fila">
              <RouterLink class="nav__enlace" :to="{ name: 'destinos' }">Destinos</RouterLink>
              <label for="sub-destinos" class="sub-abrir" aria-label="Mostrar destinos"><IconoSvg :icono="faChevronDown" /></label>
            </div>
            <MenuDestinos />
          </li>
          <li v-for="enlace in enlaces" :key="enlace.texto" class="nav__item">
            <RouterLink class="nav__enlace" :to="enlace.ruta">
              {{ enlace.texto }} <IconoSvg :icono="faChevronRight" />
            </RouterLink>
          </li>
        </ul>
        <CuentaUsuario class="nav__cuenta" :usuario="usuario" @cerrar-sesion="cerrarSesion" />
      </nav>

      <div class="herramientas">
        <form class="buscador" role="search" @submit.prevent="buscar">
          <label for="q" class="buscador__abrir" title="Buscar">
            <span class="sr-only">Buscar destinos</span>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2" /><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
          </label>
          <input id="q" v-model="busqueda" type="search" placeholder="Buscar destinos..." minlength="2" maxlength="40" />
          <button type="submit" aria-label="Buscar">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2" /><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
          </button>
        </form>
        <RouterLink
          class="enlace-favoritos"
          :to="{ name: 'destinos', query: { categoria: 'favoritos' } }"
          :aria-label="`Mis favoritos (${favoritos.total})`"
          title="Mis favoritos"
        >
          <IconoSvg :icono="faHeart" />
          <span v-if="favoritos.total" class="contador">{{ favoritos.total }}</span>
        </RouterLink>
        <CuentaUsuario class="cuenta" :usuario="usuario" @cerrar-sesion="cerrarSesion" />
        <label for="menu" class="menu-abrir" aria-label="Abrir menú"><IconoSvg :icono="faBars" /></label>
      </div>
    </div>
    <p v-if="haySesion" class="sr-only" aria-live="polite">Sesión iniciada como {{ usuario.nombre }}</p>
  </header>
</template>
