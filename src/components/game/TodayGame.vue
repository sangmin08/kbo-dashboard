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
            <!-- 경기 시간 / 구장 -->
            <div class="game-info">
                {{ game.time }} · {{ game.stadium }}
            </div>

            <!-- 팀 -->
            <div class="teams">
                <span>{{ game.awayTeam }}</span>

                <!-- 경기 전 -->
                <span v-if="game.gameState === '1'">
                    VS
                </span>

                <!-- 경기 시작 후 -->
                <span v-else>
                    {{ game.awayScore }} : {{ game.homeScore }}
                </span>

                <span>{{ game.homeTeam }}</span>
            </div>

            <!-- 경기 전 -->
            <div
                v-if="game.gameState === '1'"
                class="game-before"
            >
                경기 시작 전입니다
            </div>

            <!-- 경기 시작 후 -->
            <div
                v-else
                class="inning"
            >
                {{ game.inning }}회 {{ game.inningHalf }}
            </div>
        </div>
    </section>
</template>