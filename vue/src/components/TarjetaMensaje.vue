<script setup>
import { computed } from "vue";
import { formatearFecha } from "@/servicios/utilidades";

// Un mensaje guardado del formulario de contacto.
// No modifica nada por su cuenta: emite "editar" o "eliminar" y el padre decide.
const props = defineProps({
  mensaje: { type: Object, required: true },
  editando: { type: Boolean, default: false }
});
defineEmits(["editar", "eliminar"]);

const fecha = computed(() =>
  formatearFecha(props.mensaje.editado || props.mensaje.creado) + (props.mensaje.editado ? " (editado)" : "")
);

const remitente = computed(() => {
  const m = props.mensaje;
  const partes = [m.nombre, m.correo];
  if (m.personas) partes.push(`${m.personas} viajero(s)`);
  if (m.fecha) partes.push(`visita el ${m.fecha}`);
  return partes.join(" · ");
});
</script>

<template>
  <li :class="['mensaje', { 'mensaje--editando': editando }]">
    <div class="mensaje__cabecera">
      <strong>{{ mensaje.asunto }}</strong>
      <time :datetime="mensaje.creado">{{ fecha }}</time>
    </div>
    <p class="mensaje__de">{{ remitente }}</p>
    <p>{{ mensaje.mensaje }}</p>
    <div class="mensaje__acciones">
      <button type="button" class="btn btn--pildora" @click="$emit('editar', mensaje)">Editar</button>
      <button type="button" class="btn btn--pildora btn--peligro" @click="$emit('eliminar', mensaje)">Eliminar</button>
    </div>
  </li>
</template>
