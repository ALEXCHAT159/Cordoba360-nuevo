<script setup>
import { ref, computed, watch } from "vue";
import { obtenerJSON } from "@/servicios/http";
import EstadoCarga from "./EstadoCarga.vue";

// Clima en vivo de un destino con la API pública de Open-Meteo.
// Recibe la latitud y longitud por props y, cuando llegan los datos,
// avisa al padre con el evento "actualizado" para que muestre el resumen.
const props = defineProps({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  lugar: { type: String, required: true }
});
const emit = defineEmits(["actualizado"]);

const datos = ref(null);
const estado = ref("cargando");
const error = ref("");

const url = computed(() =>
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${props.lat}&longitude=${props.lon}` +
  "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
  "&timezone=America%2FBogota&forecast_days=3"
);

// Códigos WMO que usa Open-Meteo, agrupados
function describir(codigo) {
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
  const dia = new Date(`${fechaISO}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long" });
  return dia.charAt(0).toUpperCase() + dia.slice(1);
}

const actual = computed(() => {
  if (!datos.value) return null;
  const c = datos.value.current;
  return {
    temperatura: Math.round(c.temperature_2m),
    humedad: c.relative_humidity_2m,
    viento: Math.round(c.wind_speed_10m),
    ...describir(c.weather_code)
  };
});

const dias = computed(() => {
  if (!datos.value) return [];
  const d = datos.value.daily;
  return d.time.map((fecha, i) => ({
    fecha,
    nombre: nombreDia(fecha, i),
    maxima: Math.round(d.temperature_2m_max[i]),
    minima: Math.round(d.temperature_2m_min[i]),
    ...describir(d.weather_code[i])
  }));
});

async function cargar() {
  estado.value = "cargando";
  try {
    datos.value = await obtenerJSON(url.value);
    estado.value = "listo";
    emit("actualizado", `Ahora ${actual.value.temperatura} °C, ${actual.value.texto.toLowerCase()}`);
  } catch (e) {
    error.value = e.message;
    estado.value = "error";
  }
}

// Se vuelve a consultar si cambia el destino (por ejemplo, al pasar de
// San Antero a Lorica sin salir de la vista de detalle)
watch(url, cargar, { immediate: true });
</script>

<template>
  <section class="clima" aria-labelledby="titulo-clima">
    <h3 id="titulo-clima">El clima ahora en {{ lugar }}</h3>
    <EstadoCarga v-if="estado !== 'listo'" :estado="estado" :mensaje="error" texto-carga="Consultando el clima..." @reintentar="cargar" />
    <template v-else>
      <div class="clima__ahora">
        <span class="clima__icono" aria-hidden="true">{{ actual.icono }}</span>
        <div>
          <strong class="clima__temp">{{ actual.temperatura }} °C</strong>
          <p>{{ actual.texto }}</p>
        </div>
        <ul class="clima__detalles">
          <li>Humedad: {{ actual.humedad }} %</li>
          <li>Viento: {{ actual.viento }} km/h</li>
        </ul>
      </div>
      <ul class="clima__dias">
        <li v-for="dia in dias" :key="dia.fecha" :title="dia.texto">
          <span>{{ dia.nombre }}</span>
          <span aria-hidden="true">{{ dia.icono }}</span>
          <span>{{ dia.maxima }}° / {{ dia.minima }}°</span>
        </li>
      </ul>
    </template>
    <p class="clima__fuente">Datos en vivo de <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a></p>
  </section>
</template>
