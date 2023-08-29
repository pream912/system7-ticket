<template>
    <v-container>
    <div v-if="access.includes(62)">
        <v-row>
            <h3 class="ma-3">Telegram settings</h3>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-text-field outlined type="text" v-model="botkey" label="BOT API KEY"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-text-field outlined type="text" v-model="channelid" label="Channel ID"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col v-if="access.includes(621)" cols="4">
                <v-btn @click="updateSettings" :loading="loading" color="green">Update</v-btn>
            </v-col>
        </v-row>
    </div>
    </v-container>
</template>

<script>
import { pocketbase } from '../../pocketbase'
export default {
    data:() => ({
        botkey: null,
        channelid: null,
        id: null,
        loading: false
    }),

    methods: {
        getSettings() {
            pocketbase.collection('settings').getFullList()
            .then((records) => {
                let settings = records[0]
                console.log(settings);
                this.botkey = settings.botkey
                this.channelid = settings.channelid
                this.id = settings.id
            })
        },

        updateSettings() {
            this.loading = true
            pocketbase.collection('settings').update(this.id, {
                botkey: this.botkey,
                channelid: this.channelid,
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