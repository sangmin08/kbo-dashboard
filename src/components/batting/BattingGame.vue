<script setup>
import { ref, onUnmounted } from 'vue'

// ========================================
// 게임 상태
// ========================================
const ballPosition = ref(0)
const result = ref('')
const pitching = ref(false)

// 현재 테스트 구속
const pitchSpeed = ref(140)

// requestAnimationFrame ID
let animation = null


// ========================================
// 구속 → 홈플레이트 도달 시간 계산
//
// 마운드 ~ 홈플레이트 거리: 18.44m
//
// 130km/h ≈ 0.51초
// 140km/h ≈ 0.47초
// 150km/h ≈ 0.44초
// 160km/h ≈ 0.41초
// ========================================
const getFlightTime = (speed) => {

    const distance = 18.44

    // km/h → m/s
    const meterPerSecond = speed / 3.6

    // ms 단위로 반환
    return (
        distance / meterPerSecond
    ) * 1000
}


// ========================================
// 투구
// ========================================
const throwBall = () => {

    // 이미 공이 날아오고 있으면 중복 투구 방지
    if (pitching.value) {
        return
    }

    ballPosition.value = 0
    result.value = ''
    pitching.value = true

    // 현재 구속에 따른 비행시간
    const flightTime = getFlightTime(
        pitchSpeed.value
    )

    console.log(
        `${pitchSpeed.value}km/h`,
        `${(flightTime / 1000).toFixed(2)}초`
    )

    const startTime = performance.now()


    const animate = (currentTime) => {

        const elapsed =
            currentTime - startTime

        // 진행률
        // 0 → 투수
        // 1 → 홈플레이트
        const progress = Math.min(
            elapsed / flightTime,
            1
        )

        // 0 ~ 100
        ballPosition.value =
            progress * 100


        // 아직 공이 날아오는 중
        if (
            progress < 1 &&
            pitching.value
        ) {

            animation =
                requestAnimationFrame(
                    animate
                )

            return
        }


        // 타자가 치지 못하고
        // 홈플레이트까지 도착
        if (pitching.value) {

            pitching.value = false

            result.value = 'STRIKE!'
        }
    }


    animation =
        requestAnimationFrame(
            animate
        )
}


// ========================================
// 타격
// ========================================
const swing = () => {

    // 공이 날아오지 않을 때 클릭
    if (!pitching.value) {
        return
    }

    const position =
        ballPosition.value


    // 타격 타이밍 판정
    if (
        position >= 82 &&
        position <= 90
    ) {

        result.value =
            'PERFECT!'

    } else if (
        position >= 72 &&
        position <= 96
    ) {

        result.value =
            'HIT!'

    } else {

        result.value =
            'MISS!'
    }


    cancelAnimationFrame(
        animation
    )

    pitching.value = false
}


// ========================================
// 페이지 이동 시 애니메이션 제거
// ========================================
onUnmounted(() => {

    if (animation) {
        cancelAnimationFrame(
            animation
        )
    }
})
</script>


<template>

    <section class="batting-game">

        <!-- 제목 -->
        <div class="game-header">

            <h1>
                KBO 타격 게임
            </h1>

            <p>
                날아오는 공을 타이밍에 맞춰 쳐보세요.
            </p>

        </div>


        <!-- 투수 정보 -->
        <div class="pitcher">

            <strong>
                테스트 투수
            </strong>

            <span>
                직구 · {{ pitchSpeed }}km/h
            </span>

        </div>


        <!-- 경기 화면 -->
        <div class="ground">

            <div class="ball-path">

                <!-- 야구공 -->
                <div
                    v-if="pitching"
                    class="ball"
                    :style="{
                        top: `${ballPosition}%`,

                        transform: `
                            translate(-50%, -50%)
                            scale(${0.3 + ballPosition / 100})
                        `
                    }"
                >
                    ⚾
                </div>


                <!-- 스트라이크존 -->
                <div class="strike-zone">

                    <span>
                        STRIKE ZONE
                    </span>

                </div>

            </div>

        </div>


        <!-- 결과 -->
        <div class="result">

            {{ result }}

        </div>


        <!-- 버튼 -->
        <div class="buttons">

            <button
                class="pitch-button"
                :disabled="pitching"
                @click="throwBall"
            >
                투구
            </button>


            <button
                class="swing-button"
                @click="swing"
            >
                타격!
            </button>

        </div>

    </section>

</template>


<style scoped lang="scss">

.batting-game {

    max-width: 900px;

    margin: 0 auto;

    padding: 50px 20px;


    // ==========================
    // 제목
    // ==========================

    .game-header {

        text-align: center;


        h1 {

            margin: 0;

            font-size: 32px;

        }


        p {

            margin-top: 10px;

            color: #777;

        }

    }


    // ==========================
    // 투수 정보
    // ==========================

    .pitcher {

        display: flex;

        justify-content: center;

        gap: 15px;

        margin: 30px 0;


        span {

            color: #777;

        }

    }


    // ==========================
    // 경기장
    // ==========================

    .ground {

        display: flex;

        justify-content: center;

    }


    .ball-path {

        position: relative;

        width: 400px;

        height: 500px;

        overflow: hidden;

        border: 1px solid #ddd;

        border-radius: 20px;

        background:
            linear-gradient(
                    #dceeff,
                    #f5f5f5
            );

    }


    // ==========================
    // 야구공
    // ==========================

    .ball {

        position: absolute;

        left: 50%;

        font-size: 35px;

        z-index: 2;

        // 부드러운 크기 변화
        transform-origin: center;

    }


    // ==========================
    // 스트라이크존
    // ==========================

    .strike-zone {

        position: absolute;

        left: 50%;

        bottom: 20px;

        width: 150px;

        height: 120px;

        border: 3px solid #333;

        transform:
            translateX(-50%);

        display: flex;

        justify-content: center;

        align-items: center;


        span {

            font-size: 12px;

            color: #999;

        }

    }


    // ==========================
    // 타격 결과
    // ==========================

    .result {

        height: 50px;

        margin-top: 20px;

        text-align: center;

        font-size: 30px;

        font-weight: 800;

    }


    // ==========================
    // 버튼
    // ==========================

    .buttons {

        display: flex;

        justify-content: center;

        gap: 15px;

        margin-top: 20px;


        button {

            width: 140px;

            height: 50px;

            border: 0;

            border-radius: 8px;

            font-size: 16px;

            font-weight: 700;

            cursor: pointer;

        }


        .pitch-button {

            background: #222;

            color: white;

        }


        .swing-button {

            background: #e6002d;

            color: white;

        }


        button:disabled {

            opacity: 0.5;

            cursor: default;

        }

    }

}

</style>