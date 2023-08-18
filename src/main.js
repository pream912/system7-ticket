import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import store from './store'
import { pocketbase } from './pocketbase'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),

  created() {
    pocketbase.authStore.onChange(() => {
      if(pocketbase.authStore.model) {
        if(!pocketbase.authStore.model.status) {
          alert("Your account has been deactivated!");
        } else {
          store.commit('SET_LOGGED_IN', true)
          store.dispatch('getSettings')
          store.dispatch('getDesignations')
          store.dispatch('getUsers')
          store.dispatch('getIssues')
          store.dispatch('getSolutions')
          store.dispatch('getSites')
          store.dispatch('getStations')
          store.dispatch('getTickets')
        }  
      } else {
        store.commit('SET_LOGGED_IN', false)
      }
    }, true)
  }
}).$mount('#app')
