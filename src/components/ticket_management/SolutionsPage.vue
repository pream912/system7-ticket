<template>
    <v-container>
    <div v-if="access.includes(42)">
        <v-row>
            <v-col v-if="access.includes(421)" cols="4">
                <v-btn color="green" @click="dialog = true">Add Solution</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :items="solutions"
                >
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn v-if="access.includes(422)" small icon>
                            <v-icon @click="editSolution(item)" color="orange">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn v-if="access.includes(423)" small icon>
                            <v-icon @click="deleteSolution(item)" color="red">mdi-delete</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="dialog" persistent max-width="500">
                <v-card>
                    <v-card-title>Solution Details</v-card-title>
                    <v-card-text>
                        <v-text-field label="Solution name" v-model="name"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn v-if="editing" @click="updateSolution" :disabled="name == null || name == ''" :loading="loading" color="blue">Update</v-btn>
                        <v-btn v-if="!editing" @click="createSolution" :disabled="name == null || name == ''" :loading="loading" color="green">Save</v-btn>
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
            {text: 'Solution', value: 'name'},
            {text: 'Actions', value: 'actions'},
        ],
        name: null,
        loading: false,
        editing: false,
        selectedItem: {}
    }),

    methods: {
        createSolution() {
            this.loading = true
            pocketbase.collection('solutions').create({name: this.name})
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'success', message: 'Solution created'})
                this.$store.dispatch('getSolutions')
                this.clear()
            })
            .catch((err) => {
                console.log(err.message)
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.clear()
            })
        },

        editSolution(item) {
            this.selectedItem = item
            this.editing = true
            this.name = item.name
            this.dialog = true
        },

        updateSolution() {
            this.loading = true
            pocketbase.collection('solutions').update(this.selectedItem.id, {name: this.name})
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'info', message: 'Solution updated'})
                this.$store.dispatch('getSolutions')
                this.clear()
            })
            .catch((err) => {
                console.log(err.message)
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.clear()
            })
        },
         
        deleteSolution(item) {
            pocketbase.collection('solutions').delete(item.id)
            .then(() => {
                this.$store.dispatch('createAlert',{type: 'info', message: 'Solution deleted'})
                this.$store.dispatch('getSolutions')
            })
            .catch((err) => {
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
            })
        },

        clear() {
            this.name = null
            this.dialog = null
            this.loading = false
        }
    },

    computed: {
        solutions () {
            return this.$store.getters.loadedSolutions
        },

        access() {
            return this.$store.getters.loadedPermissions
        }
    }
}
</script>