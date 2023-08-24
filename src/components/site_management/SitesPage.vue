<template>
    <v-container>
    <div v-if="access.includes(31)">
        <v-row>
            <v-col v-if="access.includes(311)" cols="4">
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
                        <v-btn v-if="access.includes(312)" small icon>
                            <v-icon @click="editSite(item)" color="orange">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn small icon>
                            <v-icon v-if="access.includes(313)" @click="deleteSite(item)" color="red">mdi-delete</v-icon>
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
                        <v-btn v-if="editing" @click="updateSite" :disabled="name == null || name == ''" :loading="loading" color="blue">Update</v-btn>
                        <v-btn v-else @click="createSite" :disabled="name == null || name == ''" :loading="loading" color="green">Save</v-btn>
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
        csvfile: null,
        dialog: false,
        headers: [
            {text: 'Site', value: 'name'},
            {text: 'Batch', value: 'batch'},
            {text: 'Actions', value: 'actions'},
        ],
        name: null,
        batch: null,
        batch_list: ['BT39', 'CCK', 'WDLS'],
        loading: false,
        editing: false,
        selectedItem: {},
        json: ['1']
    }),

    methods: {
        async importData() {
            let file = this.csvfile
            var reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = function(e) {
                var jsonData = [];
                var headers = [];
                var rows = e.target.result.split("\r\n");               
                for (var i = 0; i < rows.length; i++) {
                    var cells = rows[i].split(",");
                    var rowData = {};
                    for(var j=0;j<cells.length;j++){
                        if(i==0){
                            var headerName = cells[j].trim();
                            headers.push(headerName);
                        }else{
                            var key = headers[j];
                            if(key){
                                rowData[key] = cells[j].trim();
                            }
                        }
                    }
                    //skip the first row (header) data
                    if(i!=0){
                        jsonData.push(rowData);
                    }
                }
                for(let i in jsonData) {
                    pocketbase.collection('sites').create({name: jsonData[i].site, batch: jsonData[i].batch}, { '$autoCancel': false })
                    .then((d) => console.log(d))
                }
                  
                //displaying the json result in string format
                }
                console.log(reader);
                //this.uploadData()
            },

        async uploadData() {
            console.log('Uploading....');
            let data = this.json
            console.log(data)
            for(let i in data) {
                await pocketbase.collection('sites').create({name: data[i].site, batch: data[i].batch})
                .then((d) => console.log(d))
            }
        },

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

        editSite(item) {
            this.selectedItem = item
            this.batch = item.batch
            this.name = item.name 
            this.editing = true
            this.dialog = true
        },

        updateSite() {
            this.loading = true
            pocketbase.collection('sites').update(this.selectedItem.id, {name: this.name, batch: this.batch})
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'info', message: 'Site updated'})
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
            this.editing = false
            this.selectedItem = {}
            this.dialog = null
            this.loading = false
        }
    },

    computed: {
        sites () {
            return this.$store.getters.loadedSites
        },

        access() {
            return this.$store.getters.loadedPermissions
        }
    }
}
</script>