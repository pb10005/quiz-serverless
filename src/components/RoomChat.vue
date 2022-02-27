<script setup>
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
    <div class="py-2 space-y-1">
        <div v-for="item in roomChats" :key="item.id">
            <div
                v-if="masterId === item.sender_id"
                class="rounded space-x-1 p-1 bg-indigo-100 shadow mr-2">
                <span class="text-sm text-gray-500">{{item.players.player_name}}</span>
                <span>{{item.content}}</span>
            </div>
            <div
                v-else
                class="rounded space-x-1 p-1 bg-gray-100 shadow ml-2">
                <span class="text-sm text-gray-500">{{item.players.player_name}}</span>
                <span>{{item.content}}</span>
            </div>
        </div>
    </div>
</template>
