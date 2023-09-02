<template>
    <v-container>
    <div v-if="access.includes(1)">
        <v-row>
            <v-col cols="12">
                <h2>Dashboard</h2>
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
            <v-col cols="6">
                <v-row>
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
                    <v-col cols="4">
                        <v-card elevation="5">
                            <v-card-text>
                                <v-row align-content="center" justify="center">
                                    <v-col cols="12">
                                        <h3>Total Tickets</h3>
                                    </v-col>
                                    <v-col cols="12">
                                        <h1 class="green--text">  {{ tickets.length }}  </h1>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="6">
                <DoughnutChart :chartData="chartData" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-card>
                    <v-card-title> Ticket activity </v-card-title>
                    <v-card-text>
                        <LineChart :chartData="LinechartData" />
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card>
                    <v-card-title> Ticket issues </v-card-title>
                    <v-card-text>
                        <LineChart :chartData="LinechartData2" />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            
        </v-row>
    </div> 
    </v-container>
</template>

<script>
import DoughnutChart from './Doughnut.vue'
import LineChart from './LineChart.vue'
export default {
    data: () => ({
        date: new Date().toISOString().substr(0, 7),
        menu: false,
        modal: false,
        duraList: ['Current month', 'Last 7 days', 'All', 'Select range'],
        duration: 'Current month',
        fmenu: false,
        tmenu: false,
        fdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        tdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        frange: null,
        trange: null,
        dmenu: false,
        idate: null,
        selectedInv: null,
        paymentmodes: ['Bank Transfer', 'Cash', 'Cheque', 'Credit Card', 'Debit Card', 'G-Pay', 'Paytm', 'PhonePe'],
        mop: null,
        labels: [],
        data1: [],
        data2: [],     
    }),
    components: {
        DoughnutChart,
        LineChart
    },
    methods: {

        toLocalDate(date) {
            return new Date(+date).toLocaleDateString('en-IN')
        },

        dayDataPrep(f) {
            this.labels = []
            this.data1 = []
            this.data2 = []
            let temp = null
            let fdate = f
            let today = new Date().getTime()
            while( fdate <= today ) {
                temp = new Date(fdate)
                this.labels.push(this.toLocalDate(temp))
                let open_tcount = this.tickets.filter((item) => {
                    return this.toLocalDate(item.ticket_id) == this.toLocalDate(temp)
                })
                let closed_tcount = this.closedtickets.filter((item) => {
                    return this.toLocalDate(item.closedOn) == this.toLocalDate(temp)
                })
                this.data1.push(open_tcount.length)
                this.data2.push(closed_tcount.length)
                temp.setDate(temp.getDate() + 1)
                fdate = temp.getTime()
            }
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
                this.dayDataPrep(this.frange)
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
                this.dayDataPrep(this.frange)
            }
            if(this.duration == 'Select range') {
                this.frange = new Date(this.fdate).getTime()
                let tdate = new Date(this.tdate)
                let day = new Date(this.tdate).getDate()
                tdate.setDate(day + 1)
                tdate.setHours(0,0,0,0)
                this.trange = tdate.getTime()
                this.dayDataPrep(this.frange)
            }
            if(this.duration == 'All') {
                let first = this.tickets.sort((a,b) => +b.ticket_id - +a.ticket_id)[this.tickets.length - 1]
                this.frange = first.ticket_id
                this.dayDataPrep(first.ticket_id)
            }
        },

        issueFilter(issue) {
            return this.tickets.filter((item) => {
                return item.issue == issue
            })
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
            return this.tickets.filter((item) => {
                return item.status == 'open'
            })
        },

        followups() {
            return this.tickets.filter((item) => {
                return item.status == 'followup'
            })
        },

        closedtickets() {
            return this.tickets.filter((item) => {
                return item.status == 'closed'
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
                        current_status: st[i].status,
                        attended_by: attended_by,
                        user_id: log[j].updatedBy,
                        id: st[i].id,
                        activity: log[j].action,
                        timestamp: log[j].timestamp
                    })
                }
            }
            return ft
        },

        processedData() {
            let f = this.frange
            let temp = null
            let fdate = f
            let today = new Date().getTime()
            let labels = []
            let data1 = []
            let data2 = []
            let data3 = []
            while( fdate <= today ) {
                temp = new Date(fdate)
                labels.push(this.toLocalDate(temp))
                let open_tcount = this.tickets.filter((item) => {
                    return this.toLocalDate(item.ticket_id) == this.toLocalDate(temp)
                })
                let closed_tcount = this.closedtickets.filter((item) => {
                    return this.toLocalDate(item.closedOn) == this.toLocalDate(temp)
                })
                let followup_tcount = this.filt_tickets.filter((item) => {
                    return item.activity == 'followup' && this.toLocalDate(item.timestamp) == this.toLocalDate(temp)
                })
                data1.push(closed_tcount.length)
                data2.push(followup_tcount.length)
                data3.push(open_tcount.length)
                temp.setDate(temp.getDate() + 1)
                fdate = temp.getTime()
            }
            return {
                labels,data1,data2,data3
            }
        },

        processedData2() {
            let f = this.frange
            let temp = null
            let fdate = f
            let today = new Date().getTime()
            let labels = []
            let data1 = []
            let data2 = []
            let data3 = []
            let data4 = []
            let data5 = []
            let issue1 = this.issueFilter('Station Offline')
            let issue2 = this.issueFilter('PMS Offline/ Cannot remote in/ Error connection')
            let issue3 = this.issueFilter('No IU Detected / Chu hang')
            let issue4 = this.issueFilter('Antenna Issue')
            let issue5 = this.issueFilter('Barrier arm drop /Barrier arm loose')
            while( fdate <= today ) {
                temp = new Date(fdate)
                labels.push(this.toLocalDate(temp))
                let issue1_count = issue1.filter((item) => {
                    return this.toLocalDate(item.ticket_id) == this.toLocalDate(temp)
                })
                let issue2_count = issue2.filter((item) => {
                    return this.toLocalDate(item.closedOn) == this.toLocalDate(temp)
                })
                let issue3_count = issue3.filter((item) => {
                    return this.toLocalDate(item.ticket_id) == this.toLocalDate(temp)
                })
                let issue4_count = issue4.filter((item) => {
                    return this.toLocalDate(item.closedOn) == this.toLocalDate(temp)
                })
                let issue5_count = issue5.filter((item) => {
                    return this.toLocalDate(item.closedOn) == this.toLocalDate(temp)
                })

                data1.push(issue1_count.length)
                data2.push(issue2_count.length)
                data3.push(issue3_count.length)
                data4.push(issue4_count.length)
                data5.push(issue5_count.length)
                temp.setDate(temp.getDate() + 1)
                fdate = temp.getTime()
            }
            return {
                labels,data1,data2,data3, data4, data5
            }
        },

        chartData() { 
            return {
                labels: ['Closed', 'Followup', 'Open'],
                datasets: [
                    {
                    backgroundColor: ['#66BB6A', '#FFA726', '#EF5350'],
                    data: [this.closedtickets.length, this.followups.length, this.opentickets.length]
                    }
                ]
            }
        },

        LinechartData() {
            return {
                labels: this.processedData.labels,
                datasets: [
                    {
                        label: 'Tickets closed',
                        backgroundColor: 'green',
                        borderColor: '#66BB6A',
                        data: this.processedData.data1,
                        tension: 0.1
                    },
                    {
                        label: 'Tickets followup',
                        backgroundColor: '#E65100',
                        borderColor: '#FFA726',
                        data: this.processedData.data2,
                        tension: 0.1
                    },
                    {
                        label: 'Tickets opened',
                        backgroundColor: '#B71C1C',
                        borderColor: '#EF5350',
                        data: this.processedData.data3,
                        tension: 0.1
                    },
                ]
            }
        },

        LinechartData2() {
            return {
                labels: this.processedData2.labels,
                datasets: [
                    {
                        label: 'Station Offline',
                        backgroundColor: 'purple',
                        borderColor: '#AB47BC',
                        data: this.processedData2.data1,
                        tension: 0.1
                    },
                    {
                        label: 'PMS Offline/ Cannot remote in/ Error connection',
                        backgroundColor: 'indigo',
                        borderColor: '#5C6BC0',
                        data: this.processedData2.data2,
                        tension: 0.1
                    },
                    {
                        label: 'No IU Detected / Chu hang',
                        backgroundColor: 'orange',
                        borderColor: '#FFA726',
                        data: this.processedData2.data3,
                        tension: 0.1
                    },
                    {
                        label: 'Antenna Issue',
                        backgroundColor: 'teal',
                        borderColor: '#26A69A',
                        data: this.processedData2.data4,
                        tension: 0.1
                    },
                    {
                        label: 'Barrier arm drop /Barrier arm loose',
                        backgroundColor: 'pink',
                        borderColor: '#EC407A',
                        data: this.processedData2.data5,
                        tension: 0.1
                    },
                ]
            }
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