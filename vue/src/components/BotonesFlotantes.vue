<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import IconoSvg from "./IconoSvg.vue";
import { faArrowUp, faWhatsapp } from "@/iconos";

// El botón "volver arriba" solo aparece después de bajar un poco
const mostrarArriba = ref(false);
const revisarScroll = () => { mostrarArriba.value = window.scrollY > 400; };

onMounted(() => window.addEventListener("scroll", revisarScroll, { passive: true }));
onUnmounted(() => window.removeEventListener("scroll", revisarScroll));

function subir() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <aside class="flotantes" aria-label="Accesos rápidos">
    <Transition name="aparecer">
      <button v-show="mostrarArriba" type="button" class="flotante flotante--arriba" aria-label="Volver arriba" @click="subir">
        <IconoSvg :icono="faArrowUp" />
      </button>
    </Transition>
    <a class="flotante flotante--whatsapp" href="https://wa.me/57345609876" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">
      <IconoSvg :icono="faWhatsapp" />
    </a>
  </aside>
</template>
