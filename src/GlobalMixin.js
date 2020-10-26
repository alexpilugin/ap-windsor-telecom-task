// eslint-disable-next-line no-unused-vars
import Vue from 'vue';

// define a global mixin object (its methods available at all Components)
const Mixin = {
  methods: {
    _secureHTML(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
  }
}

export { Mixin } //use: import { Mixin } from 'GlobalMixin.js'

// - export it as a Vue Plugin
export default {
  install(Vue, options) {
    Vue.mixin(Mixin)
  }
}
