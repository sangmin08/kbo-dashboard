<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const games = ref([])

const getTodayGames = async () => {
    try {
        const response = await axios.get('/api/games/live')

        games.value = response.data

        console.log('오늘 경기:', games.value)
    } catch (error) {
        console.error('오늘 경기 불러오기 실패:', error)
    }
}

onMounted(() => {
    getTodayGames()
})
</script>

<template>
    <section class="today-game">
        <h2>오늘의 경기</h2>

        <div
            v-for="game in games"
            :key="game.gameId"
            class="game-card"
        >
            <div>
                {{ game.time }} / {{ game.stadium }}
            </div>

            <div>
                {{ game.awayTeam }}
                {{ game.awayScore }}
                :
                {{ game.homeScore }}
                {{ game.homeTeam }}
            </div>

            <div>
                {{ game.inning }}회 {{ game.inningHalf }}
            </div>
        </div>
    </section>
</template>