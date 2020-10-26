<template>
  <v-alert
    v-show="globalError"
    :value="globalError"
    type="error"
    v-model="userAlert"
    dismissible
  >
    <span v-html="globalError"></span>
  </v-alert>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Alert",
    data() {
    return {
      userAlert: true
    };
  },
  computed: {
    ...mapState({
      globalError: (state) => state.globalError,
    })
  },
}
</script>