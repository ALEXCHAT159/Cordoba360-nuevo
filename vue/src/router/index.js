import { createRouter, createWebHistory } from "vue-router";
import InicioView from "@/views/InicioView.vue";

// Rutas de la SPA. Inicio se carga de una vez; las demás vistas se cargan
// cuando se visitan por primera vez (import dinámico = archivos más pequeños).
const routes = [
  { path: "/", name: "inicio", component: InicioView, meta: { titulo: "Turismo en Córdoba, Colombia" } },
  { path: "/destinos", name: "destinos", component: () => import("@/views/DestinosView.vue"), meta: { titulo: "Destinos" } },
  { path: "/destinos/:id", name: "detalle", component: () => import("@/views/DetalleDestinoView.vue"), props: true, meta: { titulo: "Destino" } },
  { path: "/experiencias", name: "experiencias", component: () => import("@/views/ExperienciasView.vue"), meta: { titulo: "Experiencias" } },
  { path: "/informacion", name: "informacion", component: () => import("@/views/InformacionView.vue"), meta: { titulo: "Conoce Córdoba" } },
  { path: "/contacto", name: "contacto", component: () => import("@/views/ContactoView.vue"), meta: { titulo: "Contacto" } },
  { path: "/registro", name: "registro", component: () => import("@/views/RegistroView.vue"), meta: { titulo: "Registro e inicio de sesión" } },
  // Enlaces viejos del sitio estático (san-antero.html, destinos.html...)
  { path: "/san-antero.html", redirect: { name: "detalle", params: { id: "san-antero" } } },
  { path: "/:pagina(index|destinos|experiencias|informacion|contacto|registro).html", redirect: (to) => ({ name: to.params.pagina === "index" ? "inicio" : to.params.pagina }) },
  { path: "/:ruta(.*)*", name: "no-encontrado", component: () => import("@/views/NoEncontradoView.vue"), meta: { titulo: "Página no encontrada" } }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Al cambiar de vista: sube al inicio, o baja a la sección si hay #ancla
  scrollBehavior(to, from, guardado) {
    if (guardado) return guardado;
    if (to.hash) {
      // Se espera a que termine la transición entre vistas para que la sección exista
      return new Promise((resolver) => {
        setTimeout(() => resolver({ el: to.hash, top: 80, behavior: "smooth" }), from.name === to.name ? 0 : 350);
      });
    }
    if (to.name === "destinos" && from.name === "destinos") return false; // solo cambió un filtro
    return { top: 0 };
  }
});

// Título de la pestaña según la vista
router.afterEach((to) => {
  document.title = `Córdoba 360 | ${to.meta.titulo || "Turismo"}`;
  // Quita el foco del enlace pulsado para que el mega menú (que se abre
  // con :focus-within) se cierre al navegar
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
});

export default router;
