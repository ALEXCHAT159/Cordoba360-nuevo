import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { CLAVES, leer, guardar } from "@/servicios/almacenamiento";

// CRUD de los mensajes del formulario de contacto
export const useMensajesStore = defineStore("mensajes", () => {
  const lista = ref(leer(CLAVES.mensajes, []));
  const recientesPrimero = computed(() => [...lista.value].reverse());

  function crear(datos) {
    lista.value.push({ id: Date.now().toString(36), ...datos, creado: new Date().toISOString() });
  }

  function actualizar(id, datos) {
    lista.value = lista.value.map((m) =>
      m.id === id ? { ...m, ...datos, editado: new Date().toISOString() } : m
    );
  }

  function eliminar(id) {
    lista.value = lista.value.filter((m) => m.id !== id);
  }

  function eliminarTodos() {
    lista.value = [];
  }

  watch(lista, (valor) => guardar(CLAVES.mensajes, valor), { deep: true });

  return { lista, recientesPrimero, crear, actualizar, eliminar, eliminarTodos };
});
