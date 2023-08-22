import Vue from 'vue'
import VueRouter from 'vue-router'
import DashBoard from '../components/DashBoard.vue'
import DesignationPage from '../components/user_management/DesignationPage.vue'
import UsersPage from '../components/user_management/UsersPage.vue'
import AccessControl from '../components/user_management/AccessControl.vue'
import IssuesPage from '../components/ticket_management/IssuesPage.vue'
import SolutionsPage from '../components/ticket_management/SolutionsPage.vue'
import SitesPage from '../components/site_management/SitesPage.vue'
import StationsPage from '../components/site_management/StationsPage.vue'
import TicketsPage from '../components/ticket_management/TicketsPage.vue'
import TicketStatus from '../components/reports/TicketStatus.vue'
import UserActivity from '../components/reports/UserActivity.vue'
import DurationTaken from '../components/reports/DurationTaken.vue'
import IssueWise from '../components/reports/IssueWise.vue'
import EmailSettings from '../components/settings/EmailSettings.vue'
import TelegramSettings from '../components/settings/TelegramSettings.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: DashBoard
  },
  {
    path: '/designations',
    component: DesignationPage
  },
  {
    path: '/users',
    component: UsersPage
  },
  {
    path: '/uac',
    component: AccessControl
  },
  {
    path: '/issues',
    component: IssuesPage
  },
  {
    path: '/solutions',
    component: SolutionsPage
  },
  {
    path: '/sites',
    component: SitesPage
  },
  {
    path: '/stations',
    component: StationsPage
  },
  {
    path: '/tickets',
    component: TicketsPage
  },
  {
    path: '/ticketstatus',
    component: TicketStatus
  },
  {
    path: '/useractivity',
    component: UserActivity
  },
  {
    path: '/durationtaken',
    component: DurationTaken
  },
  {
    path: '/issuewise',
    component: IssueWise
  },
  {
    path: '/emailsettings',
    component: EmailSettings
  },
  {
    path: '/telegramsettings',
    component: TelegramSettings
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
