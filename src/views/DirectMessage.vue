<script setup>
import { onMounted, watch, onUnmounted, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DirectMessageChat } from '../components'
import { store } from '../store'
import client from '../supabase-client' 
import { supabase } from '../supabase'
import ActionButton from '@/components/ActionButton.vue'

const state = reactive({
    chat: '',
    summary: [],
    currentChats: [],
    subscriptions: []
})

const route = useRoute()
const router = useRouter()
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

    const summary = await client.selectAllDirectMessages()
    state.summary = summary
}

const init = async () => {
    await fetchData()
    state.subscriptions = [
        await client.subscribeDirectMessages(fetchData)
    ]
    const pName = await client.getProfileById(route.params.id)
    if(pName)
        partnerName.value = pName.playerName
}

const markAsRead = async () => {
    await client.markAsRead(route.params.id)
}

onMounted(init)

watch(() => route.params.id, init)

onUnmounted(() => {
    for(const s of supabase.getChannels()) {
        supabase.removeChannel(s)
    }
})

</script>
<template>
    <div class="grid md:grid-cols-12">
        <div class="md:col-start-1 md:col-span-3">
            <div v-for="item in state.summary" :key="item.id">
                <button
                    @click="router.push(`/direct-message/${item.id}`)"
                    class="md:py-2 hover:text-white hover:bg-gradient-to-bl hover:from-cyan-500 hover:to-blue-500 border-0 px-3 py-1 w-full tracking-widest">
                    {{item.player_name}}
                    {{item.all_read ? '':'(未読あり)'}}
                </button>
            </div>
        </div>
        <div class="md:col-start-4 md:col-span-9 px-2">
            <div class="p-2">
                <div v-show="partnerName" class="text-xl font-bold my-4">
                    <span class="mr-2">{{partnerName}}</span>
                    <action-button v-show="state.currentChats?.filter(c => !c.read && c.to_id === store.user?.id).length > 0" @click="markAsRead" label="既読にする"></action-button>
                </div>
                <form @submit.prevent="sendChat">
                    <direct-message-chat v-show="state.currentChats?.length > 0" :chats="state.currentChats" />
                    <input v-show="route.params.id" v-model="state.chat" type="text" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="チャット(Enterで送信)" required/>
                </form>
            </div>
        </div>
    </div>
</template>
