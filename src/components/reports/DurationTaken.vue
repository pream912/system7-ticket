<template>
    <v-container>
        <v-row>
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
            <v-col>
                <v-btn v-if="tickets.length > 0" small color="green" @click="JSONToCSVConvertor(tickets, `status_report`)">Export data</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :items="tickets"
                :search="search"
                >
                    <template v-slot:[`item.status`]="{ item }">
                        <div v-if="item.status == 'open'" class="red--text">{{ item.status }}</div>
                        <div v-if="item.status == 'followup'" class="orange--text">{{ item.status }}</div>
                        <div v-if="item.status == 'closed'" class="green--text">{{ item.status }}</div>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { pocketbase } from '../../pocketbase'
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
            {text: 'Duration', value: 'duration'},
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
        t_action: null,
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

        JSONToCSVConvertor(JSONData, ReportTitle) {
            var ShowLabel = Object.keys(this.tickets[0])

            //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
            var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
            var CSV = '';
            //This condition will generate the Label/Header
            if (ShowLabel) {
                var row = "";

                //This loop will extract the label from 1st index of on array
                for (var index in arrData[0]) {
                    //Now convert each value to string and comma-seprated
                    row += index + ',';
                }
                row = row.slice(0, -1);
                //append Label row with line break
                CSV += row + '\r\n';
            }

            //1st loop is to extract each row
            for (var i = 0; i < arrData.length; i++) {
                row = "";
                //2nd loop will extract each column and convert it in string comma-seprated
                for (index in arrData[i]) {
                    row += '"' + arrData[i][index] + '",';
                }
                row.slice(0, row.length - 1);
                //add a line break after each row
                CSV += row + '\r\n';
            }

            if (CSV == '') {
                alert("Invalid data");
                return;
            }

            //this trick will generate a temp "a" tag
            var link = document.createElement("a");
            link.id = "lnkDwnldLnk";

            //this part will append the anchor tag and remove it after automatic click
            document.body.appendChild(link);

            var csv = CSV;
            //var blob = new Blob([csv], { type: 'text/csv' });
            //var csvUrl = window.webkitURL.createObjectURL(blob);
            var filename =  (ReportTitle || 'UserExport') + '.csv';
            link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv));
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
            let time_taken = 0
            if(this.duration == 'All'){
                st = all_tickets
            } 
            else {
                st = all_tickets.filter((item) => {
                    return item.ticket_id >= this.frange  && item.ticket_id < this.trange
                })
            }

            for(let i in st) {
                time_taken = +st[i].closedOn - +st[i].ticket_id
                attended_by = st[i].attendedBy != "" ? `${this.$store.getters.loadedUser(st[i].attendedBy).name} (${this.$store.getters.loadedUser(st[i].attendedBy).designation})` : '-'
                close_date = st[i].closedOn != 0 ? this.toLocalDate(st[i].closedOn) : '-'
                if(st[i].status == 'closed') {
                    ft.push({
                        ticket_id: st[i].ticket_id,
                        open_date: this.toLocalDate(st[i].ticket_id),
                        site: st[i].site,
                        station: st[i].station,
                        requested_by: `${this.$store.getters.loadedUser(st[i].createdBy).name} (${this.$store.getters.loadedUser(st[i].createdBy).designation})`,
                        status: st[i].status,
                        attended_by: attended_by,
                        close_date: close_date,
                        id: st[i].id,
                        batch: st[i].batch,
                        issue: st[i].issue,
                        solution: st[i].solution,
                        duration: new Date(time_taken).toISOString().slice(11, 19)
                    })
                }
            }
            console.log(ft);
            let cft = ft.filter((item => {
                item.status == 'closed'
            }))
            console.log(cft);
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
    }, 
    mounted() {
        this.dateFilters()
    }
}
</script>
