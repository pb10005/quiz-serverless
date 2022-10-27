<script setup>
import client from '../supabase-client'
import { ActionButton, LinkButton } from '.'

defineProps({
    notifications: {
        type: Array,
        default: []
    }
})

const transfer_notification = (n) => {
  if(n.notifications.type === '01') {
    return `あなたが出題した問題にプレイヤーが参加者しました。`
  } else {
    return null
  }
}

const markAsRead = async (id) => {
    await client.markNotificationAsRead(id)
}

</script>
<template>
    <div v-for="item in notifications" :key="item.id" class="bg-white shadow-xl rounded-lg p-2">
        <div class="text-sm text-gray-500">{{new Date(item.created_at).toLocaleString()}}</div>
        <div class="mb-2">{{ transfer_notification(item) }}</div>
        <link-button v-if="item.notifications.type === '01'" :to="`/quiz/master/${item.notifications.payload}`" label="出題者画面" class="mr-2"></link-button>
        <action-button v-if="!item.read" @click="markAsRead(item.notifications.id)" label="既読にする"></action-button>
    </div>
</template>
