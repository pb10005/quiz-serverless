<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store'
import client from '../supabase-client'
import { supabase } from '../supabase'

const state = reactive({
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
  for(const s of state.subscriptions) {
    supabase.removeSubscription(s)
  }
})
</script>

<template>
  <div class="grid md:grid-cols-12">
    <div class="md:col-start-1 md:col-span-3 p-2 h-auto">
      <form @submit.prevent="createRoom" class="bg-white shadow p-2">
        <div>
          <label class="font-bold">出題する</label>
          <input type="text" v-model="state.newRoom.title" class="px-3 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full mb-2" placeholder="部屋名" required/>
          <br>
          <input id="public" type="checkbox" v-model="state.newRoom.is_public" checked class="mr-1" />
          <label for="public">ホーム画面の一覧に表示する</label>
          <br>
          <button type="submit" class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1 w-full">部屋を作成する</button>
        </div>
      </form>
    </div>
    <div class="md:col-start-4 md:col-span-9 p-2 mt-2">
      <div class="grid md:grid-cols-12">
        <div class="bg-white shadow p-2 md:col-span-4">
          <div class="font-bold text-lg mb-1">101倍のお金</div>
          <div class="text-gray-700 mb-1">管理者</div>
          <div class="p-2">
            <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">AI</span>
          </div>
          <span class="">
            <router-link class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/play-with-ai/?id=1`">遊ぶ(ログイン不要)</router-link>
          </span>
        </div>
        <div class="bg-white shadow p-2 md:col-span-4">
          <div class="font-bold text-lg mb-1">望月家のしきたり</div>
          <div class="text-gray-700 mb-1">管理者</div>
          <div class="p-2">
            <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">AI</span>
          </div>
          <span class="">
            <router-link class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/play-with-ai/?id=2`">遊ぶ(ログイン不要)</router-link>
          </span>
        </div>
      </div>
      <div class="text-lg font-bold">参加者募集中の部屋</div>
      <div class="divide-y">
        <div v-for="item in state.rooms" :key="item.id" class="flex justify-between p-2">
          <span class="order-first">{{ item.title }} by {{ item.players.player_name}}</span>
          <span class="order-last">
            <router-link class="order-last rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/master/${item.id}`" v-if="store.user?.id === item.master_id">出題者画面</router-link>
            <router-link class="order-last rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/play/${item.id}`" v-else>参加</router-link>
          </span>
        </div>
      </div>
      <div class="text-lg font-bold">あなたが参加中の部屋</div>
      <div class="divide-y">
        <div v-for="item in state.participatingRooms" :key="item.id" class="flex justify-between p-2">
          <span class="order-start">{{ item.rooms.title }} by {{ item.rooms.players.player_name }}</span>
          <span class="order-last align-center space-x-1">
            <router-link class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/play/${item.room_id}`">入室</router-link>
          </span>
        </div>
      </div>
      <div class="text-lg font-bold">あなたが作成した部屋</div>
      <div class="divide-y">
        <div v-for="item in state.ownRooms" :key="item.id" class="flex justify-between p-2">
          <span class="order-start">{{ item.title }}</span>
          <span class="order-last align-center space-x-1">
            <router-link class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/master/${item.id}`">出題者画面</router-link>
            <router-link class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1" :to="`/quiz/play/${item.id}`">参加者画面</router-link>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
