<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './supabase'
import { store } from './store'
import client from './supabase-client'

const playerName = ref("")
const router = useRouter()

store.user = supabase.auth.user()
supabase.auth.onAuthStateChange(async (_, session) => {
  if(!session) {
    store.user = {}
    return
  }
  store.user = session.user
  if(store.user) {
    const username = await client.getUsername()
    playerName.value = username || 'Anonymous'
    if(!username)
      router.push("/profile")
  }
})

const signOut = async () => {
  const { error } = await client.signOut()
  if(error) {
    alert(error.msg)
  }
}
</script>

<template>
  <div>
    <router-link class="bg-gray-300 px-2 py-2 mr-2" to="/">クイズしよう</router-link>
    <span>{{ store.user?.email ? `ログイン中: ${playerName}` : '未ログイン' }}</span>
    <button v-if="store.user?.email" @click="signOut" class="rounded border-solid border-2 ml-2 px-3 py-1">ログアウト</button>
    <button v-else="store.user?.email" @click="router.push('/login')" class="rounded border-solid border-2 ml-2 px-3 py-1">ログイン</button>
    <main>
      <div class="bg-gray-50 min-h-screen">
      <router-view :key="store.user"/>
      </div>
    </main>
  </div>
</template>
