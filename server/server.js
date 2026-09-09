const express = require('express')
const axios = require('axios')

const app = express()
const PORT = 3000


// ========================================
// 한국 시간 기준 현재 날짜 구하기
// ========================================
const getKoreaDate = () => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })

    const parts = formatter.formatToParts(new Date())

    const year = parts.find(part => part.type === 'year').value
    const month = parts.find(part => part.type === 'month').value
    const day = parts.find(part => part.type === 'day').value

    return {
        year,
        month,
        day,

        // 20260909
        gameDate: `${year}${month}${day}`,

        // 09.09
        shortDate: `${month}.${day}`
    }
}


// ========================================
// 서버 확인
// ========================================
app.get('/', (req, res) => {
    res.send('KBO 서버 정상 작동')
})


// ========================================
// 오늘 경기 일정
// GetScheduleList
// ========================================
app.get('/api/games/today', async (req, res) => {
    try {
        const {
            year,
            month,
            day,
            gameDate,
            shortDate
        } = getKoreaDate()

        console.log('오늘 날짜:', gameDate)

        const response = await axios.post(
            'https://www.koreabaseball.com/ws/Schedule.asmx/GetScheduleList',

            new URLSearchParams({
                leId: '1',
                srIdList: '0,9,6',

                // 자동
                seasonId: year,

                // 자동
                gameMonth: month,

                teamId: ''
            }),

            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': 'https://www.koreabaseball.com/Schedule/Schedule.aspx'
                }
            }
        )

        const rows = response.data.rows || []

        const games = []

        let currentDate = ''

        rows.forEach((item) => {
            const cells = item.row

            if (!cells) {
                return
            }

            const dayCell = cells.find(
                cell => cell.Class === 'day'
            )

            if (dayCell) {
                currentDate = dayCell.Text
            }

            // 오늘 날짜가 아니면 제외
            if (!currentDate.startsWith(shortDate)) {
                return
            }

            const timeCell = cells.find(
                cell => cell.Class === 'time'
            )

            const playCell = cells.find(
                cell => cell.Class === 'play'
            )

            if (!timeCell || !playCell) {
                return
            }

            const time = timeCell.Text.replace(
                /<[^>]*>/g,
                ''
            )

            const matches = [
                ...playCell.Text.matchAll(
                    /<span(?: class="[^"]*")?>(.*?)<\/span>/g
                )
            ]

            const values = matches.map(
                match => match[1]
            )

            games.push({
                date: gameDate,
                time,
                awayTeam: values[0],
                awayScore: Number(values[1]),
                homeScore: Number(values[3]),
                homeTeam: values[4]
            })
        })

        res.json(games)

    } catch (error) {
        console.error(
            '일정 API 에러:',
            error.response?.data || error.message
        )

        res.status(500).json({
            message: 'KBO 경기 일정 요청 실패'
        })
    }
})


// ========================================
// 오늘 실시간 경기
// GetKboGameList
// ========================================
app.get('/api/games/live', async (req, res) => {
    try {
        const {
            gameDate
        } = getKoreaDate()

        console.log('실시간 경기 요청 날짜:', gameDate)

        const response = await axios.post(
            'https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList',

            {
                leId: '1',
                srId: '0',

                // 자동으로 오늘 날짜
                date: gameDate
            },

            {
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': 'https://www.koreabaseball.com/Schedule/GameCenter/Main.aspx',
                    'User-Agent': 'Mozilla/5.0'
                },

                responseType: 'text'
            }
        )

        const rawData = response.data

        // KBO 응답 뒤에 HTML 오류 페이지가 붙는 경우 제거
        const htmlIndex = rawData.indexOf('<!DOCTYPE html>')

        const jsonText =
            htmlIndex !== -1
                ? rawData.substring(0, htmlIndex)
                : rawData

        const data = JSON.parse(jsonText)

        const games = (data.game || []).map(game => ({
            gameId: game.G_ID,

            date: game.G_DT,

            time: game.G_TM,

            stadium: game.S_NM,

            awayTeam: game.AWAY_NM,
            homeTeam: game.HOME_NM,

            awayScore: Number(game.T_SCORE_CN),
            homeScore: Number(game.B_SCORE_CN),

            inning: game.GAME_INN_NO,
            inningHalf: game.GAME_TB_SC_NM,

            gameState: game.GAME_STATE_SC,

            awayPitcher: game.T_PIT_P_NM?.trim() || '',
            homePitcher: game.B_PIT_P_NM?.trim() || ''
        }))

        console.log('오늘 경기:', games)

        res.json(games)

    } catch (error) {
        console.error(
            'LIVE API 에러:',
            error.response?.data || error.message
        )

        res.status(500).json({
            message: '오늘 경기 데이터 요청 실패'
        })
    }
})


app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`)
})