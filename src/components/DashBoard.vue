<template>
    <v-container>
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
            <v-col cols="12">
                <LineChart />
            </v-col>
        </v-row>
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
        
    }),
    components: {
        DoughnutChart,
        LineChart
    },
    methods: {

        toLocalDate(date) {
            return new Date(+date).toLocaleDateString('en-IN')
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
    },

    mounted() {
        this.dateFilters()
    }
}
</script>