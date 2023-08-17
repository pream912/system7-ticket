import Vue from 'vue'
import Vuex from 'vuex'
import { pocketbase } from '../pocketbase'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loggedIn: false,
    alert: {alert: false},
    designations: [],
    users: [],
    issues: [],
    solutions: [],
    sites: [],
    stations: [],
    tickets: [],
    permissions: []
  },
  getters: {
    loadedPermissions (state) {
      return state.permissions
    },
    loggedIn (state) {
      return state.loggedIn
    },
    loadedAlert (state) {
      return state.alert
    },
    loadedDesignations (state) {
      return state.designations
    },
    loadedUsers (state) {
      return state.users
    },
    loadedUser (state) {
      return (userId) => {
          return state.users.find((user) => {
              return user.id === userId
          })
      }
    },
    loadedTickets (state) {
      return state.tickets
    },
    loadedTicket (state) {
      return (ticketId) => {
          return state.tickets.find((ticket) => {
              return ticket.id === ticketId
          })
      }
    },
    loadedIssues (state) {
      return state.issues
    },
    loadedSolutions (state) {
      return state.solutions
    },
    loadedSites (state) {
      return state.sites
    },
    loadedStations(state) {
      return state.stations
    },
  },
  mutations: {
    SET_PERMISSIONS (state, payload) {
      console.log(payload);
      state.permissions = payload
    },
    setAlert (state, payload) {
      state.alert = payload
    },
    SET_LOGGED_IN(state, payload) {
      state.loggedIn = payload;
    },
    SET_DESIGNATIONS(state, payload) {
      state.designations = payload
    },
    SET_USERS(state, payload) {
      state.users = payload
    },
    SET_ISSUES(state, payload) {
      state.issues = payload
    },
    SET_SOLUTIONS(state, payload) {
      state.solutions = payload
    },
    SET_SITES(state, payload) {
      state.sites = payload
    },
    SET_STATIONS(state, payload) {
      state.stations = payload
    },
    SET_TICKETS(state, payload) {
      state.tickets = payload
    },
  },
  actions: {
    createAlert ({commit}, payload) {
      const data = {
          alert: true,
          type: payload.type,
          message: payload.message
      }
      commit('setAlert', data)
      setTimeout(() => {
          commit('setAlert', {alert: false})
      }, 3000);
    },

    getDesignations ({commit}) {
      pocketbase.collection('designations').getFullList()
      .then((records) => {
        commit('SET_DESIGNATIONS', records)
      })
      .catch((err) => console.log(err))
    },

    getUsers ({commit}) {
      pocketbase.collection('users').getFullList()
      .then((records) => {
        commit('SET_USERS', records)
      })
      .catch((err) => console.log(err))
    },

    getPermissions({commit}) {
      let level = pocketbase.authStore.model.access_level
      pocketbase.collection('settings').getFullList()
      .then((rec) => {
        let uac = rec[0].uac
        if(level == 'Level1') {
          console.log(uac.l1);
          commit('SET_PERMISSIONS', uac.l1)
        }
        if(level == 'Level2') {
          commit('SET_PERMISSIONS', uac.l2)
        }
        if(level == 'Level3') {
          commit('SET_PERMISSIONS', uac.l3)
        }
        if(level == 'Level4') {
          commit('SET_PERMISSIONS', uac.l4)
        }
        if(level == 'Level5') {
          commit('SET_PERMISSIONS', uac.l5)
        }
      })
      .catch((err) => console.log(err))
    },

    getIssues ({commit}) {
      pocketbase.collection('issues').getFullList()
      .then((records) => {
        commit('SET_ISSUES', records)
      })
      .catch((err) => console.log(err))
    },

    getSolutions ({commit}) {
      pocketbase.collection('solutions').getFullList()
      .then((records) => {
        commit('SET_SOLUTIONS', records)
      })
      .catch((err) => console.log(err))
    },

    getSites ({commit}) {
      pocketbase.collection('sites').getFullList()
      .then((records) => {
        commit('SET_SITES', records)
      })
      .catch((err) => console.log(err))
    },

    getStations ({commit}) {
      pocketbase.collection('stations').getFullList()
      .then((records) => {
        commit('SET_STATIONS', records)
      })
      .catch((err) => console.log(err))
    },

    getTickets ({commit}) {
      pocketbase.collection('tickets').getFullList()
      .then((records) => {
        commit('SET_TICKETS', records)
      })
      .catch((err) => console.log(err))
    },
  },
  modules: {
  }
})
