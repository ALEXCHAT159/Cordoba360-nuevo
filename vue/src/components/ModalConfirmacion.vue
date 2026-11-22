<script setup>
import { ref, watch, nextTick } from "vue";

// Ventana modal para confirmar acciones que borran datos.
// v-model:abierto controla si se ve (enlace bidireccional con el padre).
const abierto = defineModel("abierto", { type: Boolean, default: false });

defineProps({
  titulo: { type: String, default: "¿Estás seguro?" },
  textoConfirmar: { type: String, default: "Sí, eliminar" }
});
const emit = defineEmits(["confirmar"]);

const botonCancelar = ref(null);

// Al abrir se pone el foco en "Cancelar" para poder cerrar con el teclado
watch(abierto, async (valor) => {
  if (valor) {
    await nextTick();
    botonCancelar.value?.focus();
  }
});

function confirmar() {
  emit("confirmar");
  abierto.value = false;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="abierto" class="modal-fondo" @click.self="abierto = false" @keydown.esc="abierto = false">
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
          <h2 id="titulo-modal">{{ titulo }}</h2>
          <div class="modal__cuerpo"><slot /></div>
          <div class="modal__acciones">
            <button ref="botonCancelar" type="button" class="btn btn--secundario" @click="abierto = false">Cancelar</button>
            <button type="button" class="btn btn--peligro-fuerte" @click="confirmar">{{ textoConfirmar }}</button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
