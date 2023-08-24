<template>
    <v-container>
    <div v-if="access.includes(43)">
        <v-row>
            <v-col cols="12">
                <v-btn v-if="access.includes(431)" color="green" @click="dialog = true">New Ticket</v-btn>
            </v-col>
            <v-col cols="4">
                <v-select @change="dateFilters" value="Current month" filled label="Duration" v-model="duration" :items="duraList"></v-select>
            </v-col>
            <v-col cols="4">
                <v-text-field filled label="Search" v-model="search" append-icon="mdi-magnify"></v-text-field>
            </v-col>
            <v-col cols="4"></v-col>
            <v-col v-if="duration == 'Select range'" cols="4">
                <v-menu
                    v-model="fmenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                >
                    <template v-slot:activator="{ on }">
                    <v-text-field 
                    filled
                    v-model="fdate"
                    label="From date"
                    v-on="on"
                    readonly
                    ></v-text-field>
                    </template>
                    <v-date-picker @change="dateFilters" v-model="fdate"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col v-if="duration == 'Select range'" cols="4">
                <v-menu
                    v-model="tmenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                >
                    <template v-slot:activator="{ on }">
                    <v-text-field 
                    filled
                    v-model="tdate"
                    label="To date"
                    v-on="on"
                    readonly
                    ></v-text-field>
                    </template>
                    <v-date-picker @change="dateFilters" v-model="tdate"></v-date-picker>
                </v-menu>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :items="tickets"
                :search="search"
                >
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn small icon @click="openTicket(item)">
                            <v-icon class="green--text">mdi-open-in-new</v-icon>
                        </v-btn>
                        <v-btn v-if="item.status == 'open' && access.includes(433)" small icon>
                            <v-icon @click="deleteTicket(item)" color="red">mdi-delete</v-icon>
                        </v-btn>
                    </template>
                    <template v-slot:[`item.status`]="{ item }">
                        <div v-if="item.status == 'open'" class="red--text">{{ item.status }}</div>
                        <div v-if="item.status == 'followup'" class="orange--text">{{ item.status }}</div>
                        <div v-if="item.status == 'closed'" class="green--text">{{ item.status }}</div>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="dialog" max-width="900">
                <v-card>
                    <v-form ref="ticketForm">
                        <v-card-title>Ticket Details</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col>
                                    <v-select :readonly="watching" :rules="reqRule" outlined label="Select Batch" v-model="batch" :items="batch_list"></v-select>
                                </v-col>
                                <v-col>
                                    <v-autocomplete :readonly="watching" :rules="reqRule" outlined label="Site" item-value="name" v-model="site" item-text="name" :items="sites"></v-autocomplete>
                                </v-col>
                                <v-col>
                                    <v-autocomplete :readonly="watching" :rules="reqRule" outlined label="Station" item-value="name" v-model="station" item-text="name" :items="stations"></v-autocomplete>
                                </v-col>
                                <v-col cols="12">
                                    <v-autocomplete :readonly="watching" :rules="reqRule" outlined label="Issue" item-value="name" v-model="issue" item-text="name" :items="issues"></v-autocomplete>
                                </v-col>
                                <v-col cols="12">
                                    <v-data-table
                                    :headers="headers1"
                                    :items="log"
                                    hide-default-footer
                                    dense
                                    >
                                        <template v-slot:[`item.updatedBy`]="{ item }">
                                            <div>{{ getUserName(item.updatedBy) }}</div>
                                        </template>
                                        <template v-slot:[`item.timestamp`]="{ item }">
                                            <div>{{ toLocalDate(item.timestamp) }}</div>
                                        </template>
                                        <template v-slot:[`item.time`]="{ item }">
                                            <div>{{ toLocalTime(item.timestamp) }}</div>
                                        </template>
                                        <template v-slot:[`item.action`]="{ item }">
                                            <div>{{ item.action }}</div>
                                        </template>
                                        <template v-slot:[`item.remarks`]="{ item }">
                                            <div>{{ item.remarks }}</div>
                                        </template>
                                    </v-data-table>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn v-if="!watching" :loading="loading" @click="createTicket" color="green">Save</v-btn>
                            <v-btn color="red" @click="clear">Close</v-btn>
                            <v-spacer></v-spacer>
                            <v-btn v-if="watching && access.includes(432)" @click="dialog1 = true" color="blue">Update</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <v-dialog v-model="dialog1" max-width="500">
                <v-card>
                    <v-card-title>Update ticket</v-card-title>
                    <v-card-text>
                        <v-form ref="updateForm">
                            <v-select outlined :rules="reqRule" v-model="t_action" :items="action_list" label="Select action"></v-select>
                            <v-autocomplete v-if="t_action == 'Close ticket'" :rules="reqRule" outlined label="Solution" item-value="name" v-model="solution" item-text="name" :items="solutions"></v-autocomplete>
                            <v-text-field outlined v-model="t_remark" label="Remark"></v-text-field>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn :disabled="t_action == null" :loading="loading" @click="updateTicket" color="green">Update</v-btn>
                        <v-btn @click="clear" color="red">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
    </v-container>
</template>

<script>
import { pocketbase } from '../../pocketbase'
import axios from 'axios'
export default {
    data: () => ({
        duraList: ['Current month', 'Last 7 days', 'All', 'Select range'],
        duration: 'Current month',
        dmenu: false,
        idate: null,
        frange: null,
        trange: null,
        fmenu: false,
        tmenu: false,
        fdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        tdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        headers: [
            {text: 'Ticket ID', value: 'ticket_id'},
            {text: 'Created on', value: 'open_date'},
            {text: 'Site', value: 'site'},
            {text: 'Station', value: 'station'},
            {text: 'Requested by', value: 'requested_by'},
            {text: 'Attended by', value: 'attended_by'},
            {text: 'Closed on', value: 'close_date'},
            {text: 'Status', value: 'status'},
            {text: '', value: 'actions'},
        ],
        headers1: [
            {text: 'Updated by', value: 'updatedBy'},
            {text: 'Updated on', value: 'timestamp'},
            {text: 'Time', value: 'time'},
            {text: 'Action', value: 'action'},
            {text: 'Remark', value: 'remark'}
        ],
        batch_list: ['BT39', 'CCK', 'WDLS'],
        status_list: ['closed', 'followup'],
        action_list: ['Close ticket', 'Followup'],
        t_remark: '',
        t_action: 'Close ticket',
        remarks: null,
        batch: null,
        site: null,
        station: null,
        dialog: false,
        dialog1: false,
        issue: null,
        solution: null,  
        reqRule: [v => !!v || 'This field is required'],  
        loading: false,
        search: null,
        watching: false,
        log: null,
        selectedItem: {}    
    }),

    methods: {

        sendTelegram(message) {
            axios.get(`https://api.telegram.org/bot${this.settings.botkey}/sendMessage?chat_id=${this.settings.channelid}&text=${message}`)
        },

        async createTicket() {
            this.loading = true
            let valid = await this.$refs.ticketForm.validate()
            if(!valid) {
                this.$store.dispatch('createAlert',{type: 'error', message: 'Fill all required fields'})
                this.loading = false
                return
            }
            let timestamp = new Date().getTime()
            const ticket = {
                ticket_id: timestamp,
                batch: this.batch,
                site: this.site,
                station: this.station,
                issue: this.issue,
                solution: this.solution,
                status: 'open',
                createdBy: this.user.id,
                remarks: this.remarks,
                log: [{
                    action: 'open',
                    timestamp: timestamp,
                    updatedBy: this.user.id,
                    remark: ''
                }]
            }
            pocketbase.collection('tickets').create(ticket)
            .then((data) => {
                console.log(data)
                this.$store.dispatch('createAlert',{type: 'success', message: 'Ticket created'})
                this.$store.dispatch('getTickets')
                let message = `Ticket ID ${ticket.ticket_id} has been opened by ${this.getUserName(ticket.createdBy)} for satation ${ticket.station}. Ticket status: Open`
                this.sendTelegram(message)
                this.clear()
            })
            .catch((err) => {
                console.log(err.message)
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                this.clear()
            })
        },

        openTicket(item) {
            this.watching = true
            this.dialog = true
            this.batch = item.batch
            this.site = item.site
            this.station = item.station
            this.issue = item.issue
            this.log = item.log
            this.selectedItem = item
            console.log(item)
        },

        async updateTicket() {
            this.loading = true
            let valid = await this.$refs.updateForm.validate()
            if(!valid) {
                this.$store.dispatch('createAlert',{type: 'error', message: 'Fill all required fields'})
                this.loading = false
                return
            }
            let item = this.selectedItem
            let log = item.log
            let timestamp = new Date().getTime()
            log.push({
                    action: this.t_action == 'Followup' ? 'followup' : 'closed',
                    timestamp: timestamp,
                    updatedBy: this.user.id,
                    remark: this.t_remark
                })
            if(this.t_action == 'Followup') {
                pocketbase.collection('tickets').update(item.id, {
                    log:log, 
                    status: this.t_action == 'Followup' ? 'followup' : 'closed',
                    attendedBy: this.user.id
                })
                .then(() => {
                    this.$store.dispatch('createAlert',{type: 'info', message: 'Ticket updated'})
                    this.$store.dispatch('getTickets')
                    let message = `Ticket ID ${item.ticket_id} has been attended by ${this.getUserName(this.user.id)} for satation ${item.station}. Ticket status: ${this.t_action}`
                    this.sendTelegram(message)
                    this.clear()
                })
                .catch((err) => {
                    this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                    this.clear()
                })
            } else {
                pocketbase.collection('tickets').update(item.id, {
                    log:log,
                    closedOn: timestamp,
                    attendedBy: this.user.id,
                    solution: this.solution,
                    status: this.t_action == 'Followup' ? 'followup' : 'closed',
                })
                .then(() => {
                    this.$store.dispatch('createAlert',{type: 'info', message: 'Ticket updated'})
                    this.$store.dispatch('getTickets')
                    this.clear()
                })
                .catch((err) => {
                    console.log(err.message)
                    this.$store.dispatch('createAlert',{type: 'error', message: err.message})
                    this.clear()
                })
            }

        },

        deleteTicket(item) {
            pocketbase.collection('tickets').delete(item.id)
            .then(() => {
                this.$store.dispatch('createAlert',{type: 'info', message: 'Ticket deleted'})
                this.$store.dispatch('getTickets')
            })
            .catch((err) => {
                this.$store.dispatch('createAlert',{type: 'error', message: err.message})
            })
        },

        clear() {
            this.batch = null
            this.site = null
            this.station = null
            this.issue = null
            this.solution = null
            this.dialog = false
            this.dialog1 = false
            this.t_action = null
            this.t_remark = null
            this.watching = false
            this.log = null
            this.selectedItem = {}
            this.loading = false
        },

        getUserName(id) {
            return this.$store.getters.loadedUser(id).name
        },

        dateFilters() {
            this.tmenu = false
            this.fmenu = false
            if(this.duration == 'Current month') {
                let date = new Date()
                let cmonth = date.getMonth()
                date.setDate(1)
                date.setHours(0,0,0,0)
                let nex = new Date()
                nex.setMonth(cmonth + 1)
                nex.setDate(1)
                nex.setHours(0,0,0,0)
                this.frange = date.getTime()
                this.trange = nex.getTime()
            }
            if(this.duration == 'Last 7 days') {
                let date = new Date()
                let fdate = new Date()
                let tdate = new Date()
                let cdate = date.getDate()
                fdate.setDate(cdate - 7)
                fdate.setHours(0,0,0,0)
                tdate.setDate(cdate + 1)
                tdate.setHours(0,0,0,0)
                this.frange = fdate.getTime()
                this.trange = tdate.getTime()
            }
            if(this.duration == 'Select range') {
                this.frange = new Date(this.fdate).getTime()
                let tdate = new Date(this.tdate)
                let day = new Date(this.tdate).getDate()
                tdate.setDate(day + 1)
                tdate.setHours(0,0,0,0)
                this.trange = tdate.getTime()
            }
        },

        toLocalDate(date) {
            return new Date(+date).toLocaleDateString('en-IN')
        },
        toLocalTime(date) {
            return new Date(+date).toLocaleTimeString('en-IN')
        },
    },

    computed: {
        tickets() {
            let all_tickets = this.$store.getters.loadedTickets
            let ft = []
            let st = []
            let attended_by = null
            let close_date = null
            if(this.duration == 'All'){
                st = all_tickets
            } 
            else {
                st = all_tickets.filter((item) => {
                    return item.ticket_id >= this.frange  && item.ticket_id < this.trange
                })
            }

            for(let i in st) {
                attended_by = st[i].attendedBy != "" ? `${this.$store.getters.loadedUser(st[i].attendedBy).name} (${this.$store.getters.loadedUser(st[i].attendedBy).designation})` : '-'
                close_date = st[i].closedOn != 0 ? this.toLocalDate(st[i].closedOn) : '-'
                ft.push({
                    ticket_id: st[i].ticket_id,
                    open_date: this.toLocalDate(st[i].ticket_id),
                    site: st[i].site,
                    station: st[i].station,
                    requested_by: `${this.$store.getters.loadedUser(st[i].createdBy).name} (${this.$store.getters.loadedUser(st[i].createdBy).designation})`,
                    status: st[i].status,
                    attended_by: attended_by,
                    close_date: close_date,
                    log: st[i].log,
                    id: st[i].id,
                    batch: st[i].batch,
                    issue: st[i].issue,
                    solution: st[i].solution
                })
            }
            console.log(ft);
            return ft
        },

        issues() {
            return this.$store.getters.loadedIssues
        },
        solutions() {
            return this.$store.getters.loadedSolutions
        },
        sites() {
            if(this.batch != null) {
                let all_sites = this.$store.getters.loadedSites
                return all_sites.filter((site) => {
                    return site.batch == this.batch
                })
            }else{
                return []
            }
        },
        stations() {
            if(this.site != null) {
                let all_stations = this.$store.getters.loadedStations
                return all_stations.filter((station) => {
                    return station.site == this.site
                })
            } else {
                return []
            }
        },

        user() {
            return pocketbase.authStore.model
        },

        access() {
            return this.$store.getters.loadedPermissions
        },

        settings() {
            return this.$store.getters.loadedSettings
        }

    }, 
    mounted() {
        this.dateFilters()
    }
}
</script>
