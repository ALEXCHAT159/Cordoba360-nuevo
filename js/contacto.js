/* ==========================================================
   Córdoba 360 · Formulario de contacto
   - Validación en tiempo real (validacion.js)
   - submit con preventDefault: el mensaje se guarda en localStorage
   - Lista de mensajes guardados: crear, editar y eliminar en el DOM
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("form-contacto");
  const lista = document.getElementById("lista-mensajes");
  const contador = document.getElementById("contador-mensaje");
  const textarea = document.getElementById("mensaje");
  const fecha = document.getElementById("fecha");
  const btnEnviar = document.getElementById("btn-enviar");
  const btnCancelar = document.getElementById("btn-cancelar");
  const btnBorrarTodos = document.getElementById("btn-borrar-todos");

  // La fecha mínima es hoy, no una fecha fija
  fecha.min = Validacion.hoyISO();

  const validador = Validacion.conectar(formulario);
  let mensajes = C360.leer(C360.CLAVES.mensajes, []);
  let editandoId = null;

  /* ---------- Contador de caracteres (evento input) ---------- */
  function actualizarContador() {
    const largo = textarea.value.length;
    contador.textContent = largo;
    contador.parentElement.classList.toggle("ayuda--alerta", largo > 450);
  }
  textarea.addEventListener("input", actualizarContador);

  /* ---------- Pintar la lista ---------- */
  function formatearFecha(iso) {
    return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
  }

  function crearItem(m) {
    const li = document.createElement("li");
    li.className = "mensaje";
    li.dataset.id = m.id;
    if (m.id === editandoId) li.classList.add("mensaje--editando");

    const cabecera = document.createElement("div");
    cabecera.className = "mensaje__cabecera";
    const asunto = document.createElement("strong");
    asunto.textContent = m.asunto;
    const cuando = document.createElement("time");
    cuando.dateTime = m.creado;
    cuando.textContent = formatearFecha(m.editado || m.creado) + (m.editado ? " (editado)" : "");
    cabecera.append(asunto, cuando);

    const de = document.createElement("p");
    de.className = "mensaje__de";
    de.textContent = `${m.nombre} · ${m.correo}${m.personas ? ` · ${m.personas} viajero(s)` : ""}${m.fecha ? ` · visita el ${m.fecha}` : ""}`;

    const texto = document.createElement("p");
    texto.textContent = m.mensaje;

    const acciones = document.createElement("div");
    acciones.className = "mensaje__acciones";
    const editar = document.createElement("button");
    editar.type = "button";
    editar.className = "btn btn--pildora";
    editar.dataset.accion = "editar";
    editar.textContent = "Editar";
    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.className = "btn btn--pildora btn--peligro";
    eliminar.dataset.accion = "eliminar";
    eliminar.textContent = "Eliminar";
    acciones.append(editar, eliminar);

    li.append(cabecera, de, texto, acciones);
    return li;
  }

  function pintarLista() {
    lista.innerHTML = "";
    if (mensajes.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "estado";
      vacio.textContent = "Aún no has enviado mensajes.";
      lista.append(vacio);
    } else {
      // Más recientes primero
      [...mensajes].reverse().forEach((m) => lista.append(crearItem(m)));
    }
    btnBorrarTodos.hidden = mensajes.length < 2;
  }

  /* ---------- Guardar (crear o actualizar) ---------- */
  function datosDelFormulario() {
    const datos = Object.fromEntries(new FormData(formulario));
    return {
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim(),
      telefono: datos.telefono,
      fecha: datos.fecha,
      asunto: datos.asunto,
      personas: Number(datos.personas) || 1,
      mensaje: datos.mensaje.trim()
    };
  }

  function salirDeEdicion() {
    editandoId = null;
    formulario.reset();
    validador.limpiar();
    actualizarContador();
    btnEnviar.textContent = "Enviar";
    btnCancelar.hidden = true;
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validador.validarTodo()) {
      C360.avisar("Revisa los campos marcados en rojo.", "error");
      return;
    }

    const datos = datosDelFormulario();
    if (editandoId) {
      mensajes = mensajes.map((m) => (m.id === editandoId ? { ...m, ...datos, editado: new Date().toISOString() } : m));
      C360.avisar("Mensaje actualizado.");
    } else {
      mensajes.push({ id: Date.now().toString(36), ...datos, creado: new Date().toISOString() });
      C360.avisar(`Gracias, ${datos.nombre.split(" ")[0]}. Tu mensaje quedó guardado.`);
    }

    C360.guardar(C360.CLAVES.mensajes, mensajes);
    salirDeEdicion();
    pintarLista();
  });

  btnCancelar.addEventListener("click", () => {
    salirDeEdicion();
    pintarLista();
  });

  /* ---------- Editar y eliminar (delegación de eventos) ---------- */
  lista.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;
    const id = boton.closest(".mensaje").dataset.id;
    const mensaje = mensajes.find((m) => m.id === id);

    if (boton.dataset.accion === "eliminar") {
      const item = boton.closest(".mensaje");
      item.classList.add("mensaje--saliendo");
      setTimeout(() => {
        mensajes = mensajes.filter((m) => m.id !== id);
        C360.guardar(C360.CLAVES.mensajes, mensajes);
        if (editandoId === id) salirDeEdicion();
        pintarLista();
        C360.avisar("Mensaje eliminado.", "info");
      }, 250);
    }

    if (boton.dataset.accion === "editar") {
      editandoId = id;
      ["nombre", "correo", "telefono", "fecha", "asunto", "personas", "mensaje"].forEach((campo) => {
        formulario.elements[campo].value = mensaje[campo] ?? "";
      });
      formulario.elements.acepto.checked = true;
      validador.limpiar();
      actualizarContador();
      btnEnviar.textContent = "Guardar cambios";
      btnCancelar.hidden = false;
      pintarLista();
      formulario.scrollIntoView({ behavior: "smooth", block: "start" });
      formulario.elements.nombre.focus({ preventScroll: true });
    }
  });

  btnBorrarTodos.addEventListener("click", () => {
    mensajes = [];
    C360.guardar(C360.CLAVES.mensajes, mensajes);
    salirDeEdicion();
    pintarLista();
    C360.avisar("Se borraron todos los mensajes.", "info");
  });

  pintarLista();
  actualizarContador();
});
