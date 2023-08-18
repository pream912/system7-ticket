<template>
    <v-container>
    <div v-if="access.includes(61)">
        <v-row>
            <h3 class="ma-3">Email settings</h3>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-text-field outlined type="email" v-model="from_email" label="From email"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field outlined :append-icon="showPassword1 ? 'mdi-eye-off' : 'mdi-eye'" :type="showPassword1 ? 'text' : 'password'" @click:append="showPassword1 = !showPassword1" v-model="from_password" label="From password"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-text-field outlined type="email" v-model="to_email" label="To email"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field outlined :append-icon="showPassword2 ? 'mdi-eye-off' : 'mdi-eye'" :type="showPassword2 ? 'text' : 'password'" @click:append="showPassword2 = !showPassword2" v-model="to_password" label="To password"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col v-if="access.includes(611)" cols="4">
                <v-btn @click="updateSettings" :loading="loading" color="green">Update</v-btn>
            </v-col>
        </v-row>
    </div>
    </v-container>
</template>

<script>
import { pocketbase } from '../pocketbase'
export default {
    data:() => ({
        from_email: null,
        from_password: null,
        to_email: null,
        to_password: null,
        showPassword1: false,
        showPassword2: false,
        id: null,
        loading: false
    }),

    methods: {
        getSettings() {
            pocketbase.collection('settings').getFullList()
            .then((records) => {
                let settings = records[0]
                console.log(settings);
                this.from_email = settings.from_email
                this.from_password = settings.from_password
                this.to_email = settings.to_email
                this.to_password = settings.to_password
                this.id = settings.id
            })
        },

        updateSettings() {
            this.loading = true
            pocketbase.collection('settings').update(this.id, {
                from_email: this.from_email,
                from_password: this.from_password,
                to_email: this.to_email,
                to_password: this.to_password
            })
            .then(() =>{
                this.$store.dispatch('createAlert',{type: 'info', message: 'Settings updated'})
                this.loading = false
            })
            .catch((err) => {
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.loading = false
            })
        }
    },

    computed: {
        access() {
            return this.$store.getters.loadedPermissions
        }
    },

    mounted () {
        this.getSettings()
    }
}
</script>   