/* ==========================================================
   Córdoba 360 · Página de destinos
   1. Carga data/destinos.json con fetch (async/await)
   2. Pinta las tarjetas creando elementos en el DOM
   3. Filtra en tiempo real (input), por categoría (click) y ordena (change)
   4. Guarda los favoritos en localStorage
   Para probar el manejo de errores: destinos.html?fuente=data/no-existe.json
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("lista-destinos");
  const resultado = document.getElementById("resultado");
  const buscador = document.getElementById("buscar-destino");
  const selectOrden = document.getElementById("ordenar");
  const botonesFiltro = document.querySelectorAll(".filtro");
  const contadorFavoritos = document.getElementById("contador-favoritos");

  const parametros = new URLSearchParams(location.search);
  const fuente = parametros.get("fuente") || "data/destinos.json";

  // Estado de la vista
  let destinos = [];
  let categoria = "todas";
  let favoritos = C360.leer(C360.CLAVES.favoritos, []);

  // Si llega una búsqueda desde la lupa del encabezado (?q=...), se usa
  buscador.value = parametros.get("q") || "";

  /* ---------- Carga de datos ---------- */
  async function cargarDestinos() {
    C360.mostrarCargando(lista, "Cargando destinos...");
    resultado.textContent = "";
    try {
      const datos = await C360.obtenerJSON(fuente);
      destinos = datos.destinos;
      pintar();
    } catch (error) {
      C360.mostrarError(lista, error.message, cargarDestinos);
    }
  }

  /* ---------- Filtros y orden ---------- */
  function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function destinosVisibles() {
    const termino = normalizar(buscador.value.trim());

    const filtrados = destinos.filter((d) => {
      const enCategoria =
        categoria === "todas" ||
        (categoria === "favoritos" ? favoritos.includes(d.id) : d.categoria === categoria);
      const texto = normalizar([d.nombre, d.descripcion, ...d.etiquetas].join(" "));
      return enCategoria && texto.includes(termino);
    });

    const orden = selectOrden.value;
    return filtrados.sort((a, b) => {
      if (orden === "distancia") return a.kmDesdeMonteria - b.kmDesdeMonteria;
      const comparacion = a.nombre.localeCompare(b.nombre, "es");
      return orden === "nombre-desc" ? -comparacion : comparacion;
    });
  }

  /* ---------- Pintar tarjetas ---------- */
  function crearTarjeta(destino) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "ficha";
    tarjeta.dataset.id = destino.id;

    const picture = document.createElement("picture");
    const webp = document.createElement("source");
    webp.srcset = `img/${destino.imagen}.webp`;
    webp.type = "image/webp";
    const img = document.createElement("img");
    img.src = `img/${destino.imagen}.jpg`;
    img.alt = destino.alt;
    img.loading = "lazy";
    picture.append(webp, img);

    const esFavorito = favoritos.includes(destino.id);
    const corazon = document.createElement("button");
    corazon.type = "button";
    corazon.className = "btn-favorito";
    corazon.setAttribute("aria-pressed", esFavorito);
    corazon.setAttribute("aria-label", `${esFavorito ? "Quitar" : "Agregar"} ${destino.nombre} ${esFavorito ? "de" : "a"} favoritos`);
    corazon.textContent = esFavorito ? "♥" : "♡";

    const cuerpo = document.createElement("div");
    cuerpo.className = "ficha__cuerpo";

    const titulo = document.createElement("h3");
    titulo.textContent = destino.nombre;

    const descripcion = document.createElement("p");
    descripcion.textContent = destino.descripcion;

    const etiquetas = document.createElement("div");
    etiquetas.className = "etiquetas";
    destino.etiquetas.forEach((texto) => {
      const span = document.createElement("span");
      span.textContent = texto;
      etiquetas.append(span);
    });

    const distancia = document.createElement("small");
    distancia.className = "distancia";
    distancia.textContent = destino.kmDesdeMonteria === 0
      ? "Capital del departamento"
      : `A unos ${destino.kmDesdeMonteria} km de Montería`;

    cuerpo.append(titulo, descripcion, etiquetas, distancia);

    if (destino.detalle) {
      const enlace = document.createElement("a");
      enlace.className = "btn";
      enlace.href = destino.detalle;
      enlace.textContent = "Ver destino →";
      cuerpo.append(enlace);
    }

    tarjeta.append(picture, corazon, cuerpo);
    return tarjeta;
  }

  function pintar() {
    const visibles = destinosVisibles();
    lista.innerHTML = "";
    contadorFavoritos.textContent = favoritos.length;

    if (visibles.length === 0) {
      const vacio = document.createElement("p");
      vacio.className = "estado";
      vacio.textContent = categoria === "favoritos" && favoritos.length === 0
        ? "Todavía no tienes favoritos. Toca el corazón de un destino para guardarlo."
        : "No hay destinos que coincidan con tu búsqueda.";
      lista.append(vacio);
    } else {
      visibles.forEach((d) => lista.append(crearTarjeta(d)));
    }

    resultado.textContent = `${visibles.length} de ${destinos.length} destinos`;
  }

  /* ---------- Favoritos ---------- */
  function alternarFavorito(id) {
    const destino = destinos.find((d) => d.id === id);
    if (favoritos.includes(id)) {
      favoritos = favoritos.filter((f) => f !== id);
      C360.avisar(`${destino.nombre} salió de tus favoritos.`, "info");
    } else {
      favoritos.push(id);
      C360.avisar(`${destino.nombre} quedó en tus favoritos.`);
    }
    C360.guardar(C360.CLAVES.favoritos, favoritos);
    pintar();
  }

  /* ---------- Eventos ---------- */
  buscador.addEventListener("input", pintar);
  selectOrden.addEventListener("change", pintar);

  botonesFiltro.forEach((boton) => {
    boton.addEventListener("click", () => {
      categoria = boton.dataset.categoria;
      botonesFiltro.forEach((b) => b.setAttribute("aria-pressed", b === boton));
      pintar();
    });
  });

  // Delegación: un solo listener para todos los corazones
  lista.addEventListener("click", (evento) => {
    const corazon = evento.target.closest(".btn-favorito");
    if (corazon) alternarFavorito(corazon.closest(".ficha").dataset.id);
  });

  // Si otra pestaña cambia los favoritos, se actualiza esta
  window.addEventListener("storage", (evento) => {
    if (evento.key === C360.CLAVES.favoritos) {
      favoritos = C360.leer(C360.CLAVES.favoritos, []);
      if (destinos.length) pintar();
    }
  });

  cargarDestinos();
});
