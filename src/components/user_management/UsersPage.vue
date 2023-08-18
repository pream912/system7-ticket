<template>
    <v-container>
    <div v-if="access.includes(22)">
        <v-row>
            <v-col v-if="access.includes(221)" cols="4">
                <v-btn color="green" @click="dialiog = true">Add user</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="4">
                <v-text-field filled label="Search" v-model="search" append-icon="mdi-magnify"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :items="users"
                :search="search"
                >
                    <template v-slot:[`item.status`]="{ item }">
                        <div v-if="item.status" class="green--text"> Active </div>
                        <div v-else class="red--text"> Deactivated </div>
                    </template>
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn v-if="access.includes(222)" small icon>
                            <v-icon @click="editUser(item)" color="orange">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn v-if="item.status && access.includes(223)" small icon>
                            <v-icon @click="deactivateUser(item)" color="red">mdi-cancel</v-icon>
                        </v-btn>
                        <v-btn v-if="!item.status && access.includes(223)" small icon>
                            <v-icon @click="activateUser(item)" color="green">mdi-check</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="dialiog" max-width="700">
                <v-card>
                    <v-form ref="userForm">
                        <v-card-title>User details</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field :rules="reqRule" outlined label="Full Name" v-model="name"></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field :rules="reqRule" outlined label="Username" v-model.trim="username"></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field :rules="emailRules" outlined label="Email" v-model="email"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-autocomplete :rules="reqRule" outlined label="Designation" item-value="name" v-model="designation" item-text="name" :items="designations"></v-autocomplete>
                                </v-col>
                                <v-col cols="6">
                                    <v-select :rules="reqRule" outlined label="Access level" :items="access_list" v-model="access_level"></v-select>
                                </v-col>
                                <v-col cols="12">
                                    <v-checkbox v-if="editing" label="Change password" v-model="changePassword"></v-checkbox>
                                </v-col>
                                <v-col cols="6"> 
                                    <v-text-field v-if="!editing || changePassword" :rules="passwordRules" outlined label="Old Password" v-model="oldPassword" type="password"></v-text-field>
                                </v-col>
                                <v-col cols="6"></v-col>
                                <v-col cols="6">
                                    <v-text-field v-if="!editing || changePassword" :rules="passwordRules" outlined label="Password" v-model="password" type="password"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-if="!editing || changePassword" :rules="passwordConfirmRule" outlined label="Confirm Password" v-model="passwordConfirm" type="password"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn v-if="!editing" :loading="loading" color="green" @click="createUser">Save</v-btn>
                            <v-btn v-if="editing" :loading="loading" color="blue" @click="updateUser">Update</v-btn>
                            <v-btn color="red" @click="clear">Close</v-btn>
                        </v-card-actions>
                    </v-form>
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
            {text: 'Username', value: 'username'},
            {text: 'Name', value: 'name'},
            {text: 'Email', value: 'email'},
            {text: 'Access Level', value: 'access_level'},
            {text: 'Designation', value: 'designation'},
            {text: 'Status', value: 'status'},
            {text: 'Actions', value: 'actions'},
        ],
        selectedItem: {},
        name: null,
        username: null,
        email: null,
        password: null,
        passwordConfirm: null,
        oldPassword: null,
        designation: null,
        access_level: null,
        access_list: ['Level1', 'Level2', 'Level3', 'Level4', 'Level5'],
        dialiog: false,
        loading: false,
        search: null,
        editing: false,
        changePassword: false,
        reqRule: [v => !!v || 'This field is required'],
        emailRules: [
            v => !!v || 'E-mail is required',
            v => /.+@.+\..+/.test(v) || 'Enter valid email address',
        ],
        passwordRules: [
            v => !!v || 'This field is required',
            v => /^.{8,}$/.test(v) || 'Password should be minimum 8 characters'
        ],
        // passwordConfirmRule: [
        //     v => !!v || 'This field is required',
        //     v => v === this.password || 'Password does not match'
        // ]
    }),

    methods: {
        async createUser() {
            this.loading = true
            let valid = await this.$refs.userForm.validate()
            console.log(valid);
            if(!valid) {
                this.$store.dispatch('createAlert',{type: 'error', message: 'Fill all required fields'})
                this.loading = false
                return
            }
            const user = {
                username: this.username,
                email: this.email,
                emailVisibility: true,
                password: this.password,
                passwordConfirm: this.passwordConfirm,
                name: this.name,
                access_level: this.access_level,
                designation: this.designation,
                status: true
            }
            pocketbase.collection('users').create(user)
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'success', message: 'User created'})
                this.$store.dispatch('getUsers')
                this.clear()
            })
            .catch((err) => {
                console.log(err.message)
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.clear()
            })
        },

        editUser(item) {
            this.editing = true
            this.selectedItem = item
            this.username = item.username
            this.name = item.name,
            this.email = item.email
            this.access_level = item.access_level
            this.designation = item.designation
            this.dialiog = true
        },

        async updateUser() {
            this.loading = true
            let valid = await this.$refs.userForm.validate()
            console.log(valid);
            if(!valid) {
                this.$store.dispatch('createAlert',{type: 'error', message: 'Fill all required fields'})
                this.loading = false
                return
            }
            let user = null
            if(!this.changePassword) {
                user = {
                    username: this.username,
                    email: this.email,
                    name: this.name,
                    access_level: this.access_level,
                    designation: this.designation,
                }
            } else {
                user = {
                    username: this.username,
                    email: this.email,
                    name: this.name,
                    access_level: this.access_level,
                    designation: this.designation,
                    oldPassword: this.oldPassword,
                    password: this.password,
                    passwordConfirm: this.passwordConfirm,
                }
            }
            console.log(user);
            
            pocketbase.collection('users').update(this.selectedItem.id, user)
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'info', message: 'User updated'})
                this.$store.dispatch('getUsers')
                this.clear()
            })
            .catch((err) => {
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.clear()
            })
        },

        deactivateUser(item) {
            pocketbase.collection('users').update(item.id, {status: false})
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'info', message: 'User updated'})
                this.$store.dispatch('getUsers')
                this.clear()
            })
            .catch((err) => {
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.clear()
            })
        },

        activateUser(item) {
            pocketbase.collection('users').update(item.id, {status: true})
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'info', message: 'User updated'})
                this.$store.dispatch('getUsers')
                this.clear()
            })
            .catch((err) => {
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.clear()
            })
        },

        clear() {
            this.name = null
            this.username = null
            this.email = null
            this.password = null
            this.passwordConfirm = null
            this.designation = null
            this.access_level = null
            this.loading = false
            this.editing = false
            this.selectedItem = {}
            this.dialiog = false
        },
    },

    computed: {
        users() {
            return this.$store.getters.loadedUsers
        },

        designations() {
            return this.$store.getters.loadedDesignations
        },

        passwordConfirmRule() {
            return [
                    v => !!v || 'This field is required',
                    v => v === this.password || 'Password does not match'
                ]
        },

        access() {
            return this.$store.getters.loadedPermissions
        }
    }
}
</script>