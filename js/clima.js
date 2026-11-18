/* ==========================================================
   Córdoba 360 · Clima en vivo de San Antero
   Consume la API REST pública de Open-Meteo (no necesita clave)
   con fetch + async/await y muestra el clima actual y 3 días.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("clima-contenido");
  const resumen = document.getElementById("clima-resumen");
  if (!contenedor) return;

  const URL_CLIMA =
    "https://api.open-meteo.com/v1/forecast?latitude=9.374&longitude=-75.759" +
    "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
    "&timezone=America%2FBogota&forecast_days=3";

  // Códigos WMO que usa Open-Meteo, agrupados
  function describirCodigo(codigo) {
    if (codigo === 0) return { texto: "Despejado", icono: "☀️" };
    if (codigo <= 2) return { texto: "Parcialmente nublado", icono: "🌤️" };
    if (codigo === 3) return { texto: "Nublado", icono: "☁️" };
    if (codigo <= 48) return { texto: "Neblina", icono: "🌫️" };
    if (codigo <= 67 || (codigo >= 80 && codigo <= 82)) return { texto: "Lluvia", icono: "🌧️" };
    if (codigo >= 95) return { texto: "Tormenta", icono: "⛈️" };
    return { texto: "Variable", icono: "🌥️" };
  }

  function nombreDia(fechaISO, indice) {
    if (indice === 0) return "Hoy";
    const fecha = new Date(`${fechaISO}T12:00:00`);
    const dia = fecha.toLocaleDateString("es-CO", { weekday: "long" });
    return dia.charAt(0).toUpperCase() + dia.slice(1);
  }

  function pintarClima(datos) {
    const actual = datos.current;
    const estado = describirCodigo(actual.weather_code);
    const temperatura = Math.round(actual.temperature_2m);

    contenedor.innerHTML = "";

    const ahora = document.createElement("div");
    ahora.className = "clima__ahora";
    ahora.innerHTML = `
      <span class="clima__icono" aria-hidden="true">${estado.icono}</span>
      <div>
        <strong class="clima__temp">${temperatura} °C</strong>
        <p>${estado.texto}</p>
      </div>
      <ul class="clima__detalles">
        <li>Humedad: ${actual.relative_humidity_2m} %</li>
        <li>Viento: ${Math.round(actual.wind_speed_10m)} km/h</li>
      </ul>`;

    const dias = document.createElement("ul");
    dias.className = "clima__dias";
    datos.daily.time.forEach((fecha, i) => {
      const dia = describirCodigo(datos.daily.weather_code[i]);
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${nombreDia(fecha, i)}</span>
        <span aria-hidden="true">${dia.icono}</span>
        <span>${Math.round(datos.daily.temperature_2m_max[i])}° / ${Math.round(datos.daily.temperature_2m_min[i])}°</span>`;
      li.title = dia.texto;
      dias.append(li);
    });

    contenedor.append(ahora, dias);
    if (resumen) resumen.textContent = `Ahora ${temperatura} °C, ${estado.texto.toLowerCase()}`;
  }

  async function cargarClima() {
    C360.mostrarCargando(contenedor, "Consultando el clima...");
    try {
      const datos = await C360.obtenerJSON(URL_CLIMA);
      pintarClima(datos);
    } catch (error) {
      C360.mostrarError(contenedor, error.message, cargarClima);
    }
  }

  cargarClima();
});
