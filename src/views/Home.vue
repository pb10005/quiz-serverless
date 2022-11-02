<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../store'
import client from '../supabase-client'
import { supabase } from '../supabase'
import { ActionButton, LinkButton, NotificationCard, ProfileTab, RoomCard } from '../components'

const state = reactive({
  selectedTab: 'profile',
  newRoom: {
    title: "",
    description: "",
    is_public: true 
  },
  rooms: [],
  participatingRooms: [],
  ownRooms: [],
  subscriptions: [],
  player: {
    playerName: '',
    bio: ''
  },
  unreadCount: 0,
  notifications: []
})

const router = useRouter()
const route = useRoute()
const playerName = ref('')

const createRoom = async () => {
  const { data, error } = await client.createRoom(state.newRoom)
  if(!error) {
    router.push('/?profile')
  }
}

const fetchData = async () => {
  const rooms = await client.selectRooms({status: '0'})
  state.rooms = rooms.data
  
  if(!store.user) return
  if(!store.user.id) return

  const ownRooms = await client.selectOwnRooms()
  state.ownRooms = ownRooms.data 
  const participatingRooms = await client.selectParticipatingRooms()
  state.participatingRooms = participatingRooms.data 

  state.notifications = await client.selectNotifications()
}

const countUnread = (notifications) => {
  return notifications?.filter(n => !n.read).length
}

const notifyDirectMessages = async () => {
  const count = await client.countUnread()
  state.unreadCount = count
}

const fetchNotifications = async () => {
  state.notifications = await client.selectNotifications()
}

onMounted(async () => {
  state.selectedTab = route.query.tab || 'profile'
  await fetchData()
  await notifyDirectMessages()
  state.subscriptions = [
    ...state.subscriptions,
    await client.subscribeRooms(fetchData),
    await client.subscribeDirectMessages(notifyDirectMessages),
    await client.subscribeNotifications(fetchNotifications)
  ]

  if(!store.user) return
  if(!store.user.id) return
  const profile = await client.getProfile()
  const username = profile.playerName
  playerName.value = profile.playerName
  state.player = Object.assign({}, profile)
  
  if(!username) {
      router.push("/profile")
      return
  }
})

watch(
  () => route.query.tab,
  async newTab => {
    state.selectedTab = route.query.tab || 'profile'
  }
)
watch(
  () => store.user?.id,
  async newUser => {
    const profile = await client.getProfile()
    playerName.value = profile?.playerName | ''
    state.player = Object.assign({}, profile)
  }
)

onUnmounted(() => {
  for(const s of supabase.getChannels()) {
    supabase.removeChannel(s)
  }
})
</script>

<template>
  <div class="grid md:grid-cols-12">
    <div class="md:col-start-1 md:col-span-3">
      <div>
        <button
            :class="{ 'text-white bg-gradient-to-r from-cyan-500 to-blue-500': state.selectedTab === 'profile'}"
            @click="router.push('/?tab=profile')"
            class="md:py-2 hover:text-white hover:bg-gradient-to-bl hover:from-cyan-500 hover:to-blue-500 border-0 px-3 py-1 w-full tracking-wider"> 
            プロフィール
        </button>
        <button
            :class="{ 'text-white bg-gradient-to-r from-cyan-500 to-blue-500': state.selectedTab === 'notification'}"
            @click="router.push('/?tab=notification')"
            class="md:py-2 hover:text-white hover:bg-gradient-to-bl hover:from-cyan-500 hover:to-blue-500 border-0 px-3 py-1 w-full tracking-wider"> 
            通知{{countUnread(state.notifications) > 0 ? `(${countUnread(state.notifications)})` : ''}}
        </button>
        <button
            :class="{ 'text-white bg-gradient-to-r from-cyan-500 to-blue-500': state.selectedTab === 'quiz'}"
            @click="router.push('/?tab=quiz')"
            class="md:py-2 hover:text-white hover:bg-gradient-to-bl hover:from-cyan-500 hover:to-blue-500 border-0 px-3 py-1 w-full tracking-widest">
            部屋に参加する
        </button>
        <button
            :class="{ 'text-white bg-gradient-to-r from-cyan-500 to-blue-500': state.selectedTab === 'post'}"
            @click="router.push('/?tab=post')"
            class="md:py-2 hover:text-white hover:bg-gradient-to-bl hover:from-cyan-500 hover:to-blue-500 border-0 px-3 py-1 w-full tracking-wider">
            部屋を作成する
        </button>
      </div>
    </div>
    <div class="md:col-start-4 md:col-span-9 px-2">
      <div class="h-auto">
        <form @submit.prevent="createRoom" class="p-2" v-show="state.selectedTab === 'post'">
          <div>
            <div class="font-bold text-lg my-2">部屋を作成する</div>
            <input type="text" v-model="state.newRoom.title" class="px-3 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full mb-2" placeholder="部屋名" required/>
            <textarea type="text" v-model="state.newRoom.description" class="px-3 py-2 h-40 border-0 border-b-2 border-indigo-700 w-full mb-2" placeholder="部屋の説明" required/>
            <div class="my-2">
              <label for="default-toggle" class="inline-flex relative items-center mb-4 cursor-pointer">
                <input type="checkbox" v-model="state.newRoom.is_public" checked id="default-toggle" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">ホーム画面の一覧に表示する</span>
              </label>
            </div>
            <action-button type="submit" label="部屋を作成する"></action-button>
          </div>
        </form>
      </div>
      <div v-show="state.selectedTab === 'notification'" class="p-2">
        <notification-card :notifications="state.notifications"></notification-card>
      </div>
      <div v-show="state.selectedTab === 'quiz'" class="p-2">
        <div class="text-lg font-bold my-2">AIと遊ぼう</div>
        <div class="grid md:grid-cols-12">
          <div class="md:col-span-4 p-2">
            <div class="bg-white rounded-lg shadow-xl p-2">
              <div class="font-bold text-xl my-4">101倍のお金</div>
              <div class="text-gray-700 mb-1">管理者</div>
              <div class="p-2">
                <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">AI</span>
              </div>
              <span class="">
                <link-button :to="`/quiz/play-with-ai/?id=1`" label="参加(ログイン不要)"></link-button>
              </span>
            </div>
          </div>
          <div class="p-2 md:col-span-4">
            <div class="bg-white rounded-lg shadow-xl p-2">
              <div class="font-bold text-xl my-4">望月家のしきたり</div>
              <div class="text-gray-700 mb-1">管理者</div>
              <div class="p-2">
                <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">AI</span>
              </div>
              <span class="">
                <link-button :to="`/quiz/play-with-ai/?id=2`" label="参加(ログイン不要)"></link-button>
              </span>
            </div>
          </div>
        </div>
        <div class="text-lg font-bold my-4">参加者募集中の部屋</div>
        <div class="grid md:grid-cols-12">
          <div v-for="item in state.rooms" :key="item.id" class="md:col-span-4 p-2">
            <room-card
              class=""
              :title="item.title"
              :ownerId="item.master_id"
              :owner="item.players.player_name"
              :tags="['ウミガメのスープ']"
              :roomId="item.id"
              :isMaster="store.user?.id === item.master_id">
            </room-card>
          </div>
        </div>
      </div>
      <div v-show="state.selectedTab === 'profile'">
        <profile-tab v-if="playerName" :userId="store.user?.id" :player="state.player" :participatingRooms="state.participatingRooms" :ownRooms="state.ownRooms" :unreadCount="state.unreadCount"></profile-tab>
        <div v-show="!playerName" class="flex justify-center items-center my-4">
          <link-button to="/login" label="ログインしましょう"></link-button>
        </div>
      </div>
    </div>
  </div>
</template>
