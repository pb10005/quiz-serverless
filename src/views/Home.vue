<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store'
import client from '../supabase-client'
import { supabase } from '../supabase'
import { RoomCard } from '../components'

const state = reactive({
  selectedTab: 'quiz',
  newRoom: {
    title: "",
    description: "",
    is_public: true 
  },
  rooms: [],
  participatingRooms: [],
  ownRooms: [],
  subscriptions: [] 
})

const router = useRouter()

const createRoom = async () => {
  const { data, error } = await client.createRoom(state.newRoom)
}

const fetchData = async () => {
  const rooms = await client.selectRooms({status: '0'})
  state.rooms = rooms.data
  const ownRooms = await client.selectOwnRooms()
  state.ownRooms = ownRooms.data 
  const participatingRooms = await client.selectParticipatingRooms()
  state.participatingRooms = participatingRooms.data 
}

onMounted(async () => {
  await fetchData()
  state.subscriptions = [...state.subscriptions, await client.subscribeRooms(fetchData)]

  if(!store.user) return
  if(!store.user.id) return
  const username = await client.getUsername()
  if(!username) {
      router.push("/profile")
      return
  }
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
        <button
            :class="{ 'bg-gray-300': state.selectedTab === 'quiz'}"
            @click="state.selectedTab = 'quiz'"
            class="border-0 px-3 py-1 w-full">
            部屋に参加する
        </button>
        <button
            :class="{ 'bg-gray-300': state.selectedTab === 'post'}"
            @click="state.selectedTab = 'post'"
            class="border-0 px-3 py-1 w-full">
            部屋を作成する
        </button>
        <button
            :class="{ 'bg-gray-300': state.selectedTab === 'profile'}"
            @click="state.selectedTab = 'profile'"
            class="border-0 px-3 py-1 w-full">
            プロフィール
        </button>
      </div>
    </div>
    <div class="md:col-start-4 md:col-span-9">
      <div class="p-2 h-auto">
        <form @submit.prevent="createRoom" class="bg-white shadow p-2" v-show="state.selectedTab === 'post'">
          <div>
            <div class="font-bold text-lg my-2">出題する</div>
            <input type="text" v-model="state.newRoom.title" class="px-3 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full mb-2" placeholder="部屋名" required/>
            <div class="my-2">
              <input id="public" type="checkbox" v-model="state.newRoom.is_public" checked class="mr-1" />
              <label for="public">ホーム画面の一覧に表示する</label>
            </div>
            <button type="submit" class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1 w-full">部屋を作成する</button>
          </div>
        </form>
      </div>
      <div v-show="state.selectedTab === 'quiz'">
        <div class="text-lg font-bold my-4">AIと遊ぼう</div>
        <div class="grid md:grid-cols-12">
          <div class="md:col-span-4 p-2">
            <div class="bg-white shadow p-2">
              <div class="font-bold text-lg mb-1">101倍のお金</div>
              <div class="text-gray-700 mb-1">管理者</div>
              <div class="p-2">
                <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">AI</span>
              </div>
              <span class="">
                <router-link class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/play-with-ai/?id=1`">参加(ログイン不要)</router-link>
              </span>
            </div>
          </div>
          <div class="p-2 md:col-span-4">
            <div class="bg-white shadow p-2">
              <div class="font-bold text-lg mb-1">望月家のしきたり</div>
              <div class="text-gray-700 mb-1">管理者</div>
              <div class="p-2">
                <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">AI</span>
              </div>
              <span class="">
                <router-link class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/play-with-ai/?id=2`">参加(ログイン不要)</router-link>
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
              :owner="item.players.player_name"
              :tags="['ウミガメのスープ']"
              :roomId="item.id"
              :isMaster="store.user?.id === item.master_id">
            </room-card>
          </div>
        </div>
      </div>
      <div v-show="state.selectedTab === 'profile'">
        <div class="text-lg font-bold my-4">あなたが参加中の部屋</div>
        <div class="grid md:grid-cols-12">
          <div v-for="item in state.participatingRooms" :key="item.rooms.id" class="md:col-span-4 p-2">
            <room-card
              class=""
              :title="item.rooms.title"
              :owner="item.rooms.players.player_name"
              :tags="['ウミガメのスープ']"
              :roomId="item.rooms.id"
              :isMaster="store.user?.id === item.master_id">
            </room-card>
          </div>
        </div>
        <div class="text-lg font-bold my-4">あなたが作成した部屋</div>
        <div class="grid md:grid-cols-12">
          <div v-for="item in state.ownRooms" :key="item.id" class="md:col-span-4 p-2">
            <room-card
              class=""
              :title="item.title"
              :owner="item.players.player_name"
              :tags="['ウミガメのスープ']"
              :roomId="item.id"
              :isMaster="store.user?.id === item.master_id">
            </room-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
