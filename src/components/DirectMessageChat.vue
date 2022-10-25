<script setup>
import { store } from '../store'
import { Bubble } from '.'
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
                <bubble :position="store.user?.id === item.to_id ? 'left' : 'right'" :sender="item.from_name.player_name" :content="item.content"></bubble>
            </div>
        </div>
    </div>
</template>
