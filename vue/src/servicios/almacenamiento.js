// Lectura y escritura en localStorage con JSON.
// Si el navegador bloquea el almacenamiento (modo privado) o el JSON
// está dañado, se devuelve el valor por defecto y la app sigue funcionando.

export const CLAVES = {
  favoritos: "c360_favoritos",
  mensajes: "c360_mensajes",
  usuarios: "c360_usuarios",
  sesion: "c360_sesion"
};

export function leer(clave, valorPorDefecto) {
  try {
    const texto = localStorage.getItem(clave);
    return texto === null ? valorPorDefecto : JSON.parse(texto);
  } catch (error) {
    console.warn(`No se pudo leer "${clave}" de localStorage`, error);
    return valorPorDefecto;
  }
}

export function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.warn(`No se pudo guardar "${clave}" en localStorage`, error);
    return false;
  }
}

export function borrar(clave) {
  try { localStorage.removeItem(clave); } catch { /* sin acceso */ }
}
