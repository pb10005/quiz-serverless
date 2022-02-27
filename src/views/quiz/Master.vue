<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../supabase'
import { store } from '../../store'
import client from '../../supabase-client'
import { QuizStatus, PlayerList, RoomInfo, RoomChat } from '../../components'

const state = reactive({
    selectedTab: 'chat',
    newQuiz: {
        question: "",
        answer: ""
    },
    chat: "",
    room: null,
    currentQuiz: null,
    currentQuizHidden: null,
    roomChats: [],
    subscriptions: [],
    players: [],
})

const host = window.location.protocol + "//" + window.location.host
const route = useRoute()
const router = useRouter()

const sendChat = async () => {
    await client.sendChat({
        room_id: route.params.id,
        sender_id: store.user.id,
        content: state.chat
    })
    state.chat = ""
}

const submitQuiz = async () => {
    const { number, error } = await client.getMaxQuizNumber({
        room_id: route.params.id
    })
    if(error) {
        alert(error.message)
        return
    }
    await client.createQuiz({
        room_id: route.params.id,
        question: state.newQuiz.question,
        answer: state.newQuiz.answer,
        quiz_number: number + 1
    })
}

const showAnswer = async () => {
    await client.showAnswer({ quiz_id: state.currentQuiz.id })
}

const closeQuiz = async () => {
    await client.closeQuiz({ quiz_id: state.currentQuiz.id })
}

const closeParticipation = async () => {
    await client.closeParticipation({ room_id: route.params.id })
}

const reopenParticipation = async () => {
    await client.reopenParticipation({ room_id: route.params.id })
}

const copyUrl = () => {
    navigator.clipboard.writeText(`${host}/quiz/play/${route.params.id}`)
}

const fetchData = async () => {
  const room = await client.getRoomById(route.params.id)
  state.room = room.data
  if(state.room.master_id !== store.user?.id) {
      router.push("/")
      return
  }
  state.currentQuiz = await client.getCurrentQuiz({ room_id: route.params.id })
  if(state.currentQuiz)
    state.currentQuizHidden = await client.getCurrentQuizHidden({ id: state.currentQuiz?.id })
  state.roomChats = await client.selectRoomChats({ room_id: route.params.id })
  const players = await client.selectRoomPlayers({room_id: route.params.id})
  state.players = players.data
}    

onMounted(async () => {
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
    <div class="grid md:grid-cols-12">
        <div class="md:col-start-1 md:col-span-3">
            <button
                :class="{ 'bg-gray-300': state.selectedTab === 'chat'}"
                @click="state.selectedTab = 'chat'"
                class="border-0 px-3 py-1 w-full">
                チャット
            </button>
            <button
                :class="{ 'bg-gray-300': state.selectedTab === 'quiz'}"
                @click="state.selectedTab = 'quiz'"
                class="border-0 px-3 py-1 w-full">
                出題
            </button>
            <div class="mx-1 shadow rounded bg-white p-1">
                <room-info :room="state.room"></room-info>
                <quiz-status :quiz="state.currentQuiz"></quiz-status>
                <player-list :players="state.players"></player-list>
                <div v-if="state.room?.status === '0'">
                    <button @click="closeParticipation" class="rounded border-0 bg-indigo-300 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1 w-full">参加締め切り</button>
                    <div class="text-sm font-bold">参加用URL</div>
                    <input class="text-xs px-2 py-1 border-0 w-full" :value="`${host}/quiz/play/${route.params.id}`" /><br>
                    <button class="text-xs rounded border-0 bg-indigo-300 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" @click="copyUrl">コピー</button>
                </div>
                <button v-else @click="reopenParticipation" class="rounded border-0 bg-indigo-300 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1 w-full">参加締め切りを解除</button>
            </div>
        </div>
        <div class="md:col-start-4 md:col-span-9 p-2">
            <div class="text-lg font-bold">出題者専用画面</div>
            <form @submit.prevent="sendChat" class="mb-2" v-show="state.selectedTab === 'chat'">
                <div v-if="state.currentQuiz" class="bg-white rounded shadow p-2 mb-2">
                    <div class="p-2 border-0 w-full">
                        <div class="font-bold">第{{state.currentQuiz?.quiz_number}}問</div>
                        <div>
                            {{state.currentQuiz.question}}
                        </div>
                    </div>
                    <div class="px-4 py-2 border-0 w-full">
                        <div class="font-bold">答え(参加者には非表示)</div>
                        <div>
                            {{state.currentQuizHidden?.answer}}
                        </div>
                    </div>
                </div>
                <input v-model="state.chat" type="text" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="チャット(Enterで送信)" required/>
                <room-chat :masterId="state.room?.master_id" :roomChats="state.roomChats"></room-chat>
            </form>
            <div v-show="state.selectedTab === 'quiz'">
                <form v-if="!state.currentQuiz || state.currentQuiz.status === '2'" @submit.prevent="submitQuiz" class="bg-white rounded shadow p-2 mb-2">
                    <!-- 出題待ちまたはクイズ終了後 -->
                    <textarea v-model="state.newQuiz.question" class="px-4 py-2 h-40 border-0 border-b-2 border-indigo-700 w-full" placeholder="問題"></textarea>
                    <textarea v-model="state.newQuiz.answer" class="px-4 py-2 h-40 border-0 border-b-2 border-indigo-700 w-full" placeholder="答え"></textarea>
                    <button class="rounded border-0 border-b-2 bg-indigo-300 hover:bg-indigo-700 hover:text-white px-3 py-1">出題する</button>
                </form>
                <form v-if="state.currentQuiz?.status === '0'" class="bg-white rounded shadow mb-2 p-2">
                    <!-- 出題中 -->
                    <div class="px-4 py-2 border-0 w-full">
                        <div class="font-bold">第{{state.currentQuiz?.quiz_number}}問</div>
                        <div>
                            {{state.currentQuiz.question}}
                        </div>
                    </div>
                    <div class="px-4 py-2 border-0 w-full">
                        <div class="font-bold">答え(参加者には非表示)</div>
                        <div>
                            {{state.currentQuizHidden?.answer}}
                        </div>
                    </div>
                    <button @click.prevent="showAnswer" class="rounded border-0 border-b-2 bg-indigo-300 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1">答えを出す</button>
                </form>
                <form v-if="state.currentQuiz?.status === '1'" class="bg-white rounded shadow mb-2 p-2">
                    <!-- 答えを出した後 -->
                    <div class="px-4 py-2 border-0 w-full">
                        <div class="font-bold">第{{state.currentQuiz?.quiz_number}}問</div>
                        <div>
                            {{state.currentQuiz.question}}
                        </div>
                    </div>
                    <div class="px-4 py-2 border-0 w-full">
                        <div class="font-bold">答え</div>
                        <div>
                            {{state.currentQuiz.answer}}
                        </div>
                    </div>
                    <button @click.prevent="closeQuiz" class="rounded border-0 border-b-2 bg-indigo-300 hover:bg-indigo-700 hover:text-white px-3 py-1">クイズを終了する</button>
                </form>
            </div>
        </div>
    </div>
</template>
