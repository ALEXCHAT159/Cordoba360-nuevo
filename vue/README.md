# Córdoba 360 · Entrega final (Vue.js)

Plataforma turística del departamento de Córdoba, Colombia, hecha como aplicación de una sola página (SPA) con Vue 3. Curso Desarrollo Web I, Universidad de Córdoba (2026-II). Autor: Alex Arrieta.

App publicada: https://alexchat159.github.io/Cordoba360-nuevo/vue/

La versión estática de los avances 1 y 2 sigue en la raíz del repositorio y en https://alexchat159.github.io/Cordoba360-nuevo/. Para esta entrega pasé ese sitio a Vue: las mismas páginas y el mismo diseño, pero ahora cada parte es un componente `.vue`, la navegación la hace Vue Router sin recargar y los datos compartidos viven en tiendas de Pinia.

## Instalación local

Se necesita Node.js 20 o más reciente.

```bash
cd vue
npm install
npm run dev
```

`npm run dev` abre el servidor de desarrollo en http://localhost:5173. Para generar el paquete de producción:

```bash
npm run build     # crea la carpeta dist/
npm run preview   # sirve dist/ para probarlo antes de publicar
```

## Tecnologías

| Herramienta | Para qué la usé |
| --- | --- |
| Vue 3 (Composition API con `<script setup>`) | Componentes y reactividad |
| Vite | Servidor de desarrollo y build de producción |
| Vue Router | Rutas de la SPA, incluida una ruta dinámica `/destinos/:id` |
| Pinia | Estado compartido entre vistas (favoritos, sesión, mensajes, destinos, avisos) |
| Font Awesome (paquetes npm de íconos) | Los íconos se dibujan como SVG en línea con el componente `IconoSvg.vue` |
| Open-Meteo | API pública del clima, sin clave |
| GitHub Actions + GitHub Pages | Despliegue automático en cada push a `main` |

En los avances anteriores Font Awesome se cargaba por CDN y en algunos navegadores no aparecían los íconos. Ahora importo solo los íconos que uso desde los paquetes de npm y Vite los mete en el build, así que no dependen de ningún CDN.

## Estructura de carpetas

```
vue/
├── index.html              ← única página HTML; Vue monta la app en #app
├── vite.config.js          ← base /Cordoba360-nuevo/vue/ y copia de 404.html
├── public/
│   ├── data/destinos.json  ← los 11 destinos (se piden con fetch)
│   └── img/                ← fotos en .webp y .jpg
└── src/
    ├── main.js             ← crea la app y registra Pinia y el router
    ├── App.vue             ← encabezado + <RouterView> + pie
    ├── router/index.js     ← rutas, scroll y título de cada vista
    ├── stores/             ← tiendas de Pinia
    │   ├── destinos.js     ← carga del JSON, estado cargando/listo/error
    │   ├── favoritos.js    ← favoritos guardados en localStorage
    │   ├── sesion.js       ← registro, inicio y cierre de sesión
    │   ├── mensajes.js     ← CRUD de los mensajes de contacto
    │   └── avisos.js       ← avisos flotantes (toast)
    ├── composables/
    │   └── useFormulario.js ← validación reactiva y reglas reutilizables
    ├── servicios/
    │   ├── http.js         ← fetch con async/await, tiempo límite y errores HTTP
    │   ├── almacenamiento.js ← lectura y escritura en localStorage
    │   └── utilidades.js   ← rutas de imágenes, fechas, hash SHA-256
    ├── views/              ← una vista por ruta
    │   ├── InicioView.vue
    │   ├── DestinosView.vue
    │   ├── DetalleDestinoView.vue
    │   ├── ExperienciasView.vue
    │   ├── InformacionView.vue
    │   ├── ContactoView.vue
    │   ├── RegistroView.vue
    │   └── NoEncontradoView.vue
    ├── components/         ← piezas reutilizables
    │   ├── EncabezadoSitio.vue, MenuDestinos.vue, CuentaUsuario.vue
    │   ├── PieSitio.vue, BotonesFlotantes.vue, AvisosFlotantes.vue
    │   ├── TarjetaDestino.vue, FiltrosDestinos.vue, GaleriaFotos.vue
    │   ├── ClimaDestino.vue, EstadoCarga.vue, MigasPan.vue
    │   ├── TarjetaMensaje.vue, ModalConfirmacion.vue, MedidorClave.vue
    │   └── IconoSvg.vue, LogoMarca.vue, ImagenAdaptable.vue
    └── assets/styles.css   ← la hoja de estilos de los avances 1 y 2, con un bloque nuevo al final
```

## Cómo cumple cada requisito

### 1. Arquitectura basada en componentes

Todo está en componentes de archivo único. Separé las vistas (`views/`, una por ruta) de los componentes reutilizables (`components/`). Algunos se usan en varias partes: `TarjetaDestino` aparece en el catálogo y en "Otros destinos" del detalle, `EstadoCarga` lo usan el catálogo, el detalle y el clima, y `CuentaUsuario` se usa dos veces en el encabezado (barra de escritorio y menú móvil).

Paso de datos de padre a hijo con props, por ejemplo:

- `TarjetaDestino` recibe `destino` y `esFavorito`.
- `ClimaDestino` recibe `lat`, `lon` y `lugar`.
- `GaleriaFotos` recibe la lista de `fotos`.

De hijo a padre con eventos personalizados (`defineEmits` / `$emit`):

- `TarjetaDestino` emite `alternar-favorito` cuando se toca el corazón.
- `TarjetaMensaje` emite `editar` y `eliminar`; el componente no borra nada, la vista decide.
- `ClimaDestino` emite `actualizado` con el resumen ("Ahora 30 °C, parcialmente nublado") y la vista lo pone en el dato de clima de la cabecera.
- `EstadoCarga` emite `reintentar`.
- `CuentaUsuario` emite `cerrar-sesion`.

Enlace bidireccional con `defineModel`:

- `FiltrosDestinos` se usa con `v-model:busqueda`, `v-model:categoria` y `v-model:orden`. Si el usuario escribe en el buscador, cambia la variable de la vista; si la vista cambia la categoría (por ejemplo porque llegó `?categoria=playas` en la URL), el botón se marca solo.
- `ModalConfirmacion` se abre y se cierra con `v-model:abierto`.

### 2. Enrutamiento con Vue Router

Uso `createWebHistory`, así que las direcciones quedan limpias (`/vue/destinos`, sin `#`). Las rutas son:

| Ruta | Vista |
| --- | --- |
| `/` | Inicio |
| `/destinos` | Catálogo con búsqueda, filtros, orden y favoritos |
| `/destinos/:id` | Detalle de un destino (galería, clima en vivo, mapa y destinos relacionados) |
| `/experiencias` | Categorías de experiencias |
| `/informacion` | Conoce Córdoba |
| `/contacto` | Formulario y CRUD de mensajes |
| `/registro` | Registro e inicio de sesión |
| cualquier otra | Página 404 propia |

Todos los enlaces internos son `<RouterLink>`, así que la página nunca se recarga. Las vistas, menos Inicio, se cargan con `import()` la primera vez que se visitan; por eso el build genera un archivo `.js` por vista. El router también cambia el título de la pestaña, baja a la sección cuando el enlace trae ancla (`/informacion#historia`) y redirige las direcciones viejas del sitio estático (`san-antero.html` lleva a `/destinos/san-antero`).

En el Avance 2 la ficha de San Antero era una página aparte. Ahora hay una sola vista de detalle que sirve para los 11 destinos: toma el `id` de la URL, busca el destino en la tienda y consulta el clima de Open-Meteo con la latitud y longitud de ese lugar. Para eso agregué a `destinos.json` las coordenadas, la galería, la historia corta y los datos de viaje de cada destino.

### 3. Estado y formularios reactivos

Las directivas que pide el enunciado aparecen así:

- `v-model` en todos los campos de contacto y registro, en el buscador, en el selector de orden, en los checkbox de intereses (se guardan en un arreglo) y en el checkbox del menú móvil.
- `v-for` en el catálogo, el mega menú, el pie, las cifras, los canales de contacto, la galería, el pronóstico y la lista de mensajes.
- `v-if` / `v-else-if` / `v-else` para los estados cargando / error / vacío / listo, para mostrar "Hola, Alex" o los botones de sesión, y para el texto "Ver más / Ver menos" de la historia.
- `v-bind` (`:`) para clases (`es-invalido`, `es-valido`, `miniatura--activa`), atributos como `aria-pressed` y `aria-invalid`, y estilos como el ancho de la barra de seguridad de la contraseña.
- `v-on` (`@`) para `@submit.prevent`, `@click`, `@blur`, `@change` y los eventos propios de los componentes.

El estado compartido está en Pinia. Ejemplos de datos que se mantienen iguales entre vistas:

- El corazón del encabezado muestra cuántos favoritos hay. Si marco uno en el catálogo, el número cambia de una vez, y en el detalle el botón "Guardar en favoritos" ya aparece marcado.
- Al registrarse o iniciar sesión, el encabezado cambia a "Hola, nombre" en todas las vistas, sin recargar.
- `destinos.json` se pide una sola vez. Si voy del catálogo al detalle y vuelvo, no se repite la petición.

Lo que tiene que durar se guarda en `localStorage` con un `watch` dentro de cada tienda: favoritos, mensajes, usuarios y sesión. Las claves son las mismas del Avance 2 (`c360_favoritos`, `c360_mensajes`...), así que lo que se guardó en la versión estática aparece también en la de Vue si se abre en el mismo navegador y dominio.

La validación la pasé a un composable, `useFormulario.js`. Antes usaba `addEventListener` y la API `validity` del navegador; ahora los valores están en un objeto reactivo y cada campo tiene una lista de reglas (`requerido`, `minLargo`, `patron`, `correo`, `fechaEntre`, `numeroEntre`, `marcado`). Los mensajes de error se muestran debajo del campo mientras se escribe, el borde se pone rojo o verde y al enviar con errores el foco va al primer campo malo. En registro hay reglas que dependen de otros datos: la confirmación tiene que ser igual a la contraseña, el correo no puede estar registrado y la fecha de nacimiento tiene que dar 18 años o más.

### 4. Despliegue en producción

`npm run build` genera `vue/dist/` con el código minificado y dividido por vistas. El archivo `.github/workflows/despliegue.yml` hace todo en cada push a `main`: instala dependencias con `npm ci`, compila la app y publica en GitHub Pages el sitio estático en la raíz y la app Vue en `/vue/`.

GitHub Pages no sabe nada de las rutas de Vue Router; si alguien abre directamente `/vue/destinos/lorica`, Pages buscaría un archivo que no existe. Para eso `vite.config.js` copia `index.html` como `404.html` al terminar el build, y el workflow pone ese archivo en la raíz del sitio, que es el único `404.html` que Pages tiene en cuenta. Pages lo sirve, la app arranca y el router muestra la vista correcta. Como efecto secundario, una dirección mal escrita del sitio estático también termina en la página 404 de la app.

## Pruebas rápidas

- Error 404 al cargar datos: abrir `/vue/destinos?fuente=data/no-existe.json`. En GitHub Pages sale el mensaje del error 404 con el botón "Reintentar".
- Ruta que no existe: abrir `/vue/cualquier-cosa`.
- Favoritos: marcar corazones en Destinos y mirar el contador del encabezado; luego filtrar por "Mis favoritos".
- Contacto: enviar el formulario vacío para ver los errores, guardar un mensaje, editarlo y eliminarlo (pide confirmación en una ventana modal).
- Sesión: crear una cuenta, cerrar sesión y volver a entrar con el mismo correo. La contraseña se guarda como hash SHA-256, nunca en texto plano. Es una simulación para la materia; un sitio real valida en un servidor.

## Fuentes

- Colombia Travel. (s. f.). *Descubre Colombia a través de sus regiones*. https://colombia.travel/es/donde-ir
- Gobernación de Córdoba. (2021). *Turismo*. https://www.cordoba.gov.co/publicaciones/18/turismo/
- Open-Meteo. (s. f.). *Free Weather API*. https://open-meteo.com/
- Vue.js. (s. f.). *Guía de Vue 3*. https://vuejs.org/guide/introduction.html
