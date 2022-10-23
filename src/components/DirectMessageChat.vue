<script setup>
import { store } from '../store'
defineProps({
    chats: {
        type: Array,
        default: []
    }
})
</script>
<template>
    <div class="relative">
        <div class="py-2 space-y-1 bg-white px-4 rounded mb-2 shadow-inner max-h-screen overflow-y-scroll sticky bottom-2 left-0 right-0">
            <div v-for="item in chats" :key="item.id">
                <div class="flex item-end" v-if="store.user?.id === item.to_id">
                    <div
                        class="rounded-full rounded-bl-none space-x-1 bg-blue-100 shadow px-2 py-2">
                        <span class="text-sm text-gray-500">{{item.from_name.player_name}}</span>
                        <span>{{item.content}}</span>
                    </div>
                </div>
                <div v-else class="flex item-end justify-end">
                    <div
                        class="rounded-full rounded-br-none space-x-1 bg-teal-50 shadow px-2 py-2">
                        <span class="text-sm text-gray-500">{{item.from_name.player_name}}</span>
                        <span>{{item.content}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
