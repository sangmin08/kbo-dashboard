import { createRouter, createWebHistory } from 'vue-router'

import BattingView from '@/views/BattingView.vue'
import HomeView from '@/views/HomeView.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import RankingView from '@/views/RankingView.vue'
import PlayerView from '@/views/PlayerView.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/schedule',
        name: 'schedule',
        component: ScheduleView
    },
    {
        path: '/ranking',
        name: 'ranking',
        component: RankingView
    },
    {
        path: '/players',
        name: 'players',
        component: PlayerView
    },
    {
        path: '/batting',
        name: 'batting',
        component: BattingView
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router