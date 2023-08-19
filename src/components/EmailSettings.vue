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
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-text-field outlined type="email" v-model="to_email" label="To email"></v-text-field>
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
        to_email: null,
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
                this.to_email = settings.to_email
                this.id = settings.id
            })
        },

        updateSettings() {
            this.loading = true
            pocketbase.collection('settings').update(this.id, {
                from_email: this.from_email,
                to_email: this.to_email,
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