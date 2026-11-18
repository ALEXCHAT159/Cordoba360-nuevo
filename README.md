# Córdoba 360

Plataforma web turística del departamento de Córdoba, Colombia. Curso Desarrollo Web I, Universidad de Córdoba (2026-II). Autor: Alex Arrieta.

Sitio publicado: https://alexchat159.github.io/Cordoba360-nuevo/

La primera entrega cubrió la semántica estructural, la maquetación responsive y el versionamiento (HTML5 y CSS3). El segundo avance agrega JavaScript: eventos, consumo de datos con `fetch`, almacenamiento en `localStorage` y validación de formularios en tiempo real. Lo explico más abajo, en la sección [Avance 2](#avance-2-javascript).

## Páginas

| Archivo | Contenido (según los mockups) |
| --- | --- |
| `index.html` | Inicio: portada con imagen principal, destinos populares y experiencias |
| `destinos.html` | Listado de destinos por categoría (playas, pueblos, naturaleza) |
| `experiencias.html` | "Vive experiencias inolvidables": 6 categorías |
| `informacion.html` | Conoce Córdoba: historia, cifras, consejos de viaje |
| `san-antero.html` | Ficha de destino: ubicación, clima, galería y mapa |
| `contacto.html` | Formulario de contacto y canales de atención |
| `registro.html` | Registro e inicio de sesión |

## Estructura de carpetas

```
cordoba360/
├── index.html, destinos.html, experiencias.html, informacion.html,
│   san-antero.html, contacto.html, registro.html
├── css/
│   └── styles.css      ← hoja de estilos externa única
├── data/
│   └── destinos.json   ← datos de los 11 destinos (Avance 2)
├── js/
│   ├── utilidades.js   ← fetch con manejo de errores, localStorage, avisos y sesión
│   ├── destinos.js     ← listado de destinos, filtros, búsqueda y favoritos
│   ├── clima.js        ← clima en vivo de San Antero (API Open-Meteo)
│   ├── validacion.js   ← validación en tiempo real reutilizable
│   ├── contacto.js     ← formulario de contacto y mensajes guardados
│   └── registro.js     ← registro, inicio de sesión y medidor de contraseña
└── img/                ← imágenes optimizadas en .webp y .jpg
```

## Cumplimiento de requisitos

**1. Estructura semántica (HTML5)**
- `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>` y `<footer>` en todas las páginas, con muy pocos `div` (solo como envoltorios de diseño).
- Formularios con validación nativa: `required`, `pattern`, `minlength`/`maxlength`, `min`, `max`, `type="email"`, `type="date"`, `type="tel"`, `type="number"`.
- Metadatos en `<head>`: `charset`, `viewport`, `title`, `description`, `theme-color` y Open Graph.
- Multimedia: `<picture>` con WebP y respaldo JPG, `loading="lazy"`, logo en `<svg>` en línea y favicon SVG.

**2. Maquetación y diseño adaptativo (CSS3)**
- Estilos externos en `css/styles.css`, organizados por módulos.
- **CSS Grid** para la macro-estructura (`.pagina`: header / main / footer), el pie de página y las rejillas de tarjetas.
- **Flexbox** para la barra de navegación, las tarjetas, los botones y la barra de herramientas.
- Mobile First con **tres breakpoints**: tablet (`min-width: 600px`), escritorio (`min-width: 1024px`) y escritorio amplio (`min-width: 1280px`).
- Menú móvil y mega menú de Destinos hechos solo con CSS (checkbox, `:hover` y `:focus-within`).
- Recursos externos vía CDN: tipografía **Inter** (Google Fonts) e iconos **Font Awesome 6.5.1** (cdnjs).

## Avance 2: JavaScript

Todo el JavaScript está en la carpeta `js/`, en archivos separados por página. No usé librerías. Cada archivo se carga con `<script defer>` al final del HTML, y `utilidades.js` va primero en todas las páginas porque los demás usan sus funciones.

### Manipulación del DOM y eventos

En `destinos.html` las tarjetas ya no están escritas en el HTML. `destinos.js` las crea con `document.createElement` a partir del JSON y las vuelve a pintar cada vez que cambia algo. El buscador usa el evento `input` (filtra mientras se escribe y no distingue tildes, así que "monteria" encuentra Montería), el selector de orden usa `change` y los botones de categoría usan `click`. Para el corazón de favoritos usé delegación de eventos: hay un solo listener en el contenedor y con `closest()` se sabe qué tarjeta se tocó.

En `contacto.html` el `submit` lleva `preventDefault()`, así la página no se recarga. Cada mensaje enviado aparece abajo en "Tus mensajes guardados" con botones para editarlo o eliminarlo. Al editar, los datos vuelven al formulario y el botón cambia a "Guardar cambios"; al eliminar, el elemento sale con una animación corta y luego se quita del DOM. El área de texto tiene un contador de caracteres que se pone en naranja después de 450.

Cuando alguien inicia sesión, `utilidades.js` reemplaza los botones "Iniciar sesión" y "Registrarte" del encabezado por un saludo con el nombre y un botón para cerrar sesión. Esto pasa en todas las páginas.

### Consumo de datos con fetch

Hay dos peticiones, las dos con `async/await` dentro de `try/catch`:

1. `destinos.js` lee el archivo local `data/destinos.json`.
2. `clima.js` consulta la API pública de [Open-Meteo](https://open-meteo.com/), que no pide clave, y muestra en `san-antero.html` la temperatura actual, la humedad, el viento y el pronóstico de tres días. El dato de clima que estaba fijo en la ficha ahora también se actualiza con la temperatura real.

Las dos usan la función `C360.obtenerJSON()` de `utilidades.js`. Mientras llega la respuesta se ve un indicador de carga. Si el estado no es 200 se lanza un error con un mensaje según el código: 404 cuando el recurso no existe, 500 o más cuando falla el servidor. También se manejan la falta de conexión, un tiempo límite de 10 segundos (con `AbortController`) y un JSON mal formado. En todos los casos sale un recuadro rojo con el mensaje y un botón "Reintentar".

Para probar el error 404 sin dañar nada se puede abrir `destinos.html?fuente=data/no-existe.json`. La página intenta cargar ese archivo, que no existe, y muestra el mensaje de error.

### localStorage

Guardo cuatro colecciones en formato JSON:

| Clave | Qué guarda |
| --- | --- |
| `c360_favoritos` | Los id de los destinos marcados con el corazón |
| `c360_mensajes` | Los mensajes del formulario de contacto, con fecha de creación y de edición |
| `c360_usuarios` | Las cuentas creadas en el registro |
| `c360_sesion` | El nombre y el correo de quien inició sesión |

Todo sigue ahí después de recargar o cerrar el navegador. La contraseña no se guarda como texto: se guarda su hash SHA-256, calculado con `crypto.subtle`, y al iniciar sesión se compara el hash. Sé que en un sitio real esto se hace en un servidor; aquí es una simulación para la materia.

### Validación en tiempo real

`validacion.js` se usa en los tres formularios (contacto, registro e inicio de sesión). Aprovecha los atributos que ya tenían los campos desde la primera entrega (`required`, `pattern`, `minlength`, `min`, `max`, `type="email"`) y lee `campo.validity` para saber qué falla. El mensaje aparece debajo del campo y el borde se pone rojo si hay error o verde si está bien. Para no regañar al usuario desde la primera letra, un campo se revisa cuando sale de él o cuando ya lleva más de dos caracteres.

En el registro agregué reglas que el HTML solo no puede hacer: la fecha de nacimiento debe dar 18 años o más (la fecha máxima se calcula con la fecha de hoy), la confirmación de la contraseña debe coincidir, y no se puede registrar un correo que ya tiene cuenta. También hay un medidor de seguridad de la contraseña que cambia de color mientras se escribe. En contacto, la fecha de visita no puede ser anterior a hoy.

## Cómo verlo

La forma más fácil es abrir el sitio publicado en GitHub Pages: https://alexchat159.github.io/Cordoba360-nuevo/

Si se descarga el proyecto, hay que abrirlo con la extensión *Live Server* de VS Code (clic derecho en `index.html` y luego *Open with Live Server*). Si se abre `index.html` con doble clic, el navegador usa la dirección `file://` y bloquea el `fetch` del archivo `destinos.json`, así que la página de destinos muestra un aviso en lugar de las tarjetas. El resto del sitio funciona igual.

## Subirlo a GitHub (entrega)

```bash
git init
git add .
git commit -m "Estructura semántica HTML5 de las páginas de Córdoba 360"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/cordoba360.git
git push -u origin main
```

Se recomienda hacer commits descriptivos por avance, por ejemplo: "Maquetación del inicio con Grid y Flexbox", "Breakpoints para tablet y móvil", "Formularios con validación nativa".

Para publicarlo con GitHub Pages: *Settings → Pages → Branch: main / root*.

## Referencias

Colombia Travel. (s. f.). *Descubre Colombia a través de sus regiones*. Recuperado el 25 de agosto de 2026, de https://colombia.travel/es/donde-ir

Escuela de Programación. (s. f.). *Diferencia entre HTML, CSS y JavaScript: guía visual para novatos*. Recuperado el 25 de agosto de 2026, de https://escueladeprogramacion.net/blog/diferencia-entre-html-css-y-javascript-guia-visual-para-novatos

GitHub. (s. f.). *GitHub Education*. Recuperado el 25 de agosto de 2026, de https://github.com/education?locale=es-419

Gobernación de Córdoba. (2021). *Turismo*. Recuperado el 25 de agosto de 2026, de https://www.cordoba.gov.co/publicaciones/18/turismo/

MDN Web Docs. (s. f.). *Usando Fetch*. Recuperado el 18 de noviembre de 2026, de https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch

Ministerio de Comercio, Industria y Turismo. (s. f.). *Portal de Información Turística de Colombia*. Recuperado el 25 de agosto de 2026, de https://portucolombia.mincit.gov.co/

Miro. (2023, 20 de marzo). *Wireframe: Qué es, cómo hacerlo y ejemplos*. Recuperado el 25 de agosto de 2026, de https://miro.com/es/wireframe/que-es-wireframe/

Open-Meteo. (s. f.). *Weather Forecast API*. Recuperado el 18 de noviembre de 2026, de https://open-meteo.com/en/docs

## Créditos de imágenes

Fotografías tomadas del material visual del proyecto (mockups del documento Córdoba 360) y de la carpeta de imágenes de referencia del autor. Uso académico.
