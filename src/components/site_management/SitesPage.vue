<template>
    <v-container>
        <v-row>
            <v-col cols="4">
                <v-btn color="green" @click="dialog = true">Add Site</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :items="sites"
                >
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn small icon>
                            <v-icon @click="deleteSite(item)" color="red">mdi-delete</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="dialog" persistent max-width="500">
                <v-card>
                    <v-card-title>New Site</v-card-title>
                    <v-card-text>
                        <v-text-field outlined label="Site name" v-model="name"></v-text-field>
                        <v-select outlined label="Select Batch" v-model="batch" :items="batch_list"></v-select>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="createSite" :disabled="name == null || name == ''" :loading="loading" color="green">Save</v-btn>
                        <v-btn @click="clear" color="red">Cancel</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </v-container>
</template>

<script>
import { pocketbase } from '../../pocketbase'
export default {
    data: () => ({
        dialog: false,
        headers: [
            {text: 'Site', value: 'name'},
            {text: 'Batch', value: 'batch'},
            {text: 'Actions', value: 'actions'},
        ],
        name: null,
        batch: null,
        batch_list: ['BT39', 'CCK', 'WDLS'],
        loading: false
    }),

    methods: {
        createSite() {
            this.loading = true
            pocketbase.collection('sites').create({name: this.name, batch: this.batch})
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'success', message: 'Site created'})
                this.$store.dispatch('getSites')
                this.clear()
            })
            .catch((err) => {
                console.log(err.message)
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.clear()
            })
        },
        deleteSites(item) {
            pocketbase.collection('sites').delete(item.id)
            .then(() => {
                this.$store.dispatch('createAlert',{type: 'info', message: 'Site deleted'})
                this.$store.dispatch('getSites')
            })
            .catch((err) => {
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
            })
        },

        clear() {
            this.name = null
            this.batch = null
            this.dialog = null
            this.loading = false
        }
    },

    computed: {
        sites () {
            return this.$store.getters.loadedSites
        }
    }
}
</script>