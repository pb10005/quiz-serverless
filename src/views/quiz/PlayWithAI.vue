<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../../store'
import client from '../../supabase-client'
import { RoomChat } from '../../components'

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

const sendChat = async () => {
    isLoading.value = true
    state.roomChats.push({ sender: 'you', content: state.chat})
    const obj = {question: state.chat};
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

      let comment = `${score}点です。`
      if(score >= 85) {
        comment += '正解です！'
      } else if(score >= 70) {
        comment += `回答：${clsLabel} あと一歩！要素をまとめてみましょう。`
      } else if(score >= 30) {
        comment += `回答：${clsLabel} 関連する質問や視点を変えた質問をしてみましょう。`
      } else {
        comment += `質問文を見直してみましょう。`
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
    <div class="">
        <div class="p-2">
            <div class="text-lg font-bold">【実証実験】AIと遊ぼう</div>
            <div class="bg-white rounded shadow p-2 mb-2 space-y-1">
                <div class="border-0 w-full">
                    <div class="font-bold">問題</div>
                    <div class="break-words whitespace-pre-wrap px-4 py-2 bg-gray-100 rounded">
                      ほんの僅かな額のお金を手に入れたはずの男が、その101倍のお金を受け取ったのは何故だろう？
                    </div>
                    <div class="px-4 py-2">
                        正解との類似度を100点満点(1点刻み)で評価します。
                    </div>
                </div>
            </div>
            <form @submit.prevent="sendChat" class="mb-2">
                <input v-model="state.chat" type="text" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="チャット(Enterで送信)" required/>
                <div class="py-2 space-y-1">
                  <div v-for="(item, index) in state.roomChats" :key="index">
                      <div
                          v-if="item.sender === 'ai'"
                          class="rounded space-x-1 p-1 bg-indigo-100 shadow mr-2">
                          <span class="text-sm text-gray-500">AI</span>
                          <span>{{item.content}}</span>
                      </div>
                      <div
                          v-else
                          class="rounded space-x-1 p-1 bg-gray-100 shadow ml-2">
                          <span class="text-sm text-gray-500">You</span>
                          <span>{{item.content}}</span>
                      </div>
                  </div>
                  <div
                      class="rounded space-x-1 p-1 bg-indigo-100 shadow mr-2"
                      v-show="isLoading">
                      <span className="animate-ping absolute h-2 w-2 bg-blue-600 rounded-full"></span>
                      <span class="text-sm text-gray-500">AI</span>
                  </div>
                </div>
            </form>
        </div>
    </div>
</template>
