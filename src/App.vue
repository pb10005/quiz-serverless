<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from './supabase'
import { store } from './store'
import client from './supabase-client'

const playerName = ref("")
const route = useRoute()
const router = useRouter()

store.user = supabase.auth.user()
supabase.auth.onAuthStateChange(async (_, session) => {
  if(!session) {
    store.user = {}
    return
  }
  store.user = session.user
  if(!store.user) return
  if(!store.user.id) return
  const username = await client.getUsername()
  playerName.value = username || 'Anonymous'
  if(!username)
    router.push("/profile")
})

const signOut = async () => {
  const { error } = await client.signOut()
  if(error) {
    alert(error.msg)
  }
}

watch(route, async () => {
  if(!store.user) return
  if(!store.user.id) return
  const username = await client.getUsername()
  playerName.value = username || 'Anonymous'
})
</script>

<template>
  <div class="bg-gray-50">
    <header class="flex justify-between py-4 shadow mb-2">
      <span class="order-first">
        <router-link class="border-0 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 ml-1 px-4 py-2 rounded" to="/">クイズしよう</router-link>
      </span>
      <span class="order-last space-x-1 mr-1">
        <span v-if="store.user?.email" class="mr-1">
          ログイン中: 
          <router-link to="/profile">{{ playerName }}</router-link>
        </span>
        <span v-else class="mr-1">未ログイン</span>
        <a v-if="store.user?.email" @click="signOut" class="cursor-pointer border-0 bg-gray-200 hover:bg-gray-700 hover:text-white ease-in-out duration-300 rounded ml-2 px-3 py-2">ログアウト</a>
        <router-link v-else to="/login" class="border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 rounded px-4 py-2">ログイン</router-link>
      </span>
    </header>
    <main>
      <div class="min-h-screen">
      <router-view :key="route"/>
      </div>
    </main>
  </div>
</template>
