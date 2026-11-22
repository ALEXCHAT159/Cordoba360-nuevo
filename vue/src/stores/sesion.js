import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { CLAVES, leer, guardar, borrar } from "@/servicios/almacenamiento";
import { hashear } from "@/servicios/utilidades";

// Usuarios registrados y sesión activa (simulación académica en localStorage;
// un sitio real validaría en un servidor).
export const useSesionStore = defineStore("sesion", () => {
  const usuarios = ref(leer(CLAVES.usuarios, []));
  const usuario = ref(leer(CLAVES.sesion, null));
  const haySesion = computed(() => usuario.value !== null);

  function correoRegistrado(correo) {
    const c = correo.trim().toLowerCase();
    return usuarios.value.some((u) => u.correo === c);
  }

  function abrirSesion(u) {
    usuario.value = { nombre: u.nombre, correo: u.correo };
    guardar(CLAVES.sesion, usuario.value);
  }

  async function registrar(datos) {
    const nuevo = {
      ...datos,
      correo: datos.correo.trim().toLowerCase(),
      clave: await hashear(datos.clave),
      creado: new Date().toISOString()
    };
    usuarios.value.push(nuevo);
    guardar(CLAVES.usuarios, usuarios.value);
    abrirSesion(nuevo);
    return nuevo;
  }

  // Devuelve el usuario si el correo y la contraseña coinciden, o null
  async function iniciar(correo, clave) {
    const c = correo.trim().toLowerCase();
    const hash = await hashear(clave);
    const encontrado = usuarios.value.find((u) => u.correo === c && u.clave === hash);
    if (encontrado) abrirSesion(encontrado);
    return encontrado || null;
  }

  function cerrar() {
    usuario.value = null;
    borrar(CLAVES.sesion);
  }

  return { usuarios, usuario, haySesion, correoRegistrado, registrar, iniciar, cerrar };
});
