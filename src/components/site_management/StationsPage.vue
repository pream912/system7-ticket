<template>
    <v-container>
    <div v-if="access.includes(32)">
        <v-row>
            <v-col v-if="access.includes(321)" cols="4">
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
                        <v-btn v-if="access.includes(322)" small icon>
                            <v-icon @click="editStation(item)" color="orange">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn v-if="access.includes(323)" small icon>
                            <v-icon @click="deleteStation(item)" color="red">mdi-delete</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="dialog" persistent max-width="500">
                <v-card>
                    <v-card-title>Station Details</v-card-title>
                    <v-card-text>
                        <v-text-field outlined label="Station name" v-model="name"></v-text-field>
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
    </div>
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
        editing: false,
        selectedItem: {},
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

        editStation(item) {
            this.editing = true
            this.selectedItem = item
            this.name = item.name
            this.batch = item.batch
            this.site = item.site
            this.dialog = true
        },

        updateStation() {
            this.loading = true
            pocketbase.collection('stations').update(this.selectedItem.id, {name: this.name, site: this.site, batch: this.batch})
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'info', message: 'Station updated'})
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
            this.dialog = false
            this.editing = false
            this.selectedItem = {}
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
        },

        access() {
            return this.$store.getters.loadedPermissions
        }
    }
}
</script>