// Funciones pequeñas que usan varias vistas

// Ruta de un archivo de la carpeta public/ respetando la base del sitio
// (en GitHub Pages la app vive en /Cordoba360-nuevo/vue/)
export function rutaPublica(archivo) {
  return `${import.meta.env.BASE_URL}${archivo}`;
}

export function rutaImagen(nombre, extension = "jpg") {
  return rutaPublica(`img/${nombre}.${extension}`);
}

// Quita tildes y pasa a minúsculas: "Montería" → "monteria"
export function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Fecha de hoy en formato AAAA-MM-DD (hora local), con años de desplazamiento
export function hoyISO(desplazamientoAnios = 0) {
  const d = new Date();
  d.setFullYear(d.getFullYear() + desplazamientoAnios);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function formatearFecha(iso) {
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

// Hash SHA-256 de la contraseña: nunca se guarda en texto plano
export async function hashear(texto) {
  if (window.crypto && crypto.subtle) {
    const bytes = new TextEncoder().encode(texto);
    const resumen = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(resumen)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) | 0;
  return `simple-${h}`;
}
