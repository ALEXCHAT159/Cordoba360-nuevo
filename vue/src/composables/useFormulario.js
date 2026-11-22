import { reactive, watch, nextTick } from "vue";

// Validación reactiva de formularios.
// En el Avance 2 esto se hacía con addEventListener y la API validity del
// navegador. Aquí los valores viven en un objeto reactivo (unido a los
// campos con v-model) y los errores se recalculan solos cuando cambian.
//
// Uso:
//   const form = useFormulario({ nombre: "" }, { nombre: [requerido("El nombre")] });
//   <input v-model="form.valores.nombre" @blur="form.tocar('nombre')" :class="form.clase('nombre')">
//   <p class="error-campo">{{ form.errores.nombre }}</p>

export function useFormulario(valoresIniciales, reglas = {}) {
  const valores = reactive({ ...valoresIniciales });
  const errores = reactive({});
  const tocados = reactive({});

  function validar(campo) {
    const valor = valores[campo];
    let mensaje = "";
    for (const regla of reglas[campo] || []) {
      mensaje = regla(valor, valores);
      if (mensaje) break;
    }
    errores[campo] = mensaje;
    return !mensaje;
  }

  function tocar(campo) {
    tocados[campo] = true;
    validar(campo);
  }

  // Mientras se escribe: valida si el campo ya fue tocado o lleva más de 2 caracteres
  Object.keys(reglas).forEach((campo) => {
    watch(
      () => valores[campo],
      (valor) => {
        const largo = typeof valor === "string" ? valor.length : 1;
        if (tocados[campo] || largo > 2) tocar(campo);
      },
      { deep: true }
    );
  });

  function validarTodo() {
    let primeroMalo = null;
    Object.keys(reglas).forEach((campo) => {
      tocados[campo] = true;
      if (!validar(campo) && !primeroMalo) primeroMalo = campo;
    });
    return primeroMalo; // null si todo está bien
  }

  // Clases que usa styles.css para pintar el borde rojo o verde
  function clase(campo) {
    if (!tocados[campo]) return {};
    const valor = valores[campo];
    const vacio = valor === "" || valor === null || valor === false;
    return { "es-invalido": Boolean(errores[campo]), "es-valido": !errores[campo] && !vacio };
  }

  async function limpiar(nuevosValores = valoresIniciales) {
    Object.assign(valores, nuevosValores);
    await nextTick(); // espera a que los watchers corran antes de borrar los errores
    Object.keys(errores).forEach((c) => (errores[c] = ""));
    Object.keys(tocados).forEach((c) => (tocados[c] = false));
  }

  return { valores, errores, tocados, tocar, validar, validarTodo, clase, limpiar };
}

/* ---------- Reglas reutilizables ---------- */
export const requerido = (nombre = "Este campo") => (v) =>
  v === "" || v === null || v === undefined || (Array.isArray(v) && !v.length) ? `${nombre} es obligatorio.` : "";

export const marcado = () => (v) => (v ? "" : "Debes marcar esta casilla para continuar.");

export const minLargo = (n, nombre = "Este campo") => (v) =>
  v && v.length < n ? `${nombre} debe tener al menos ${n} caracteres (llevas ${v.length}).` : "";

export const maxLargo = (n, nombre = "Este campo") => (v) =>
  v && v.length > n ? `${nombre} admite máximo ${n} caracteres.` : "";

export const patron = (expresion, mensaje) => (v) => (v && !expresion.test(v) ? mensaje : "");

export const correo = () =>
  patron(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Escribe un correo válido, por ejemplo nombre@correo.com.");

export const fechaEntre = (min, max, mensajeMin, mensajeMax) => (v) => {
  if (!v) return "";
  const minimo = typeof min === "function" ? min() : min;
  const maximo = typeof max === "function" ? max() : max;
  if (minimo && v < minimo) return mensajeMin;
  if (maximo && v > maximo) return mensajeMax;
  return "";
};

export const numeroEntre = (min, max, mensajeMin, mensajeMax) => (v) => {
  if (v === "" || v === null) return "";
  const n = Number(v);
  if (Number.isNaN(n)) return "El valor escrito no es válido.";
  if (n < min) return mensajeMin;
  if (n > max) return mensajeMax;
  return "";
};
