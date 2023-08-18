<template>
    <v-container>
    <div v-if="access.includes(52)">
        <v-row>
            <v-col cols="12">
                <h2>User Activity report</h2>
            </v-col>
            <v-col cols="4">
                <v-select @change="dateFilters" value="Current month" filled label="Duration" v-model="duration" :items="duraList"></v-select>
            </v-col>
            <v-col cols="4"></v-col>
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
            <v-col cols="4">
                <v-autocomplete filled label="Select user" item-value="id" v-model="selected_user" item-text="name" :items="users">
                    <template v-slot:item="data">
                        <template>
                            <v-list-item-content>
                                <v-list-item-title> {{ data.item.name }} </v-list-item-title>
                                <v-list-item-subtitle> {{ data.item.designation }} </v-list-item-subtitle>
                            </v-list-item-content>
                        </template>
                    </template>
                </v-autocomplete>
            </v-col>
            <v-col cols="4">
                <v-text-field filled label="Search" v-model="search" append-icon="mdi-magnify"></v-text-field>
            </v-col>
        </v-row>
        <v-row >
            <v-col cols="4">
                <v-card elevation="5">
                    <v-card-text>
                        <v-row align-content="center" justify="center">
                            <v-col cols="12">
                                <h3>Open Tickets</h3>
                            </v-col>
                            <v-col cols="12">
                                <h1 class="red--text">{{ opentickets.length }}</h1>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4">
                <v-card elevation="5">
                    <v-card-text>
                        <v-row align-content="center" justify="center">
                            <v-col cols="12">
                                <h3>Followups</h3>
                            </v-col>
                            <v-col cols="12">
                                <h1 class="orange--text">{{ followups.length }}</h1>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4">
                <v-card elevation="5">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <h3>Closed Tickets</h3>
                            </v-col>
                            <v-col cols="12">
                                <h1 class="green--text">{{ closedtickets.length }}</h1>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn v-if="filt_tickets.length > 0" small color="green" @click="JSONToCSVConvertor(filt_tickets, `ticket_status_report`)">Export data</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :items="filt_tickets"
                :search="search"
                item-key="time"
                >
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn small icon @click="openTicket(item)">
                            <v-icon class="green--text">mdi-open-in-new</v-icon>
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
    </div>
    </v-container>
</template>

<script>
export default {
    data: () => ({
        date: new Date().toISOString().substr(0, 7),
        menu: false,
        modal: false,
        duraList: ['Current month', 'Last 7 days', 'All', 'Select range'],
        status_list: ['All', 'Open', 'Followup', 'Closed'],
        duration: 'Current month',
        selected_status: 'All',
        search: null,
        fmenu: false,
        tmenu: false,
        fdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        tdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        frange: null,
        trange: null,
        dmenu: false,
        headers: [
            {text: 'Ticket ID', value: 'ticket_id'},
            {text: 'Site', value: 'site'},
            {text: 'Station', value: 'station'},
            {text: 'Date', value: 'date'},
            {text: 'Time', value: 'time'},
            {text: 'Attended by', value: 'attended_by'},
            {text: 'Current status', value: 'current_status'},
            {text: 'Activity', value: 'activity'},
        ],
        selected_user: null
    }),

    methods: {

        toLocalDate(date) {
            return new Date(+date).toLocaleDateString('en-IN')
        },

        toLocalTime(date) {
            return new Date(+date).toLocaleTimeString('en-IN')
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

        JSONToCSVConvertor(JSONData, ReportTitle) {
            var ShowLabel = Object.keys(this.filt_tickets[0])

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

        prepTickets(st) {
            let attended_by = null
            let ft = []
            let log = []
            for(let i in st) {
                log = st[i].log
                for(let j in log) {
                    attended_by = `${this.$store.getters.loadedUser(log[j].updatedBy).name} (${this.$store.getters.loadedUser(log[j].updatedBy).designation})`
                    ft.push({
                        ticket_id: st[i].ticket_id,
                        site: st[i].site,
                        station: st[i].station,
                        current_status: st[i].status,
                        attended_by: attended_by,
                        id: st[i].id,
                        batch: st[i].batch,
                        issue: st[i].issue,
                        solution: st[i].solution,
                        activity: log[j].action,
                        date: this.toLocalDate(log[j].timestamp),
                        time: this.toLocalTime(log[j].timestamp)
                    })
                }
            }
            if (this.selected_user == null) {
                return ft
            } else {
                return ft.filter((item) => {
                    return item.attended_by == this.selected_user
                })
            }
        }
    },

    computed: {
        tickets() {
            let all_tickets = this.$store.getters.loadedTickets
            if(this.duration == 'All') {
                return all_tickets
            } else {
                return all_tickets.filter((item) => {
                    return item.ticket_id >= this.frange  && item.ticket_id < this.trange
                })
            }
        },

        opentickets() {
            return this.filt_tickets.filter((item) => {
                return item.activity == 'open'
            })
        },

        followups() {
            return this.filt_tickets.filter((item) => {
                return item.activity == 'followup'
            })
        },

        closedtickets() {
            return this.filt_tickets.filter((item) => {
                return item.activity == 'closed'
            })
        },

        filt_tickets() {
            let st = this.tickets
            let attended_by = null
            let ft = []
            let log = []
            for(let i in st) {
                log = st[i].log
                for(let j in log) {
                    attended_by = `${this.$store.getters.loadedUser(log[j].updatedBy).name} (${this.$store.getters.loadedUser(log[j].updatedBy).designation})`
                    ft.push({
                        ticket_id: st[i].ticket_id,
                        site: st[i].site,
                        station: st[i].station,
                        current_status: st[i].status,
                        attended_by: attended_by,
                        user_id: log[j].updatedBy,
                        id: st[i].id,
                        batch: st[i].batch,
                        issue: st[i].issue,
                        solution: st[i].solution,
                        activity: log[j].action,
                        date: this.toLocalDate(log[j].timestamp),
                        time: this.toLocalTime(log[j].timestamp)
                    })
                }
            }
            if (this.selected_user == null) {
                return ft
            } else {
                return ft.filter((item) => {
                    return item.user_id == this.selected_user
                })
            }
        },

        users() {
            return this.$store.getters.loadedUsers
        },

        access() {
            return this.$store.getters.loadedPermissions
        }
    },

    mounted() {
        this.dateFilters()
    }
}
</script>