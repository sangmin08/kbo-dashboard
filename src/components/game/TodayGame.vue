<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const games = ref([])
let timer = null

const getTodayGames = async () => {
    try {
        const response = await axios.get('/api/games/live')
        games.value = response.data

        console.log('오늘 경기 갱신:', games.value)
    } catch (error) {
        console.error('오늘 경기 불러오기 실패:', error)
    }
}

onMounted(() => {
    // 페이지 들어오자마자 한 번 호출
    getTodayGames()

    // 이후 30초마다 자동 갱신
    timer = setInterval(() => {
        getTodayGames()
    }, 30000)
})

onUnmounted(() => {
    // 페이지를 벗어나면 요청 중지
    clearInterval(timer)
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
                <div class="team away-team">
                    <span class="team-name">
                        {{ game.awayTeam }}
                    </span>
                </div>

                <!-- 경기 시작 전 -->
                <div
                    v-if="game.gameState === '1'"
                    class="score"
                >
                    VS
                </div>

                <!-- 경기 시작 후 -->
                <div
                    v-else
                    class="score"
                >
                    {{ game.awayScore }} : {{ game.homeScore }}
                </div>

                <div class="team home-team">
                    <span class="team-name">
                        {{ game.homeTeam }}
                    </span>
                </div>
            </div>

            <!-- 경기 시작 전 선발투수 -->
            <div
                v-if="game.gameState === '1'"
                class="starting-pitchers"
            >
                <div class="pitcher">
                    <span class="pitcher-label">선발</span>
                    <strong>{{ game.awayPitcher || '미정' }}</strong>
                </div>

                <div class="pitcher-vs">
                    VS
                </div>

                <div class="pitcher">
                    <span class="pitcher-label">선발</span>
                    <strong>{{ game.homePitcher || '미정' }}</strong>
                </div>
            </div>

            <!-- 경기 시작 후 이닝 -->
            <div
                v-else
                class="inning"
            >
                {{ game.inning }}회 {{ game.inningHalf }}
            </div>
        </div>
    </section>
</template>

<style scoped>

</style>