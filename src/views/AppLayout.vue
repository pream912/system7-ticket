<template>
    <div>
        <v-navigation-drawer app clipped v-model="drawer">
            <v-list dense nav>
                <v-list-item link to="/">
                    <v-list-item-icon>
                        <v-icon> mdi-land-plots </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Dashboard</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-group
                    :value="false"
                    prepend-icon="mdi-human-queue"
                >
                    <template v-slot:activator>
                            <v-list-item-title>User management</v-list-item-title>
                    </template>
                    <v-list-item class="ml-4" link to="/designations">
                        <v-list-item-content>
                            <v-list-item-title>Designations</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/users">
                        <v-list-item-content>
                            <v-list-item-title>Users</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/access">
                        <v-list-item-content>
                            <v-list-item-title>Access control</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-group>
                <v-list-group
                    :value="false"
                    prepend-icon="mdi-google-maps"
                >
                    <template v-slot:activator>
                        <v-list-item-title>Site management</v-list-item-title>
                    </template>
                    <v-list-item class="ml-4" link to="/sites">
                        <v-list-item-content>
                            <v-list-item-title>Sites</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/stations">
                        <v-list-item-content>
                            <v-list-item-title>Stations</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-group>
                <v-list-group
                    :value="false"
                    prepend-icon="mdi-wrench"
                >
                    <template v-slot:activator>
                        <v-list-item-title>Tickets management</v-list-item-title>
                    </template>
                    <v-list-item class="ml-4" link to="/issues">
                        <v-list-item-content>
                            <v-list-item-title>Issues</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/solutions">
                        <v-list-item-content>
                            <v-list-item-title>Solutions</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/tickets">
                        <v-list-item-content>
                            <v-list-item-title>Tickets</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-group>
                <v-list-group
                    :value="false"
                    prepend-icon="mdi-book-open-page-variant"
                >
                    <template v-slot:activator>
                        <v-list-item-title>Reports</v-list-item-title>
                    </template>
                    <v-list-item class="ml-4" link to="/ticketstatus">
                        <v-list-item-content>
                            <v-list-item-title>Ticket status</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/useractivity">
                        <v-list-item-content>
                            <v-list-item-title>User activity</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/durationtaken">
                        <v-list-item-content>
                            <v-list-item-title>Duration taken</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/issuewise">
                        <v-list-item-content>
                            <v-list-item-title>Issue wise</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-group>
            </v-list>
            <template v-slot:append>
                <div class="pa-2">
                    <v-switch label="Dark mode" v-model="$vuetify.theme.dark"></v-switch>
                </div>
                <div class="pa-2">
                    <v-btn @click="logout" color="orange">Logout</v-btn>
                </div>
            </template>
        </v-navigation-drawer>
        <v-app-bar app clipped-left>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title>System7</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-avatar>
                <v-icon>
                    mdi-account-circle
                </v-icon>
            </v-avatar>
            {{user.name}}
        </v-app-bar>
        <v-main>
            <v-alert style="z-index: 1000;" :value="alert.alert" :type="alert.type">{{alert.message}}</v-alert>
            <router-view/>
        </v-main>
    </div>
</template>

<script>
import { pocketbase } from '../pocketbase'
export default {
  data: () => ({
    drawer: true,
  }),
  methods: {
    logout() {
        pocketbase.authStore.clear()
    }
  },
  computed: {
    alert () {
        return this.$store.getters.loadedAlert
    },
    user() {
        return pocketbase.authStore.model
    },
    isAdmin () {
        return true
    }
  }
};
</script>
