<script setup>
import Header from './components/common/Header.vue'
</script>

<template>
    <Header />

    <main class="main">
        <router-view />
    </main>
</template>

<style scoped>
.main {
    width: 100%;
}
</style>