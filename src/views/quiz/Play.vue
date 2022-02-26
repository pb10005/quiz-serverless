<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../supabase'
import { store } from '../../store'
import client from '../../supabase-client'
import QuizStatus from '../../components/QuizStatus.vue'
import PlayerList from '../../components/PlayerList.vue'
import RoomInfo from '../../components/RoomInfo.vue'

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
  if(store.user) {
    const username = await client.getUsername()
    if(!username) {
        router.push("/profile")
        return
    }
  }
  await fetchData()
  state.subscriptions = [
      await client.subscribeRooms(fetchData),
      await client.subscribeQuizzes({ room_id: route.params.id }, fetchData),
      await client.subscribeRoomChats({ room_id: route.params.id }, fetchData),
      await client.subscribeRoomPlayers({ room_id: route.params.id }, fetchData)
    ]
})

onUnmounted(() => {
  for(const s of state.subscriptions) {
    supabase.removeSubscription(s)
  }
})
</script>
<template>
    <div v-if="state.room?.master_id !== store.user?.id && state.players?.filter(x => x.player_id === store.user?.id).length === 0" class="md:grid md:grid-cols-3 md:grid-rows-3 w-full min-h-screen">
        <div class="md:col-start-2 md:col-span-1 md:row-start-2 md:row-span-1">
            <p class="text-center font-bold text-xl">{{ state.room?.title }}</p>
            <button @click="joinRoom" class="rounded border-solid border-2 px-3 py-2 w-full">この部屋に参加する</button>
        </div>
    </div>
    <div v-if="state.room?.master_id === store.user?.id || state.players?.filter(x => x.player_id === store.user?.id).length > 0" class="md:grid md:grid-cols-12">
        <div class="md:col-start-1 md:col-span-3 p-2">
            <room-info :room="state.room"></room-info>
            <quiz-status :quiz="state.currentQuiz"></quiz-status>
            <player-list :players="state.players"></player-list>
        </div>
        <div class="md:col-start-4 md:col-span-9 p-2">
            <div class="text-lg font-bold">参加者用画面</div>
            <div v-if="state.currentQuiz">
                <div class="px-4 py-2 border-0 w-full">
                    <div class="font-bold">第{{state.currentQuiz?.quiz_number}}問</div>
                    {{state.currentQuiz?.question}}
                </div>
                <div v-if="state.currentQuiz?.answer" class="px-4 py-2 border-0 w-full">
                    <div class="font-bold">答え</div>
                    {{state.currentQuiz?.answer}}
                </div>
            </div>
            <form @submit.prevent="sendChat" class="mb-2">
                <input v-model="state.chat" type="text" class="px-4 py-2 h-10 border-0 w-full" placeholder="チャット(Enterで送信)" required/>
                <div v-for="item in state.roomChats">
                    {{item.players.player_name}}> {{item.content}}
                </div>
            </form>
        </div>
    </div>
</template>
