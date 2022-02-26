<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
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
  ownRooms: [],
  subscriptions: [] 
})

const createRoom = async () => {
  const { data, error } = await client.createRoom(state.newRoom)
}

const fetchData = async () => {
  const rooms = await client.selectRooms({status: '0'})
  state.rooms = rooms.data
  const ownRooms = await client.selectOwnRooms()
  state.ownRooms = ownRooms.data 
}

onMounted(async () => {
  await fetchData()
  state.subscriptions = [...state.subscriptions, await client.subscribeRooms(fetchData)]
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
      <form @submit.prevent="createRoom" class="mb-2">
        <div>
          <label class="font-bold">出題する</label>
          <input type="text" v-model="state.newRoom.title" class="px-3 py-2 h-10 border-0 w-full mb-2" placeholder="部屋名" required/>
          <br>
          <input id="public" type="checkbox" v-model="state.newRoom.is_public" checked class="mr-1" />
          <label for="public">ホーム画面の一覧に表示する</label>
          <br>
          <button type="submit" class="rounded border-solid border-2 px-3 py-1 w-full">部屋を作成する</button>
        </div>
      </form>
    </div>
    <div class="md:col-start-4 md:col-span-9 p-2">
      <div class="text-lg font-bold">参加者募集中の部屋</div>
      <div v-for="item in state.rooms" :key="item.id" class="my-3">
        <span>{{ item.title }}</span>
        <span> by {{ item.players.player_name}}</span>
        <router-link class="rounded border-solid border-2 ml-2 px-3 py-1" :to="`/quiz/master/${item.id}`" v-if="store.user?.id === item.master_id">出題者画面</router-link>
        <router-link class="rounded border-solid border-2 ml-2 px-3 py-1" :to="`/quiz/play/${item.id}`" v-else>参加</router-link>
      </div>
      <div class="text-lg font-bold">あなたが作成した部屋</div>
      <div v-for="item in state.ownRooms" :key="item.id" class="my-3">
        <span>{{ item.title }}</span>
        <router-link class="rounded border-solid border-2 ml-2 px-3 py-1" :to="`/quiz/master/${item.id}`">出題者画面</router-link>
        <router-link class="rounded border-solid border-2 ml-2 px-3 py-1" :to="`/quiz/play/${item.id}`">参加者画面</router-link>
      </div>
    </div>
  </div>
</template>
