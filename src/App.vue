<template>
  <router-view/>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({name: 'App'});
</script>
<style lang="scss">
#app {
  font-family: Karla, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  h1 {
    margin-top: 10px;
    margin-bottom: 15px;
    font-size: 36px;
    line-height: 50px;
    font-weight: 400;
  }

  a {
    display: inline-block;
    border-bottom: 2px solid rgba(162, 95, 75, 0.2);
    -webkit-transition: color 400ms ease, border-color 400ms ease;
    transition: color 400ms ease, border-color 400ms ease;
    color: #a25f4b;
    text-decoration: none;
  }
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
