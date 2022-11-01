<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../supabase'
import { store } from '../../store'
import client from '../../supabase-client'
import { ActionButton, QuizStatus, PlayerList, RoomInfo, RoomChat } from '../../components'
import { UserIcon } from '@heroicons/vue/24/solid'

const state = reactive({
    selectedTab: 'overview',
    newQuiz: {
        question: "",
        answer: ""
    },
    chat: "",
    hint: "",
    room: null,
    currentQuiz: null,
    currentQuizHidden: null,
    roomChats: [],
    subscriptions: [],
    players: [],
    quizHistories: []
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

const addHint = async () => {
    await client.addHint({ quiz_id: state.currentQuiz.id, hint: state.hint })
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

const changeVisibility = async (visibility) => {
    await client.changeRoomVisibility({ room_id: route.params.id, visibility: visibility})
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

  const history = await client.getQuizHistories({room_id: route.params.id})
  state.quizHistories = history
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
  for(const s of supabase.getChannels()) {
    supabase.removeChannel(s)
  }
})
</script>
<template>
    <div class="grid md:grid-cols-12">
        <div class="md:col-start-1 md:col-span-3">
            <div class="p-2 mb-2">
                <room-info :room="state.room"></room-info>
                <quiz-status :quiz="state.currentQuiz"></quiz-status>
            </div>
            <button
                :class="{ 'text-white bg-gradient-to-r from-cyan-500 to-blue-500': state.selectedTab === 'overview'}"
                @click="state.selectedTab = 'overview'"
                class="md:py-2 hover:text-white hover:bg-gradient-to-bl hover:from-cyan-500 hover:to-blue-500 border-0 px-3 py-1 w-full tracking-widest">
                概要
            </button>
            <button
                :class="{ 'text-white bg-gradient-to-r from-cyan-500 to-blue-500': state.selectedTab === 'chat'}"
                @click="state.selectedTab = 'chat'"
                class="md:py-2 hover:text-white hover:bg-gradient-to-bl hover:from-cyan-500 hover:to-blue-500 border-0 px-3 py-1 w-full tracking-widest">
                チャット
            </button>
            <button
                :class="{ 'text-white bg-gradient-to-r from-cyan-500 to-blue-500': state.selectedTab === 'quiz'}"
                @click="state.selectedTab = 'quiz'"
                class="md:py-2 hover:text-white hover:bg-gradient-to-bl hover:from-cyan-500 hover:to-blue-500 border-0 px-3 py-1 w-full tracking-widest">
                出題
            </button>
            <button
                :class="{ 'text-white bg-gradient-to-r from-cyan-500 to-blue-500': state.selectedTab === 'history'}"
                @click="state.selectedTab = 'history'"
                class="md:py-2 hover:text-white hover:bg-gradient-to-bl hover:from-cyan-500 hover:to-blue-500 border-0 px-3 py-1 w-full tracking-widest">
                出題履歴
            </button>
        </div>
        <div class="md:col-start-4 md:col-span-9 p-2">
            <form @submit.prevent="sendChat" class="mb-2" v-show="state.selectedTab === 'chat'">
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
                            {{state.currentQuiz.hint}}
                        </div>
                    </div>
                    <div v-if="state.currentQuiz?.answer" class="border-0 w-full">
                        <div class="font-bold">答え</div>
                        <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                            {{state.currentQuiz?.answer}}
                        </div>
                    </div>
                </div>
                <room-chat v-show="state.roomChats.length > 0" :masterId="state.room?.master_id" :roomChats="state.roomChats"></room-chat>
                <input v-model="state.chat" type="text" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="チャット(Enterで送信)" required/>
            </form>
            <div v-show="state.selectedTab === 'overview'">
                <div class="shadow-xl rounded-lg bg-white p-4 mb-2">
                    <player-list :players="state.players"></player-list>
                </div>
                <div v-if="state.room?.status === '0'">
                    <action-button @click="closeParticipation" label="参加締め切り"></action-button>
                    <action-button v-if="state.room?.is_public" @click="changeVisibility(false)" label="ホーム画面で非表示にする"></action-button>
                    <action-button v-else @click="changeVisibility(true)" label="ホーム画面に表示する"></action-button>
                    <div class="font-bold my-2">参加用URL</div>
                    <input class="px-2 py-1 border-0 w-full" :value="`${host}/quiz/play/${route.params.id}`" /><br>
                    <action-button class="mt-1" @click="copyUrl" label="コピー"></action-button>
                </div>
                <action-button v-else @click="reopenParticipation" label="参加締め切りを解除"></action-button>
            </div>
            <div v-show="state.selectedTab === 'quiz'">
                <form v-if="!state.currentQuiz || state.currentQuiz.status === '2'" @submit.prevent="submitQuiz" class="bg-white rounded-lg shadow-xl p-4 mb-2 space-y-1">
                    <!-- 出題待ちまたはクイズ終了後 -->
                    <p class="font-bold">問題</p>
                    <textarea v-model="state.newQuiz.question" class="px-4 py-2 h-40 border-0 border-b-2 border-indigo-700 w-full" placeholder="問題" required></textarea>
                    <p class="font-bold">答え</p>
                    <textarea v-model="state.newQuiz.answer" class="px-4 py-2 h-40 border-0 border-b-2 border-indigo-700 w-full" placeholder="答え" required></textarea>
                    <action-button label="出題する"></action-button>
                </form>
                <form v-if="state.currentQuiz?.status === '0'" class="bg-white rounded-lg shadow-xl mb-2 p-4 space-y-1">
                    <!-- 出題中 -->
                    <div class="border-0 w-full">
                        <div class="font-bold">第{{state.currentQuiz?.quiz_number}}問</div>
                        <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                            {{state.currentQuiz.question}}
                        </div>
                    </div>
                    <div v-if="state.currentQuiz?.hint" class="border-0 w-full">
                        <div class="font-bold">ヒント</div>
                        <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                            {{state.currentQuiz.hint}}
                        </div>
                    </div>
                    <div class="border-0 w-full">
                        <div class="font-bold">答え(参加者には非表示)</div>
                        <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                            {{state.currentQuizHidden?.answer}}
                        </div>
                    </div>
                    <p class="font-bold">ヒント</p>
                    <textarea v-model="state.hint" class="px-4 py-2 h-30 border-0 border-b-2 border-indigo-700 w-full" placeholder="ヒント"></textarea>
                    <action-button @click.prevent="addHint" label="ヒントを出す"></action-button>
                    <action-button @click.prevent="showAnswer" label="答えを出す"></action-button>
                </form>
                <form v-if="state.currentQuiz?.status === '1'" class="bg-white rounded-lg shadow-xl mb-2 p-4 space-y-1">
                    <!-- 答えを出した後 -->
                    <div class="border-0 w-full">
                        <div class="font-bold">第{{state.currentQuiz?.quiz_number}}問</div>
                        <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                            {{state.currentQuiz.question}}
                        </div>
                    </div>
                    <div v-if="state.currentQuiz?.hint" class="border-0 w-full">
                        <div class="font-bold">ヒント</div>
                        <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                            {{state.currentQuiz.hint}}
                        </div>
                    </div>
                    <div class="border-0 w-full">
                        <div class="font-bold">答え</div>
                        <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                            {{state.currentQuiz.answer}}
                        </div>
                    </div>
                    <action-button @click.prevent="closeQuiz" label="クイズを終了する"></action-button>
                </form>
            </div>
            <div v-show="state.selectedTab === 'history'" class="divide-y-4">
                <div v-for="item in state.quizHistories" :key="item.quizNumber">
                    <div class="bg-white rounded-lg shadow-xl p-4">
                        <div>第{{item.quizNumber}}問</div>
                        <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded mb-2">
                            {{item.question}}
                        </div>
                        <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                            {{item.answer}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
