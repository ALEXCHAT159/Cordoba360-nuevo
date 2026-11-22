import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { CLAVES, leer, guardar } from "@/servicios/almacenamiento";
import { useAvisosStore } from "./avisos";

// Favoritos compartidos: el contador del encabezado, las tarjetas del
// catálogo y la página de detalle leen el mismo estado.
export const useFavoritosStore = defineStore("favoritos", () => {
  const ids = ref(leer(CLAVES.favoritos, []));
  const total = computed(() => ids.value.length);

  function esFavorito(id) {
    return ids.value.includes(id);
  }

  function alternar(destino) {
    const avisos = useAvisosStore();
    if (esFavorito(destino.id)) {
      ids.value = ids.value.filter((f) => f !== destino.id);
      avisos.avisar(`${destino.nombre} salió de tus favoritos.`, "info");
    } else {
      ids.value = [...ids.value, destino.id];
      avisos.avisar(`${destino.nombre} quedó en tus favoritos.`);
    }
  }

  // Cada cambio se guarda solo en localStorage
  watch(ids, (valor) => guardar(CLAVES.favoritos, valor), { deep: true });

  // Si otra pestaña cambia los favoritos, esta se actualiza
  window.addEventListener("storage", (e) => {
    if (e.key === CLAVES.favoritos) ids.value = leer(CLAVES.favoritos, []);
  });

  return { ids, total, esFavorito, alternar };
});
