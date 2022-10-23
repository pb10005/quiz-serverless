<script setup>
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { DirectMessageChat } from '../components'
import { store } from '../store'
import client from '../supabase-client' 
import { supabase } from '../supabase'

const state = reactive({
    chat: '',
    currentChats: [],
    subscriptions: []
})

const route = useRoute()
const partnerName = ref('')

const sendChat = async () => {
    await client.sendDirectMessageChat({
        from_id: store.user.id,
        to_id: route.params.id,
        content: state.chat
    })
    state.chat = ''
}

const fetchData = async () => {
    const data = await client.selectDirectMessages(route.params.id)
    state.currentChats = data
}

onMounted(async () => {
    await fetchData()
    state.subscriptions = [
        await client.subscribeDirectMessages(fetchData)
    ]
    const pName = await client.getProfileById(route.params.id)
    partnerName.value = pName.playerName
})

onUnmounted(() => {
    for(const s of supabase.getChannels()) {
        supabase.removeChannel(s)
    }
})

</script>
<template>
    <div class="p-2">
        <div class="text-xl font-bold my-4">{{partnerName}}</div>
        <form @submit.prevent="sendChat">
            <direct-message-chat :chats="state.currentChats" />
            <input v-model="state.chat" type="text" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="チャット(Enterで送信)" required/>
        </form>
    </div>
</template>
