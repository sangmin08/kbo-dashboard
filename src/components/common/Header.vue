<template>
    <header class="header">
        <h1>KBO Dashboard</h1>

        <nav>
            <router-link to="/">홈</router-link>
            <router-link to="/schedule">경기 일정</router-link>
            <router-link to="/ranking">팀 순위</router-link>
            <router-link to="/players">선수 기록</router-link>
            <router-link to="/batting">타격 게임</router-link>
        </nav>
    </header>
</template>

<script>
export default {
    name: "Header"
}
</script>

<style scoped>

</style>