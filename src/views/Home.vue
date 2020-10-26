<template>
  <div class="home">
    <LoadingScreen />
    <v-container fluid>
      <v-main class="martop" wrap>
        <Alert />
        <TodoList />
      </v-main>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
import LoadingScreen from "@/components/LoadingScreen.vue";
import Alert from "@/components/Alert.vue";
import TodoList from "@/components/TodoList.vue";

export default {
  name: 'Home',
  components: {
    LoadingScreen,
    Alert,
    TodoList
  }
}
</script>

<style>
  .martop {
    margin-top: -80px;
  }
</style>