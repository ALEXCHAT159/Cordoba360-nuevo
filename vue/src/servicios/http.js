// Peticiones con fetch + async/await y manejo de errores HTTP.
// Viene de utilidades.js del Avance 2, ahora como módulo ES.

export class ErrorHttp extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.name = "ErrorHttp";
    this.estado = estado;
  }
}

function mensajePorEstado(estado) {
  if (estado === 404) return "No encontramos la información solicitada (error 404).";
  if (estado >= 500) return `El servidor tuvo un problema (error ${estado}). Intenta de nuevo en unos minutos.`;
  if (estado >= 400) return `La petición no es válida (error ${estado}).`;
  return `Respuesta inesperada del servidor (código ${estado}).`;
}

export async function obtenerJSON(url, { tiempoLimite = 10000 } = {}) {
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
