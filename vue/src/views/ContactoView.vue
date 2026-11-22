<script setup>
import { ref, computed } from "vue";
import { useMensajesStore } from "@/stores/mensajes";
import { useAvisosStore } from "@/stores/avisos";
import {
  useFormulario, requerido, marcado, minLargo, maxLargo, patron, correo, fechaEntre, numeroEntre
} from "@/composables/useFormulario";
import { hoyISO } from "@/servicios/utilidades";
import TarjetaMensaje from "@/components/TarjetaMensaje.vue";
import ModalConfirmacion from "@/components/ModalConfirmacion.vue";
import IconoSvg from "@/components/IconoSvg.vue";
import { faPhoneVolume, faEnvelope, faWhatsapp, faInstagram, faCalendarCheck } from "@/iconos";

const mensajes = useMensajesStore();
const { avisar } = useAvisosStore();

const VACIO = { nombre: "", correo: "", telefono: "", fecha: "", asunto: "", personas: 1, mensaje: "", acepto: false };
const ASUNTOS = ["Información de destinos", "Experiencias y planes", "Eventos", "Otro"];
const hoy = hoyISO();

const form = useFormulario(VACIO, {
  nombre: [requerido("El nombre"), minLargo(3, "El nombre"), maxLargo(60, "El nombre"), patron(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/, "Usa solo letras y espacios.")],
  correo: [requerido("El correo"), correo()],
  telefono: [patron(/^3\d{9}$/, "Debe ser un celular de 10 dígitos que empiece por 3.")],
  fecha: [fechaEntre(() => hoyISO(), "2027-12-31", "La fecha no puede ser anterior a hoy.", "Elige una fecha antes de 2028.")],
  asunto: [requerido("El asunto")],
  personas: [numeroEntre(1, 20, "Debe viajar al menos 1 persona.", "Para grupos de más de 20 personas escríbenos por WhatsApp.")],
  mensaje: [requerido("El mensaje"), minLargo(10, "El mensaje"), maxLargo(500, "El mensaje")],
  acepto: [marcado()]
});
const { valores, errores } = form;

const editandoId = ref(null);
const largoMensaje = computed(() => valores.mensaje.length);

// Modal para confirmar antes de borrar
const modalAbierto = ref(false);
const porEliminar = ref(null); // un mensaje, o "todos"

const canales = [
  { titulo: "Teléfono:", icono: faPhoneVolume, texto: "7654321987", enlace: "tel:+577654321987" },
  { titulo: "Correo Electrónico", icono: faEnvelope, texto: "guiaturistica@gmail.com", enlace: "mailto:guiaturistica@gmail.com" },
  { titulo: "Whatsapp", icono: faWhatsapp, texto: "345609876", enlace: "https://wa.me/57345609876", externo: true },
  { titulo: "Instagram", icono: faInstagram, texto: "guia_34", enlace: "https://instagram.com/guia_34", externo: true }
];

function datosLimpios() {
  return {
    nombre: valores.nombre.trim(),
    correo: valores.correo.trim(),
    telefono: valores.telefono,
    fecha: valores.fecha,
    asunto: valores.asunto,
    personas: Number(valores.personas) || 1,
    mensaje: valores.mensaje.trim()
  };
}

function salirDeEdicion() {
  editandoId.value = null;
  form.limpiar();
}

function enviar() {
  const campoMalo = form.validarTodo();
  if (campoMalo) {
    document.getElementById(`c-${campoMalo}`)?.focus();
    avisar("Revisa los campos marcados en rojo.", "error");
    return;
  }

  const datos = datosLimpios();
  if (editandoId.value) {
    mensajes.actualizar(editandoId.value, datos);
    avisar("Mensaje actualizado.");
  } else {
    mensajes.crear(datos);
    avisar(`Gracias, ${datos.nombre.split(" ")[0]}. Tu mensaje quedó guardado.`);
  }
  salirDeEdicion();
}

async function editar(mensaje) {
  editandoId.value = mensaje.id;
  await form.limpiar({ ...VACIO, ...mensaje, acepto: true });
  document.getElementById("form-contacto")?.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("c-nombre")?.focus({ preventScroll: true });
}

function pedirEliminar(objetivo) {
  porEliminar.value = objetivo;
  modalAbierto.value = true;
}

function confirmarEliminar() {
  if (porEliminar.value === "todos") {
    mensajes.eliminarTodos();
    salirDeEdicion();
    avisar("Se borraron todos los mensajes.", "info");
  } else {
    if (editandoId.value === porEliminar.value.id) salirDeEdicion();
    mensajes.eliminar(porEliminar.value.id);
    avisar("Mensaje eliminado.", "info");
  }
  porEliminar.value = null;
}
</script>

<template>
  <div class="contacto-fondo">
    <div class="contenedor">
      <header class="contacto-intro">
        <h1>CONTÁCTANOS</h1>
        <p>¿Tienes preguntas o necesitas más información?</p>
        <p>Estamos aquí para ayudarte</p>
      </header>

      <div class="contacto-rejilla">
        <section class="panel" aria-labelledby="titulo-form">
          <h2 id="titulo-form">{{ editandoId ? "Editar mensaje" : "Envíanos un mensaje" }}</h2>
          <form id="form-contacto" class="formulario" novalidate @submit.prevent="enviar">
            <div class="campo">
              <label for="c-nombre">Nombre completo</label>
              <input id="c-nombre" v-model="valores.nombre" type="text" placeholder="Nombre completo" maxlength="60" autocomplete="name"
                     :class="form.clase('nombre')" :aria-invalid="Boolean(errores.nombre)" aria-describedby="e-nombre" @blur="form.tocar('nombre')" />
              <p id="e-nombre" class="error-campo" aria-live="polite">{{ errores.nombre }}</p>
            </div>
            <div class="campo">
              <label for="c-correo">Correo electrónico</label>
              <input id="c-correo" v-model="valores.correo" type="email" placeholder="Correo electrónico" autocomplete="email"
                     :class="form.clase('correo')" :aria-invalid="Boolean(errores.correo)" aria-describedby="e-correo" @blur="form.tocar('correo')" />
              <p id="e-correo" class="error-campo" aria-live="polite">{{ errores.correo }}</p>
            </div>
            <div class="doble">
              <div class="campo">
                <label for="c-telefono">Teléfono (opcional)</label>
                <input id="c-telefono" v-model="valores.telefono" type="tel" placeholder="3001234567" maxlength="10" autocomplete="tel"
                       :class="form.clase('telefono')" :aria-invalid="Boolean(errores.telefono)" aria-describedby="e-telefono" @blur="form.tocar('telefono')" />
                <p id="e-telefono" class="error-campo" aria-live="polite">{{ errores.telefono }}</p>
              </div>
              <div class="campo">
                <label for="c-fecha">Fecha tentativa de visita</label>
                <input id="c-fecha" v-model="valores.fecha" type="date" :min="hoy" max="2027-12-31"
                       :class="form.clase('fecha')" :aria-invalid="Boolean(errores.fecha)" aria-describedby="e-fecha" @blur="form.tocar('fecha')" />
                <p id="e-fecha" class="error-campo" aria-live="polite">{{ errores.fecha }}</p>
              </div>
            </div>
            <div class="doble">
              <div class="campo">
                <label for="c-asunto">Asunto</label>
                <select id="c-asunto" v-model="valores.asunto" :class="form.clase('asunto')" :aria-invalid="Boolean(errores.asunto)" aria-describedby="e-asunto" @change="form.tocar('asunto')">
                  <option value="">Selecciona un asunto</option>
                  <option v-for="asunto in ASUNTOS" :key="asunto">{{ asunto }}</option>
                </select>
                <p id="e-asunto" class="error-campo" aria-live="polite">{{ errores.asunto }}</p>
              </div>
              <div class="campo">
                <label for="c-personas">Número de viajeros</label>
                <input id="c-personas" v-model.number="valores.personas" type="number" min="1" max="20"
                       :class="form.clase('personas')" :aria-invalid="Boolean(errores.personas)" aria-describedby="e-personas" @blur="form.tocar('personas')" />
                <p id="e-personas" class="error-campo" aria-live="polite">{{ errores.personas }}</p>
              </div>
            </div>
            <div class="campo">
              <label for="c-mensaje">Mensaje</label>
              <textarea id="c-mensaje" v-model="valores.mensaje" placeholder="Mensaje" maxlength="500"
                        :class="form.clase('mensaje')" :aria-invalid="Boolean(errores.mensaje)" aria-describedby="e-mensaje" @blur="form.tocar('mensaje')"></textarea>
              <span :class="['ayuda', { 'ayuda--alerta': largoMensaje > 450 }]">{{ largoMensaje }}/500 caracteres (mínimo 10).</span>
              <p id="e-mensaje" class="error-campo" aria-live="polite">{{ errores.mensaje }}</p>
            </div>
            <label class="casilla">
              <input id="c-acepto" v-model="valores.acepto" type="checkbox" :class="form.clase('acepto')" @change="form.tocar('acepto')" />
              Acepto el tratamiento de mis datos personales.
            </label>
            <p class="error-campo" aria-live="polite">{{ errores.acepto }}</p>
            <div class="acciones-form">
              <button class="btn" type="submit">{{ editandoId ? "Guardar cambios" : "Enviar" }}</button>
              <button v-if="editandoId" class="btn btn--secundario" type="button" @click="salirDeEdicion">Cancelar edición</button>
            </div>
          </form>
        </section>

        <section class="panel" aria-labelledby="titulo-canales">
          <h2 id="titulo-canales">Canales de atención</h2>
          <ul class="canales">
            <li v-for="canal in canales" :key="canal.titulo">
              <IconoSvg :icono="canal.icono" />
              <div>
                <h3>{{ canal.titulo }}</h3>
                <a :href="canal.enlace" :target="canal.externo ? '_blank' : null" :rel="canal.externo ? 'noopener' : null">{{ canal.texto }}</a>
              </div>
            </li>
            <li>
              <IconoSvg :icono="faCalendarCheck" />
              <div><h3>Horarios de atención</h3><p><time>8:00 am</time> - <time>6:00 pm</time> De lunes a domingo</p></div>
            </li>
          </ul>
        </section>
      </div>

      <section class="panel mensajes-guardados" aria-labelledby="titulo-mensajes">
        <div class="mensajes-guardados__cabecera">
          <h2 id="titulo-mensajes">Tus mensajes guardados ({{ mensajes.lista.length }})</h2>
          <button v-if="mensajes.lista.length > 1" class="btn btn--secundario" type="button" @click="pedirEliminar('todos')">Borrar todos</button>
        </div>
        <p class="ayuda">Se guardan en este navegador, así que siguen aquí aunque recargues la página.</p>
        <TransitionGroup tag="ul" name="mensaje" class="lista-mensajes">
          <li v-if="mensajes.lista.length === 0" key="vacio" class="estado">Aún no has enviado mensajes.</li>
          <TarjetaMensaje
            v-for="m in mensajes.recientesPrimero"
            :key="m.id"
            :mensaje="m"
            :editando="m.id === editandoId"
            @editar="editar"
            @eliminar="pedirEliminar"
          />
        </TransitionGroup>
      </section>
    </div>

    <ModalConfirmacion
      v-model:abierto="modalAbierto"
      :titulo="porEliminar === 'todos' ? '¿Borrar todos los mensajes?' : '¿Eliminar este mensaje?'"
      @confirmar="confirmarEliminar"
    >
      <p v-if="porEliminar === 'todos'">Se borrarán los {{ mensajes.lista.length }} mensajes guardados. Esta acción no se puede deshacer.</p>
      <p v-else-if="porEliminar">Vas a eliminar el mensaje "{{ porEliminar.asunto }}" de {{ porEliminar.nombre }}.</p>
    </ModalConfirmacion>
  </div>
</template>
