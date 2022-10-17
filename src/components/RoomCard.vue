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
    tags: {
        type: Array,
        default: []
    }
})
</script>
<template>
    <div class="bg-white shadow p-2 md:col-span-4">
        <div class="font-bold text-lg mb-1">{{title}}</div>
        <div class="text-gray-700 mb-1">{{owner}}</div>
        <div class="p-2">
        <span v-for="item, index in tags" class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{{item}}</span>
        </div>
        <span class="">
        <router-link class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/play-with-ai/?id=1`">参加する</router-link>
        </span>
    </div>
</template>
