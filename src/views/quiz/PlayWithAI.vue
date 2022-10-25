<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../../store'
import client from '../../supabase-client'
import { Bubble } from '../../components'

const state = reactive({
    selectedTab: 'chat',
    room: null,
    currentQuiz: null,
    subscriptions: [],
    players: [],
    roomChats: []
})

const isLoading = ref(false)

const int2label = {
  0: 'いいえ',
  1: 'はい',
  2: 'どちらともいえません',
}

const route = useRoute()
const router = useRouter()
const endPoint = "https://quiz-1-y6y6z7lz4a-uc.a.run.app"

const quizzes = {
  1: 'ほんの僅かな額のお金を手に入れたはずの男が、その101倍のお金を受け取ったのは何故だろう？',
  2: 'とある老舗和菓子店に定期的に来店する望月氏という男がいる。望月氏は決まって「安倍川餅」と「わらび餅」を指差して注文するのだが、それは何故だろう？'
}

const sendChat = async () => {
    isLoading.value = true
    state.roomChats.push({ sender: 'you', content: state.chat})
    const obj = {
      id: parseInt(route.query.id) || 1,
      question: state.chat
    };
    const method = "POST";
    const body = JSON.stringify(obj);
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    fetch(endPoint, {method, headers, body}).then((res)=> {
      return res.json()
    }).then(res => {
      const score = parseInt(res.score)
      const cls = parseInt(res.answer)
      const clsLabel = int2label[cls]

      let comment = ''
      if(score >= 85) {
        if(cls === 1)
          comment = '正解です！'
        else
          comment = `${clsLabel} 重要です`
      } else if(score >= 70) {
        comment = `${clsLabel} 重要です`
      } else if(score >= 30) {
        comment = `${clsLabel}`
      } else {
        comment = `重要ではありません`
      }
      state.roomChats.push({ sender: 'ai', content: comment })
      isLoading.value = false
    }).catch(err => {
      console.error(err)
      isLoading.value = false
    });
    state.chat = ""
}


onMounted(async () => {
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
})

onUnmounted(() => {
})
</script>
<template>
  <div class="grid grid-cols-12">
    <div class="p-2 col-span-12 md:col-start-3 md:col-span-8">
      <div class="text-lg font-bold py-4">AIと遊ぼう</div>
      <div class="bg-white rounded-lg shadow-xl p-4 mb-2 space-y-1">
          <div class="border-0 w-full">
              <div class="font-bold mb-2">問題</div>
              <div class="break-words whitespace-pre-wrap px-4 py-4 bg-gray-100 rounded">
                {{ quizzes[route.query.id || 1] }}
              </div>
          </div>
      </div>
      <form @submit.prevent="sendChat" class="mb-2">
        <div class="relative">
          <div v-show="state.roomChats.length > 0" class="py-2 space-y-1 bg-white px-4 rounded mb-2 shadow-inner max-h-screen overflow-y-scroll sticky bottom-2 left-0 right-0">
            <div v-for="(item, index) in state.roomChats" :key="index">
                <bubble :position="item.sender === 'ai' ? 'left' : 'right'" :sender="item.sender === 'ai' ? 'AI' : 'You'" :content="item.content"></bubble>
            </div>
            <div
                class="rounded space-x-1 p-1 mr-2"
                v-show="isLoading">
                <span className="animate-ping absolute h-2 w-2 bg-blue-600 rounded-full"></span>
            </div>
          </div>
          <div class="">
            <input v-model="state.chat" type="text" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="チャット(Enterで送信)" required/>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
