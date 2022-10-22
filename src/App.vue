<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from './supabase'
import { store } from './store'
import client from './supabase-client'
import { LinkButton } from './components'

const playerName = ref("")
const route = useRoute()
const router = useRouter()

store.user = supabase.auth.getSession()
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
  <div class="bg-gray-100">
    <header class="flex justify-between py-2 bg-white">
      <span class="order-first">
        <button 
        class="ml-2 my-2 font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-800"
        @click="router.push('/')">クイズしよう</button>
      </span>
      <span class="order-last space-x-1 mr-1">
        <span v-if="store.user?.email" class="mr-1">
          ログイン中: 
          <router-link to="/?tab=profile">{{ playerName }}</router-link>
        </span>
        <span v-else class="mr-1">未ログイン</span>
        <link-button v-if="store.user?.email" @click="signOut" label="ログアウト"></link-button>
        <link-button v-else to="/login" label="ログイン"></link-button>
      </span>
    </header>
    <main>
      <div class="min-h-screen">
      <router-view :key="route"/>
      </div>
    </main>
  </div>
</template>
