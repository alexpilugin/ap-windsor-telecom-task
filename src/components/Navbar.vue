<template>
  <v-app-bar app color="primary" dark>
    <div class="d-flex align-center">
      <router-link to="/" class="navbar-brand">
        <v-icon>mdi-home</v-icon>
      </router-link>
      <span class="pl-5">Created by Alex Pilugin</span>
    </div>

    <v-spacer></v-spacer>

    <v-btn
      href="https://jsonplaceholder.typicode.com/todos/"
      target="_blank"
      text
    >
      <span class="mr-2">api</span>
      <v-icon>mdi-open-in-new</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {
  name: "Navbar",
};
</script>