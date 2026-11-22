<script setup>
// Botones de cuenta del encabezado. Se usa dos veces (barra y menú móvil).
// Recibe el usuario por prop y avisa al padre con un evento cuando
// se pulsa "Cerrar sesión" (comunicación hijo → padre con emit).
defineProps({
  usuario: { type: Object, default: null }
});
const emit = defineEmits(["cerrar-sesion"]);
</script>

<template>
  <div>
    <template v-if="usuario">
      <span class="saludo">Hola, {{ usuario.nombre }}</span>
      <button type="button" class="btn btn--pildora" @click="emit('cerrar-sesion')">Cerrar sesión</button>
    </template>
    <template v-else>
      <RouterLink class="btn btn--pildora" :to="{ name: 'registro', hash: '#login' }">Iniciar sesión</RouterLink>
      <RouterLink class="btn btn--pildora" :to="{ name: 'registro' }">Registrarte</RouterLink>
    </template>
  </div>
</template>
