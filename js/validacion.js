/* ==========================================================
   Córdoba 360 · Validación en tiempo real de formularios
   Usa los atributos nativos del HTML (required, pattern, min, max,
   type="email"...) y la API de validación del navegador, pero muestra
   los mensajes propios debajo de cada campo mientras se escribe.
   ========================================================== */

const Validacion = (() => {
  // Mensaje según el tipo de error que reporta validity
  function mensajeDeError(campo) {
    const v = campo.validity;
    const nombre = campo.dataset.nombre || "Este campo";

    if (v.valueMissing) {
      return campo.type === "checkbox" ? "Debes marcar esta casilla para continuar." : `${nombre} es obligatorio.`;
    }
    if (v.typeMismatch && campo.type === "email") return "Escribe un correo válido, por ejemplo nombre@correo.com.";
    if (v.tooShort) return `${nombre} debe tener al menos ${campo.minLength} caracteres (llevas ${campo.value.length}).`;
    if (v.tooLong) return `${nombre} admite máximo ${campo.maxLength} caracteres.`;
    if (v.patternMismatch) return campo.dataset.errorPatron || campo.title || "El formato no es válido.";
    if (v.rangeUnderflow) return campo.dataset.errorMin || `El valor mínimo es ${campo.min}.`;
    if (v.rangeOverflow) return campo.dataset.errorMax || `El valor máximo es ${campo.max}.`;
    if (v.badInput) return "El valor escrito no es válido.";
    if (v.customError) return campo.validationMessage;
    return "";
  }

  // Crea (una sola vez) el párrafo donde va el error de cada campo
  function cajaError(campo) {
    let caja = document.getElementById(`error-${campo.id}`);
    if (!caja) {
      caja = document.createElement("p");
      caja.className = "error-campo";
      caja.id = `error-${campo.id}`;
      caja.setAttribute("aria-live", "polite");
      const destino = campo.closest(".campo, .casilla") || campo;
      destino.after(caja);
      campo.setAttribute("aria-describedby", caja.id);
    }
    return caja;
  }

  function validarCampo(campo) {
    const mensaje = mensajeDeError(campo);
    const caja = cajaError(campo);
    caja.textContent = mensaje;
    campo.classList.toggle("es-invalido", Boolean(mensaje));
    campo.classList.toggle("es-valido", !mensaje && campo.value !== "" && campo.type !== "checkbox");
    campo.setAttribute("aria-invalid", Boolean(mensaje));
    return !mensaje;
  }

  // Conecta un formulario: valida al escribir (input), al salir (blur) y al cambiar (change)
  function conectar(formulario, validacionesExtra = {}) {
    formulario.noValidate = true; // los mensajes los mostramos nosotros
    const campos = [...formulario.querySelectorAll("input, select, textarea")].filter((c) => c.id);
    const tocados = new Set();

    function revisar(campo) {
      if (validacionesExtra[campo.id]) {
        campo.setCustomValidity(validacionesExtra[campo.id](campo) || "");
      }
      return validarCampo(campo);
    }

    campos.forEach((campo) => {
      campo.addEventListener("blur", () => { tocados.add(campo); revisar(campo); });
      campo.addEventListener("input", () => { if (tocados.has(campo) || campo.value.length > 2) { tocados.add(campo); revisar(campo); } });
      campo.addEventListener("change", () => { tocados.add(campo); revisar(campo); });
    });

    return {
      validarTodo() {
        let primeroMalo = null;
        campos.forEach((campo) => {
          tocados.add(campo);
          if (!revisar(campo) && !primeroMalo) primeroMalo = campo;
        });
        if (primeroMalo) primeroMalo.focus();
        return !primeroMalo;
      },
      revisar,
      limpiar() {
        tocados.clear();
        campos.forEach((campo) => {
          campo.classList.remove("es-invalido", "es-valido");
          campo.removeAttribute("aria-invalid");
          const caja = document.getElementById(`error-${campo.id}`);
          if (caja) caja.textContent = "";
        });
      }
    };
  }

  // Fecha de hoy en formato AAAA-MM-DD (hora local)
  function hoyISO(desplazamientoAnios = 0) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + desplazamientoAnios);
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  return { conectar, validarCampo, hoyISO };
})();
