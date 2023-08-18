<template>
    <v-container fluid style="height:100%;">
        <v-snackbar
        :timeout="3000"
        :value="snack"
        absolute
        top
        :color="scolor"
        outlined
        center
        >
            {{stext}}
        </v-snackbar>
        <v-row align="center" justify="space-around" style="height:100%">
            <v-col class="px-15 pb-10 pt-10" md="12" xs="12" align="center" >
                <v-card class="rounded-xl" elevation="10" max-width="600px">
                    <v-card-title>Login</v-card-title>
                    <v-card-text>
                        <v-text-field prepend-inner-icon="mdi-account" v-model="username" label="Username" ></v-text-field>
                        <v-text-field prepend-inner-icon="mdi-lock" v-model="password" type="password" label="Password"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn rounded :loading="loading" @click="login" color="green">Login</v-btn>
                        <v-spacer></v-spacer>
                        <!-- <v-btn text @click="reg = !reg" color="green">Go to Signup</v-btn> -->
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {pocketbase} from '../pocketbase'
export default {
    data: () => ({
        reg: false,
        valid: true,
        name: '',
        username: '',
        phone: '',
        phoneRules: [
            v => !!v || 'Phone number is required',
            v => /^[6-9]{1}[0-9]{9}$/.test(v) || 'Enter valid phone number',
        ],
        emailRules: [
            v => !!v || 'E-mail is required',
            v => /.+@.+\..+/.test(v) || 'Enter valid email address',
        ],
        password: '',
        rpassword: '',
        loading: false,
        snack: false,
        scolor: '',
        stext: ''
    }),

    methods: {
        login() {
            this.loading = true
            pocketbase.collection('users').authWithPassword(this.username, this.password)
            .then(() => {
                if(!pocketbase.authStore.model.satus) {
                    this.loading = false
                    pocketbase.authStore.clear()
                    this.$store.dispatch('createAlert',{type: 'error', message: 'Your account has been deactivated!'})
                }
            })
            .catch((err) => {
                alert(err.message)
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.loading = false
            })
            
        
        },
 
    },

    computed: {
        passMatch () {
            return [v => (!!v && v) === this.password ||'Values do not match']
        }
    }
}
</script>

<style scoped>
    body {
        background-color: black;
    }
</style>