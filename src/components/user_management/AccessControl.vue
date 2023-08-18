<template>
    <v-container>
    <div v-if="access.includes(23)">
        <v-row>
            <v-col cols="12">
                <h3>User Access Control</h3>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="4">
                <v-select @change="changeSelection" filled label="Access level" :items="access_list" v-model="access_level"></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-treeview
                    selectable
                    :items="items"
                    selection-type="independent"
                    v-model="selection"
                    @input="updateObject"
                ></v-treeview>
            </v-col>
        </v-row>
        <v-row>
            <v-col v-if="access.includes(231)" cols="4">
                <v-btn color="green" @click="updateUac" :loading="loading">Update</v-btn>
            </v-col>
        </v-row>
    </div>
    </v-container>
</template>

<script>
import { pocketbase } from '../../pocketbase'
export default {
    data: () => ({
        access_level: 'Level1',
        access_list: ['Level1', 'Level2', 'Level3', 'Level4', 'Level5'],
        selection: [],
        items: [
            {
                id: 1,
                name: 'Dashboard',
            },
            {
                id: 2,
                name: 'User Management',
                children: [
                    {id: 21, name: 'Designation',
                    children: [
                        {id: 211, name: 'Create'},
                        {id: 212, name: 'Edit'},
                        {id: 213, name: 'Delete'},
                    ]
                    },
                    {id: 22, name: 'Users',
                    children: [
                        {id: 221, name: 'Create'},
                        {id: 222, name: 'Edit'},
                        {id: 223, name: 'Delete'},
                    ]
                    },
                    {id: 23, name: 'Access control',
                    children: [
                        {id: 231, name: 'Edit'},
                    ]
                    },
                ]
            },
            {
                id: 3,
                name: 'Site management',
                children: [
                    {id: 31, name: 'Sites',
                    children: [
                        {id: 311, name: 'Create'},
                        {id: 312, name: 'Edit'},
                        {id: 313, name: 'Delete'},
                    ]},
                    {id: 32, name: 'Stations',
                    children: [
                        {id: 321, name: 'Create'},
                        {id: 322, name: 'Edit'},
                        {id: 323, name: 'Delete'},
                    ]},
                ]
            },
            {
                id: 4,
                name: 'Ticket management',
                children: [
                    {id: 41, name: 'Issue', 
                    children: [
                        {id: 411, name: 'Create'},
                        {id: 412, name: 'Edit'},
                        {id: 413, name: 'Delete'},
                    ]},
                    {id: 42, name: 'Solutions',
                    children: [
                        {id: 421, name: 'Create'},
                        {id: 422, name: 'Edit'},
                        {id: 423, name: 'Delete'},
                    ]},
                    {id: 43, name: 'Tickets',
                    children: [
                        {id: 431, name: 'Create'},
                        {id: 432, name: 'Update'},
                        {id: 433, name: 'Delete'},
                    ]},
                ]
            },
            {
                id: 5,
                name: 'Reports',
                children: [
                    {id: 51, name: 'Ticket Status'},
                    {id: 52, name: 'User activity'},
                    {id: 53, name: 'Duration taken'},
                    {id: 54, name: 'Issue wise'},
                ]
            },
            {
                id: 6,
                name: 'Settings',
                children: [
                    {id: 61, name: 'Email settings',
                    children: [
                        {id: 611, name: 'Edit'},
                    ]}
                ]
            }
        ],
        id: null,
        uac: {
            l1: [],
            l2: [],
            l3: [],
            l4: [],
            l5: []
        },
        loading: false
    }),

    methods: {
        getSettings() {
            let settings = this.settings
            this.id = settings.id
            this.uac = settings.uac
            this.access_level = 'Level1'
            this.selection = this.uac.l1
        },

        updateUac() {
            let uac = this.uac

            pocketbase.collection('settings').update(this.id, {
                uac: uac
            })
            .then(() =>{
                this.$store.dispatch('createAlert',{type: 'info', message: 'Access control updated'})
                this.loading = false
            })
            .catch((err) => {
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.loading = false
            })
        },

        updateObject() {
            if(this.access_level == 'Level1') {
                this.uac.l1 = this.selection
            }
            if(this.access_level == 'Level2') {
                this.uac.l2 = this.selection
            }
            if(this.access_level == 'Level3') {
                this.uac.l3 = this.selection
            }
            if(this.access_level == 'Level4') {
                this.uac.l4 = this.selection
            }
            if(this.access_level == 'Level5') {
                this.uac.l5 = this.selection
            }
        },

        changeSelection() {
            if(this.access_level == 'Level1') {
                this.selection = this.uac.l1 
            }
            if(this.access_level == 'Level2') {
                this.selection = this.uac.l2
            }
            if(this.access_level == 'Level3') {
                this.selection = this.uac.l3 
            }
            if(this.access_level == 'Level4') {
                this.selection = this.uac.l4 
            }
            if(this.access_level == 'Level5') {
                this.selection = this.uac.l5 
            }
        }
    },

    computed: {
        settings() {
            return this.$store.getters.loadedSettings
        },

        access() {
            return this.$store.getters.loadedPermissions
        }
    },

    mounted() {
        this.getSettings()
    }
}
</script>