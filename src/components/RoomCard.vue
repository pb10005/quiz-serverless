<script setup>
defineProps({
    title: {
        type: String,
        default: ""
    },
    owner: {
        type: String,
        default: ""
    },
    roomId: {
        type: String,
        default: ""
    },
    tags: {
        type: Array,
        default: []
    },
    isMaster: {
        type: Boolean,
        default: false
    }
})
</script>
<template>
    <div class="bg-white shadow p-2">
        <div class="font-bold text-lg mb-1">{{title}}</div>
        <div class="text-gray-700 mb-1">{{owner}}</div>
        <div class="p-2">
            <span v-for="(item, index) in tags" :key="index" class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{{item}}</span>
        </div>
        <span class="">
            <router-link class="order-last rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/master/${roomId}`" v-if="isMaster">出題者画面</router-link>
            <router-link class="order-last rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/play/${roomId}`" v-else>参加</router-link>
        </span>
    </div>
</template>
