/* ==========================================================
   Córdoba 360 · Utilidades compartidas
   - Persistencia en localStorage (leer / guardar JSON)
   - Peticiones HTTP con fetch + async/await y manejo de estados
   - Mensajes visuales: cargando, error y avisos (toast)
   - Saludo del usuario en el encabezado si hay sesión iniciada
   Se carga en todas las páginas antes del script propio de cada una.
   ========================================================== */

const C360 = (() => {
  /* ---------- Claves de localStorage ---------- */
  const CLAVES = {
    favoritos: "c360_favoritos",
    mensajes: "c360_mensajes",
    usuarios: "c360_usuarios",
    sesion: "c360_sesion"
  };

  /* ---------- Persistencia ---------- */
  function leer(clave, valorPorDefecto) {
    try {
      const texto = localStorage.getItem(clave);
      return texto === null ? valorPorDefecto : JSON.parse(texto);
    } catch (error) {
      // JSON dañado o almacenamiento bloqueado (modo privado)
      console.warn(`No se pudo leer "${clave}" de localStorage`, error);
      return valorPorDefecto;
    }
  }

  function guardar(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (error) {
      console.warn(`No se pudo guardar "${clave}" en localStorage`, error);
      avisar("No se pudo guardar en este navegador.", "error");
      return false;
    }
  }

  function borrar(clave) {
    try { localStorage.removeItem(clave); } catch (error) { /* sin acceso */ }
  }

  /* ---------- Peticiones HTTP ---------- */
  class ErrorHttp extends Error {
    constructor(estado, mensaje) {
      super(mensaje);
      this.name = "ErrorHttp";
      this.estado = estado;
    }
  }

  // Traduce el código de estado a un mensaje que entienda el visitante
  function mensajePorEstado(estado) {
    if (estado === 404) return "No encontramos la información solicitada (error 404).";
    if (estado >= 500) return `El servidor tuvo un problema (error ${estado}). Intenta de nuevo en unos minutos.`;
    if (estado >= 400) return `La petición no es válida (error ${estado}).`;
    return `Respuesta inesperada del servidor (código ${estado}).`;
  }

  async function obtenerJSON(url, { tiempoLimite = 10000 } = {}) {
    // Si la página se abrió con doble clic (file://) el navegador bloquea fetch
    if (location.protocol === "file:" && !/^https?:/.test(url)) {
      throw new ErrorHttp(0, "Abre el sitio con Live Server o desde GitHub Pages: el navegador no deja leer archivos locales con fetch.");
    }

    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), tiempoLimite);

    try {
      const respuesta = await fetch(url, { signal: control.signal });
      if (respuesta.status !== 200) {
        throw new ErrorHttp(respuesta.status, mensajePorEstado(respuesta.status));
      }
      return await respuesta.json();
    } catch (error) {
      if (error instanceof ErrorHttp) throw error;
      if (error.name === "AbortError") {
        throw new ErrorHttp(0, "La petición tardó demasiado. Revisa tu conexión e intenta de nuevo.");
      }
      if (error instanceof SyntaxError) {
        throw new ErrorHttp(0, "Los datos recibidos no tienen un formato válido.");
      }
      throw new ErrorHttp(0, "No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.");
    } finally {
      clearTimeout(temporizador);
    }
  }

  /* ---------- Estados visuales ---------- */
  function mostrarCargando(contenedor, texto = "Cargando...") {
    contenedor.innerHTML = "";
    const caja = document.createElement("div");
    caja.className = "estado estado--cargando";
    caja.setAttribute("role", "status");
    const giro = document.createElement("span");
    giro.className = "spinner";
    giro.setAttribute("aria-hidden", "true");
    const p = document.createElement("p");
    p.textContent = texto;
    caja.append(giro, p);
    contenedor.append(caja);
  }

  function mostrarError(contenedor, mensaje, alReintentar) {
    contenedor.innerHTML = "";
    const caja = document.createElement("div");
    caja.className = "estado estado--error";
    caja.setAttribute("role", "alert");
    const titulo = document.createElement("strong");
    titulo.textContent = "Algo salió mal";
    const p = document.createElement("p");
    p.textContent = mensaje;
    caja.append(titulo, p);
    if (alReintentar) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "btn";
      boton.textContent = "Reintentar";
      boton.addEventListener("click", alReintentar);
      caja.append(boton);
    }
    contenedor.append(caja);
  }

  /* ---------- Avisos flotantes ---------- */
  function avisar(texto, tipo = "ok") {
    let zona = document.querySelector(".avisos");
    if (!zona) {
      zona = document.createElement("div");
      zona.className = "avisos";
      zona.setAttribute("aria-live", "polite");
      document.body.append(zona);
    }
    const aviso = document.createElement("p");
    aviso.className = `aviso aviso--${tipo}`;
    aviso.textContent = texto;
    zona.append(aviso);
    setTimeout(() => aviso.classList.add("aviso--saliendo"), 3200);
    setTimeout(() => aviso.remove(), 3700);
  }

  /* ---------- Sesión en el encabezado ---------- */
  function pintarSesion() {
    const sesion = leer(CLAVES.sesion, null);
    if (!sesion) return;

    document.querySelectorAll(".cuenta, .nav__cuenta").forEach((zona) => {
      zona.innerHTML = "";
      const saludo = document.createElement("span");
      saludo.className = "saludo";
      saludo.textContent = `Hola, ${sesion.nombre}`;
      const salir = document.createElement("button");
      salir.type = "button";
      salir.className = "btn btn--pildora";
      salir.textContent = "Cerrar sesión";
      salir.addEventListener("click", () => {
        borrar(CLAVES.sesion);
        location.reload();
      });
      zona.append(saludo, salir);
    });
  }

  document.addEventListener("DOMContentLoaded", pintarSesion);

  return { CLAVES, leer, guardar, borrar, obtenerJSON, ErrorHttp, mostrarCargando, mostrarError, avisar };
})();
