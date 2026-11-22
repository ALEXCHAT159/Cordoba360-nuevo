import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { obtenerJSON } from "@/servicios/http";
import { rutaPublica } from "@/servicios/utilidades";

// Datos de los destinos. Se piden una sola vez con fetch y los comparten
// Inicio, el catálogo de Destinos y la vista de detalle.
export const useDestinosStore = defineStore("destinos", () => {
  const lista = ref([]);
  const estado = ref("inicial"); // inicial | cargando | listo | error
  const error = ref("");
  const fuenteCargada = ref("");

  const porCategoria = computed(() => (categoria) =>
    lista.value.filter((d) => d.categoria === categoria)
  );

  function buscarPorId(id) {
    return lista.value.find((d) => d.id === id);
  }

  // fuente se puede cambiar para probar el error 404 (?fuente=data/no-existe.json)
  async function cargar(fuente = "data/destinos.json", { forzar = false } = {}) {
    if (estado.value === "listo" && fuenteCargada.value === fuente && !forzar) return;
    estado.value = "cargando";
    error.value = "";
    try {
      const datos = await obtenerJSON(rutaPublica(fuente));
      lista.value = datos.destinos;
      fuenteCargada.value = fuente;
      estado.value = "listo";
    } catch (e) {
      lista.value = [];
      error.value = e.message;
      estado.value = "error";
    }
  }

  return { lista, estado, error, porCategoria, buscarPorId, cargar };
});
