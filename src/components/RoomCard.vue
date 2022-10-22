<script setup>
import { LinkButton } from '.';
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
    <div class="bg-white rounded-lg shadow-xl p-2">
        <div class="font-bold text-xl my-4">{{title}}</div>
        <div class="flex mb-2">
            <div class="overflow-hidden relative w-8 h-8 bg-gray-100 rounded-full dark:bg-gray-600 mr-2">
                <svg class="absolute -left-1 w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
            </div>
            <span class="text-gray-700 text-sm my-2">
                <div>{{owner}}</div>
            </span>
        </div>
        <div class="p-2">
            <span v-for="(item, index) in tags" :key="index" class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{{item}}</span>
        </div>
        <span class="">
            <link-button :to="`/quiz/master/${roomId}`" v-if="isMaster" label="出題者画面"></link-button>
            <link-button :to="`/quiz/play/${roomId}`" v-else label="参加"></link-button>
        </span>
    </div>
</template>
