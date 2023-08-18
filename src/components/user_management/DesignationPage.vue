<template>
    <v-container>
    <div v-if="access.includes(21)">
        <v-row>
            <v-col cols="4">
                <v-btn v-if="access.includes(211)" @click="dialog = true" color="green">New Designation</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :items="designations"
                >
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn v-if="access.includes(212)" small icon>
                            <v-icon @click="editDesi(item)" color="orange">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn v-if="access.includes(213)" small icon>
                            <v-icon @click="deleteDesi(item)" color="red">mdi-delete</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="dialog" persistent max-width="500">
                <v-card>
                    <v-card-title>New Designation</v-card-title>
                    <v-card-text>
                        <v-text-field label="Designation name" v-model="name"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="createDesignation" :disabled="name == null || name == ''" :loading="loading" color="green">Save</v-btn>
                        <v-btn @click="updateDesi" :disabled="name == null || name == ''" :loading="loading" color="blue">Update</v-btn>
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
        headers: [
            {text: 'Designation', value: 'name'},
            {text: 'Actions', value: 'actions'},
        ],
        name: null,
        dialog: false,
        loading: false,
        editing: false,
        selectedItem: {}
    }),

    methods: {
        createDesignation() {
            this.loading = true
            pocketbase.collection('designations').create({name: this.name})
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'success', message: 'Designation created'})
                this.$store.dispatch('getDesignations')
                this.clear()
            })
            .catch((err) => {
                console.log(err.message)
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.clear()
            })
        },

        editDesi(item) {
            this.name = item.name
            this.selectedItem = item
            this.editing = true
        },

        updateDesi() {
            pocketbase.collection('designations').update(this.selectedItem.id, {name: this.name})
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'info', message: 'Designation updated'})
                this.$store.dispatch('getDesignations')
                this.clear()
            })
            .catch((err) => {
                console.log(err.message)
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.clear()
            })
        },

        deleteDesi(item) {
            pocketbase.collection('designations').delete(item.id)
            .then(() => {
                this.$store.dispatch('createAlert',{type: 'info', message: 'Designation deleted'})
                this.$store.dispatch('getDesignations')
            })
            .catch((err) => {
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
            })
        },

        clear() {
            this.name = null
            this.dialog = null
            this.editing = false
            this.selectedItem = {}
            this.loading = false
        }
    },
    
    computed: {
        designations () {
            return this.$store.getters.loadedDesignations
        },

        access() {
            return this.$store.getters.loadedPermissions
        }
    }
}
</script>