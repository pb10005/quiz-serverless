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
        <div class="font-bold text-lg my-4">{{title}}</div>
        <div class="text-gray-700 mb-1">{{owner}}</div>
        <div class="p-2">
            <span v-for="(item, index) in tags" :key="index" class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{{item}}</span>
        </div>
        <span class="">
            <link-button :to="`/quiz/master/${roomId}`" v-if="isMaster" label="出題者画面"></link-button>
            <link-button :to="`/quiz/play/${roomId}`" v-else label="参加"></link-button>
        </span>
    </div>
</template>
