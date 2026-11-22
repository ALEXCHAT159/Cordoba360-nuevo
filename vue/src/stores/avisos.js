import { defineStore } from "pinia";
import { ref } from "vue";

// Avisos flotantes (toast). Cualquier vista o tienda puede llamar a avisar()
// y el componente AvisosFlotantes los muestra.
export const useAvisosStore = defineStore("avisos", () => {
  const lista = ref([]);
  let siguienteId = 1;

  function avisar(texto, tipo = "ok") {
    const id = siguienteId++;
    lista.value.push({ id, texto, tipo });
    setTimeout(() => quitar(id), 3600);
  }

  function quitar(id) {
    lista.value = lista.value.filter((a) => a.id !== id);
  }

  return { lista, avisar, quitar };
});
