import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/styles.css";

const app = createApp(App);
app.use(createPinia()); // estado compartido (favoritos, sesión, mensajes, destinos)
app.use(router);        // navegación SPA sin recargar la página
app.mount("#app");
