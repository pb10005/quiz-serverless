<script setup>
import { Bubble } from '.'


const LOG_TYPE_QUIZ_BEGIN = '01'
const LOG_TYPE_QUIZ_END = '02'
const LOG_TYPE_ROOM_CLOSED = '03'
const LOG_TYPE_ROOM_REOPENED = '04'

const convertRoomLog = (item) => {
    if(item.type === LOG_TYPE_QUIZ_BEGIN) {
        return `第${item.payload}問を出題開始しました`
    } else if(item.type === LOG_TYPE_QUIZ_END) {
        return `第${item.payload}問を出題終了しました`
    } else if(item.type === LOG_TYPE_ROOM_CLOSED) {
        return '参加を締め切りました'
    } else if(item.type === LOG_TYPE_ROOM_REOPENED) {
        return '参加締め切りを解除しました'
    }
}

defineProps({
    masterId: {
        type: String,
        default: ""
    },
    roomChats: {
        type: Array,
        default: []
    }
})
</script>
<template>
    <div class="relative">
        <div class="py-2 space-y-1 bg-white px-4 rounded mb-2 shadow-inner max-h-screen overflow-y-scroll sticky bottom-2 left-0 right-0">
            <div v-for="item in roomChats" :key="item.id">
                <bubble v-if="item.content" :position="masterId === item.sender_id ? 'left' : 'right'" :sender="item.players.player_name" :content="item.content"></bubble>
                <div v-else>
                    <div class="inline-flex justify-center items-center w-full">
                        <hr class="my-8 w-full h-px bg-gray-200 border-0 dark:bg-gray-700">
                        <span class="absolute left-1/2 px-3 font-medium text-gray-900 bg-white -translate-x-1/2 dark:text-white dark:bg-gray-900">{{convertRoomLog(item)}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
