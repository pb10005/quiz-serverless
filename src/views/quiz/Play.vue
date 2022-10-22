<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../supabase'
import { store } from '../../store'
import client from '../../supabase-client'
import { ActionButton, QuizStatus, PlayerList, RoomChat, RoomInfo } from '../../components'

const state = reactive({
    selectedTab: 'chat',
    room: null,
    currentQuiz: null,
    subscriptions: [],
    players: [],
    roomChats: []
})

const route = useRoute()
const router = useRouter()

const joinRoom = async () => {
    if(!store.user) {
        alert("部屋に参加できません。ログインしてください。")
        return
    }
    if(!store.user.id) {
        alert("部屋に参加できません。ログインしてください。")
        return
    }

    const { number, error } = await client.getMaxPlayerNumber({
        room_id: route.params.id
    })
    if(error) {
        alert(error.message)
        return
    }
    const res = await client.joinRoom({
        room_id: route.params.id,
        player_id: store.user.id,
        player_number: number + 1
    })

    if(res.error) {
        alert("部屋に参加できません。参加締め切り済の部屋です。")
    }
}

const sendChat = async () => {
    await client.sendChat({
        room_id: route.params.id,
        sender_id: store.user.id,
        content: state.chat
    })
    state.chat = ""
}

const fetchData = async () => {
    const room = await client.getRoomById(route.params.id)
    state.room = room.data
    state.currentQuiz = await client.getCurrentQuiz({ room_id: route.params.id })
    state.roomChats = await client.selectRoomChats({ room_id: route.params.id })
    const players = await client.selectRoomPlayers({room_id: route.params.id})
    state.players = players.data
}

onMounted(async () => {
  await fetchData()
  if(!store.user) {
    return
  }
  if(!store.user.id) {
    return
  }
  if(store.user) {
    const username = await client.getUsername()
    if(!username) {
        router.push("/profile")
        return
    }
  }
  state.subscriptions = [
      await client.subscribeRooms(fetchData),
      await client.subscribeQuizzes({ room_id: route.params.id }, fetchData),
      await client.subscribeRoomChats({ room_id: route.params.id }, fetchData),
      await client.subscribeRoomPlayers({ room_id: route.params.id }, fetchData)
    ]
})

onUnmounted(() => {
  for(const s of supabase.getChannels()) {
    supabase.removeChannel(s)
  }
})
</script>
<template>
    <div v-if="state.room?.master_id !== store.user?.id && state.players?.filter(x => x.player_id === store.user?.id).length === 0" class="md:grid md:grid-cols-3 md:grid-rows-3 w-full min-h-screen">
        <div class="md:col-start-2 md:col-span-1 md:row-start-2 md:row-span-1">
            <p class="text-center font-bold text-xl my-4">{{ state.room?.title }}</p>
            <action-button @click="joinRoom"  class="w-full" label="この部屋に参加する"></action-button>
        </div>
    </div>
    <div v-if="state.room?.master_id === store.user?.id || state.players?.filter(x => x.player_id === store.user?.id).length > 0" class="md:grid md:grid-cols-12">
        <div class="md:col-start-1 md:col-span-3 p-2">
            <room-info :room="state.room"></room-info>
            <quiz-status :quiz="state.currentQuiz"></quiz-status>
            <div class="bg-white p-1 shadow rounded">
                <player-list :players="state.players"></player-list>
            </div>
        </div>
        <div class="md:col-start-4 md:col-span-9 p-2">
            <div v-if="state.currentQuiz" class="bg-white rounded-lg shadow-xl p-4 mb-2 space-y-1">
                <div class="border-0 w-full">
                    <div class="font-bold">第{{state.currentQuiz?.quiz_number}}問</div>
                    <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                        {{state.currentQuiz?.question}}
                    </div>
                </div>
                <div v-if="state.currentQuiz?.hint" class="border-0 w-full">
                    <div class="font-bold">ヒント</div>
                    <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                        {{state.currentQuiz?.hint}}
                    </div>
                </div>
                <div v-if="state.currentQuiz?.answer" class="border-0 w-full">
                    <div class="font-bold">答え</div>
                    <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                        {{state.currentQuiz?.answer}}
                    </div>
                </div>
            </div>
            <form @submit.prevent="sendChat" class="mb-2">
                <room-chat v-show="state.roomChats.length > 0" :masterId="state.room?.master_id" :roomChats="state.roomChats"></room-chat>
                <input v-model="state.chat" type="text" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="チャット(Enterで送信)" required/>
            </form>
        </div>
    </div>
</template>
