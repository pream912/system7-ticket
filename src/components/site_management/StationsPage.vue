<template>
    <v-container>
        <v-row>
            <v-col cols="4">
                <v-btn color="green" @click="dialog = true">Add Station</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :items="stations"
                >
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn small icon>
                            <v-icon @click="deleteStation(item)" color="red">mdi-delete</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="dialog" persistent max-width="500">
                <v-card>
                    <v-card-title>New Station</v-card-title>
                    <v-card-text>
                        <v-text-field outlined label="Site name" v-model="name"></v-text-field>
                        <v-select outlined label="Select Batch" v-model="batch" :items="batch_list"></v-select>
                        <v-autocomplete outlined label="Site" item-value="name" v-model="site" item-text="name" :items="sites"></v-autocomplete>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="createStation" :disabled="name == null || name == ''" :loading="loading" color="green">Save</v-btn>
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
            {text: 'Station', value: 'name'},
            {text: 'Site', value: 'site'},
            {text: 'Batch', value: 'batch'},
            {text: 'Actions', value: 'actions'},
        ],
        name: null,
        batch: null,
        site: null,
        loading: false,
        batch_list: ['BT39', 'CCK', 'WDLS'],
    }),

    methods: {
        createStation() {
            this.loading = true
            pocketbase.collection('stations').create({name: this.name, site: this.site, batch: this.batch})
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'success', message: 'Station created'})
                this.$store.dispatch('getStations')
                this.clear()
            })
            .catch((err) => {
                console.log(err.message)
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.clear()
            })
        },
        deleteStation(item) {
            pocketbase.collection('stations').delete(item.id)
            .then(() => {
                this.$store.dispatch('createAlert',{type: 'info', message: 'Site deleted'})
                this.$store.dispatch('getStations')
            })
            .catch((err) => {
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
            })
        },

        clear() {
            this.name = null
            this.site = null
            this.batch = null
            this.dialog = null
            this.loading = false
        }
    },

    computed: {
        sites () {
            if(this.batch != null) {
                let all_sites = this.$store.getters.loadedSites
                return all_sites.filter((site) => {
                    return site.batch == this.batch
                })
            }else{
                return []
            }
        },

        stations () {
            return this.$store.getters.loadedStations
        }
    }
}
</script>