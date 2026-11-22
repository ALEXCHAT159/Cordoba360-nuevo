<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useSesionStore } from "@/stores/sesion";
import { useAvisosStore } from "@/stores/avisos";
import { useFormulario, requerido, marcado, minLargo, patron, correo, fechaEntre } from "@/composables/useFormulario";
import { hoyISO } from "@/servicios/utilidades";
import MedidorClave from "@/components/MedidorClave.vue";
import ImagenAdaptable from "@/components/ImagenAdaptable.vue";
import IconoSvg from "@/components/IconoSvg.vue";
import { faHeart, faBell, faRoute } from "@/iconos";

const router = useRouter();
const sesion = useSesionStore();
const { usuario } = storeToRefs(sesion);
const { avisar } = useAvisosStore();

const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{2,40}$/;
const maxNacimiento = hoyISO(-18); // mayor de 18 años
const CIUDADES = ["Montería", "Sahagún", "Lorica", "Medellín", "Bogotá", "Cartagena"];
const INTERESES = [
  { valor: "playas", texto: "Playas" },
  { valor: "naturaleza", texto: "Naturaleza" },
  { valor: "cultura", texto: "Cultura" },
  { valor: "gastronomia", texto: "Gastronomía" },
  { valor: "eventos", texto: "Eventos" },
  { valor: "aventura", texto: "Aventura" }
];

/* ---------- Registro ---------- */
const registro = useFormulario(
  { nombre: "", apellido: "", correo: "", celular: "", nacimiento: "", origen: "", clave: "", clave2: "", intereses: [], terminos: false },
  {
    nombre: [requerido("El nombre"), patron(SOLO_LETRAS, "Usa solo letras (mínimo 2).")],
    apellido: [requerido("El apellido"), patron(SOLO_LETRAS, "Usa solo letras (mínimo 2).")],
    correo: [
      requerido("El correo"),
      correo(),
      (v) => (sesion.correoRegistrado(v) ? "Ya existe una cuenta con este correo. Inicia sesión." : "")
    ],
    celular: [requerido("El celular"), patron(/^3\d{9}$/, "Debe tener 10 dígitos y empezar por 3.")],
    nacimiento: [requerido("La fecha de nacimiento"), fechaEntre("1920-01-01", maxNacimiento, "Revisa el año de nacimiento.", "Debes ser mayor de 18 años para registrarte.")],
    origen: [requerido("La ciudad")],
    clave: [requerido("La contraseña"), minLargo(8, "La contraseña"), patron(/(?=.*[A-Z])(?=.*\d)/, "Le falta una mayúscula o un número.")],
    clave2: [requerido("La confirmación"), (v, todos) => (v !== todos.clave ? "Las contraseñas no coinciden." : "")],
    terminos: [marcado()]
  }
);
const r = registro.valores;
const er = registro.errores;

// Si cambia la contraseña y ya hay confirmación escrita, se vuelve a comparar
watch(() => r.clave, () => { if (r.clave2) registro.tocar("clave2"); });

const enviandoRegistro = ref(false);

async function crearCuenta() {
  const campoMalo = registro.validarTodo();
  if (campoMalo) {
    document.getElementById(`r-${campoMalo}`)?.focus();
    avisar("Revisa los campos marcados en rojo.", "error");
    return;
  }
  enviandoRegistro.value = true;
  const nuevo = await sesion.registrar({
    nombre: r.nombre.trim(),
    apellido: r.apellido.trim(),
    correo: r.correo,
    celular: r.celular,
    nacimiento: r.nacimiento,
    origen: r.origen.trim(),
    intereses: [...r.intereses],
    clave: r.clave
  });
  avisar(`¡Bienvenido, ${nuevo.nombre}! Tu cuenta quedó creada.`);
  setTimeout(() => router.push({ name: "inicio" }), 1200);
}

/* ---------- Inicio de sesión ---------- */
const login = useFormulario(
  { correo: "", clave: "" },
  { correo: [requerido("El correo"), correo()], clave: [requerido("La contraseña"), minLargo(8, "La contraseña")] }
);
const errorLogin = ref("");

async function ingresar() {
  errorLogin.value = "";
  const campoMalo = login.validarTodo();
  if (campoMalo) {
    document.getElementById(`l-${campoMalo}`)?.focus();
    return;
  }
  const encontrado = await sesion.iniciar(login.valores.correo, login.valores.clave);
  if (!encontrado) {
    errorLogin.value = "El correo o la contraseña no coinciden.";
    login.valores.clave = "";
    document.getElementById("l-clave")?.focus();
    return;
  }
  avisar(`Hola de nuevo, ${encontrado.nombre}.`);
  setTimeout(() => router.push({ name: "inicio" }), 900);
}
</script>

<template>
  <div class="contacto-fondo">
    <div class="contenedor">
      <header class="contacto-intro">
        <h1>ÚNETE A CÓRDOBA 360</h1>
        <p>Crea tu cuenta y guarda los destinos que quieres conocer</p>
        <p v-if="usuario" class="estado estado--info">Ya iniciaste sesión como {{ usuario.nombre }} ({{ usuario.correo }}).</p>
      </header>
      <div class="registro-rejilla">
        <section class="panel" aria-labelledby="titulo-registro">
          <h2 id="titulo-registro">Registrarte</h2>
          <form id="form-registro" class="formulario" novalidate @submit.prevent="crearCuenta">
            <div class="doble">
              <div class="campo">
                <label for="r-nombre">Nombres</label>
                <input id="r-nombre" v-model="r.nombre" type="text" placeholder="Tus nombres" maxlength="40" autocomplete="given-name"
                       :class="registro.clase('nombre')" :aria-invalid="Boolean(er.nombre)" @blur="registro.tocar('nombre')" />
                <p class="error-campo" aria-live="polite">{{ er.nombre }}</p>
              </div>
              <div class="campo">
                <label for="r-apellido">Apellidos</label>
                <input id="r-apellido" v-model="r.apellido" type="text" placeholder="Tus apellidos" maxlength="40" autocomplete="family-name"
                       :class="registro.clase('apellido')" :aria-invalid="Boolean(er.apellido)" @blur="registro.tocar('apellido')" />
                <p class="error-campo" aria-live="polite">{{ er.apellido }}</p>
              </div>
            </div>
            <div class="doble">
              <div class="campo">
                <label for="r-correo">Correo electrónico</label>
                <input id="r-correo" v-model="r.correo" type="email" placeholder="nombre@correo.com" autocomplete="email"
                       :class="registro.clase('correo')" :aria-invalid="Boolean(er.correo)" @blur="registro.tocar('correo')" />
                <p class="error-campo" aria-live="polite">{{ er.correo }}</p>
              </div>
              <div class="campo">
                <label for="r-celular">Celular</label>
                <input id="r-celular" v-model="r.celular" type="tel" placeholder="3001234567" maxlength="10" autocomplete="tel"
                       :class="registro.clase('celular')" :aria-invalid="Boolean(er.celular)" @blur="registro.tocar('celular')" />
                <p class="error-campo" aria-live="polite">{{ er.celular }}</p>
              </div>
            </div>
            <div class="doble">
              <div class="campo">
                <label for="r-nacimiento">Fecha de nacimiento</label>
                <input id="r-nacimiento" v-model="r.nacimiento" type="date" min="1920-01-01" :max="maxNacimiento"
                       :class="registro.clase('nacimiento')" :aria-invalid="Boolean(er.nacimiento)" @blur="registro.tocar('nacimiento')" />
                <span class="ayuda">Debes ser mayor de 18 años.</span>
                <p class="error-campo" aria-live="polite">{{ er.nacimiento }}</p>
              </div>
              <div class="campo">
                <label for="r-origen">Ciudad de origen</label>
                <input id="r-origen" v-model="r.origen" type="text" placeholder="Ej. Montería" list="ciudades"
                       :class="registro.clase('origen')" :aria-invalid="Boolean(er.origen)" @blur="registro.tocar('origen')" />
                <datalist id="ciudades"><option v-for="ciudad in CIUDADES" :key="ciudad" :value="ciudad" /></datalist>
                <p class="error-campo" aria-live="polite">{{ er.origen }}</p>
              </div>
            </div>
            <div class="campo">
              <label for="r-clave">Contraseña</label>
              <input id="r-clave" v-model="r.clave" type="password" placeholder="Mínimo 8 caracteres" autocomplete="new-password"
                     :class="registro.clase('clave')" :aria-invalid="Boolean(er.clave)" @blur="registro.tocar('clave')" />
              <MedidorClave :clave="r.clave" />
              <p class="error-campo" aria-live="polite">{{ er.clave }}</p>
            </div>
            <div class="campo">
              <label for="r-clave2">Confirma la contraseña</label>
              <input id="r-clave2" v-model="r.clave2" type="password" placeholder="Repite la contraseña" autocomplete="new-password"
                     :class="registro.clase('clave2')" :aria-invalid="Boolean(er.clave2)" @blur="registro.tocar('clave2')" />
              <p class="error-campo" aria-live="polite">{{ er.clave2 }}</p>
            </div>
            <fieldset class="campo">
              <legend>¿Qué te interesa?</legend>
              <div class="opciones">
                <label v-for="interes in INTERESES" :key="interes.valor">
                  <input v-model="r.intereses" type="checkbox" :value="interes.valor" /> {{ interes.texto }}
                </label>
              </div>
              <span v-if="r.intereses.length" class="ayuda">Elegiste {{ r.intereses.length }} de {{ INTERESES.length }}.</span>
            </fieldset>
            <label class="casilla">
              <input id="r-terminos" v-model="r.terminos" type="checkbox" :class="registro.clase('terminos')" @change="registro.tocar('terminos')" />
              Acepto los términos y condiciones y la política de privacidad.
            </label>
            <p class="error-campo" aria-live="polite">{{ er.terminos }}</p>
            <button class="btn" type="submit" :disabled="enviandoRegistro">{{ enviandoRegistro ? "Creando cuenta..." : "Crear cuenta" }}</button>
          </form>
        </section>

        <div class="registro-lado">
          <section id="login" class="panel" aria-labelledby="titulo-login">
            <h2 id="titulo-login">Iniciar sesión</h2>
            <form id="form-login" class="formulario" novalidate @submit.prevent="ingresar">
              <div class="campo">
                <label for="l-correo">Correo electrónico</label>
                <input id="l-correo" v-model="login.valores.correo" type="email" placeholder="nombre@correo.com" autocomplete="email"
                       :class="login.clase('correo')" @blur="login.tocar('correo')" />
                <p class="error-campo" aria-live="polite">{{ login.errores.correo }}</p>
              </div>
              <div class="campo">
                <label for="l-clave">Contraseña</label>
                <input id="l-clave" v-model="login.valores.clave" type="password" placeholder="Tu contraseña" autocomplete="current-password"
                       :class="login.clase('clave')" @blur="login.tocar('clave')" />
                <p class="error-campo" aria-live="polite">{{ login.errores.clave }}</p>
              </div>
              <p class="error-campo" role="alert">{{ errorLogin }}</p>
              <button class="btn" type="submit">Ingresar</button>
            </form>
          </section>
          <aside class="panel beneficios" aria-labelledby="titulo-beneficios">
            <ImagenAdaptable nombre="tuchin" alt="Plaza de Tuchín con su letrero colorido" />
            <h2 id="titulo-beneficios">Beneficios de tu cuenta</h2>
            <ul>
              <li><IconoSvg :icono="faHeart" />Guarda tus destinos favoritos.</li>
              <li><IconoSvg :icono="faBell" />Recibe la agenda de eventos y festivales.</li>
              <li><IconoSvg :icono="faRoute" />Arma tu propio plan de viaje.</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>
