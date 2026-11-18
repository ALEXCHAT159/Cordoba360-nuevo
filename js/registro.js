/* ==========================================================
   Córdoba 360 · Registro e inicio de sesión
   - Validación en tiempo real, con reglas extra: edad mínima,
     confirmación de contraseña y correo no repetido
   - Medidor de fuerza de la contraseña (evento input)
   - Los usuarios se guardan en localStorage; la contraseña se guarda
     como hash SHA-256, nunca en texto plano
   Nota: es una simulación académica; un sitio real valida en el servidor.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const formRegistro = document.getElementById("form-registro");
  const formLogin = document.getElementById("form-login");
  const clave = document.getElementById("r-clave");
  const barra = document.getElementById("barra-fuerza");
  const textoFuerza = document.getElementById("texto-fuerza");
  const nacimiento = document.getElementById("r-nacimiento");

  // Mayor de 18: la fecha máxima es hoy menos 18 años
  nacimiento.max = Validacion.hoyISO(-18);

  const usuarios = () => C360.leer(C360.CLAVES.usuarios, []);

  /* ---------- Hash de la contraseña ---------- */
  async function hashear(texto) {
    if (window.crypto && crypto.subtle) {
      const bytes = new TextEncoder().encode(texto);
      const resumen = await crypto.subtle.digest("SHA-256", bytes);
      return [...new Uint8Array(resumen)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    // Respaldo si el navegador no tiene crypto.subtle
    let h = 0;
    for (const c of texto) h = (h * 31 + c.charCodeAt(0)) | 0;
    return `simple-${h}`;
  }

  /* ---------- Medidor de fuerza ---------- */
  function calcularFuerza(valor) {
    let puntos = 0;
    if (valor.length >= 8) puntos++;
    if (valor.length >= 12) puntos++;
    if (/[A-Z]/.test(valor) && /[a-z]/.test(valor)) puntos++;
    if (/[0-9]/.test(valor)) puntos++;
    if (/[^A-Za-z0-9]/.test(valor)) puntos++;
    return puntos;
  }

  const NIVELES = [
    { texto: "Al menos 8 caracteres, una mayúscula y un número.", clase: "" },
    { texto: "Muy débil", clase: "fuerza--1" },
    { texto: "Débil", clase: "fuerza--2" },
    { texto: "Aceptable", clase: "fuerza--3" },
    { texto: "Buena", clase: "fuerza--4" },
    { texto: "Muy buena", clase: "fuerza--5" }
  ];

  clave.addEventListener("input", () => {
    const nivel = clave.value ? Math.max(1, calcularFuerza(clave.value)) : 0;
    barra.parentElement.className = `fuerza ${NIVELES[nivel].clase}`;
    barra.style.width = `${nivel * 20}%`;
    textoFuerza.textContent = nivel ? `Seguridad: ${NIVELES[nivel].texto}` : NIVELES[0].texto;
    // Si ya escribió la confirmación, se vuelve a comparar
    const confirmacion = document.getElementById("r-clave2");
    if (confirmacion.value) validadorRegistro.revisar(confirmacion);
  });

  /* ---------- Registro ---------- */
  const validadorRegistro = Validacion.conectar(formRegistro, {
    "r-clave2": (campo) => (campo.value && campo.value !== clave.value ? "Las contraseñas no coinciden." : ""),
    "r-correo": (campo) => {
      const correo = campo.value.trim().toLowerCase();
      return usuarios().some((u) => u.correo === correo) ? "Ya existe una cuenta con este correo. Inicia sesión." : "";
    }
  });

  formRegistro.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!validadorRegistro.validarTodo()) {
      C360.avisar("Revisa los campos marcados en rojo.", "error");
      return;
    }

    const datos = new FormData(formRegistro);
    const nuevo = {
      nombre: datos.get("nombres").trim(),
      apellido: datos.get("apellidos").trim(),
      correo: datos.get("correo").trim().toLowerCase(),
      celular: datos.get("celular"),
      nacimiento: datos.get("nacimiento"),
      origen: datos.get("origen").trim(),
      intereses: datos.getAll("intereses"),
      clave: await hashear(datos.get("clave")),
      creado: new Date().toISOString()
    };

    const lista = usuarios();
    lista.push(nuevo);
    C360.guardar(C360.CLAVES.usuarios, lista);
    C360.guardar(C360.CLAVES.sesion, { nombre: nuevo.nombre, correo: nuevo.correo });

    C360.avisar(`¡Bienvenido, ${nuevo.nombre}! Tu cuenta quedó creada.`);
    setTimeout(() => { location.href = "index.html"; }, 1500);
  });

  /* ---------- Inicio de sesión ---------- */
  const validadorLogin = Validacion.conectar(formLogin);
  const errorLogin = document.createElement("p");
  errorLogin.className = "error-campo";
  errorLogin.setAttribute("role", "alert");
  formLogin.querySelector("button[type=submit]").before(errorLogin);

  formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    errorLogin.textContent = "";
    if (!validadorLogin.validarTodo()) return;

    const correo = formLogin.elements.correo.value.trim().toLowerCase();
    const hash = await hashear(formLogin.elements.clave.value);
    const usuario = usuarios().find((u) => u.correo === correo);

    if (!usuario || usuario.clave !== hash) {
      errorLogin.textContent = "El correo o la contraseña no coinciden.";
      formLogin.elements.clave.value = "";
      formLogin.elements.clave.focus();
      return;
    }

    C360.guardar(C360.CLAVES.sesion, { nombre: usuario.nombre, correo: usuario.correo });
    C360.avisar(`Hola de nuevo, ${usuario.nombre}.`);
    setTimeout(() => { location.href = "index.html"; }, 1200);
  });

  // Si ya hay sesión, se avisa en lugar de mostrar los formularios vacíos
  const sesion = C360.leer(C360.CLAVES.sesion, null);
  if (sesion) {
    const aviso = document.createElement("p");
    aviso.className = "estado estado--info";
    aviso.textContent = `Ya iniciaste sesión como ${sesion.nombre} (${sesion.correo}).`;
    document.querySelector(".contacto-intro").append(aviso);
  }
});
