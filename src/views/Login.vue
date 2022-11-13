<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store'
import client from '../supabase-client'
import { ActionButton, LinkButton } from '../components'

const router = useRouter()

const email = ref("")
const password = ref("")

const signIn = async () => {
  const { error } = await client.signIn({ email: email.value, password: password.value })
  if(error) {
    alert(error.message)
  } else {
      router.push("/")
  }
}
</script>
<template>
  <div class="md:grid md:grid-cols-3 md:grid-rows-3 w-full min-h-screen">
    <form v-if="!store.user?.id" @submit.prevent="signIn" class="md:col-start-2 md:col-span-1 px-2 py-4 rounded-xl bg-white shadow-xl mt-2">
      <div class="font-bold text-lg my-1">ログイン</div>
      <div class="mb-2">
          <input type="email" v-model="email" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="メールアドレス" required/>
      </div>
      <div class="mb-2">
          <input type="password" v-model="password" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="パスワード" required/>
      </div>
      <div>
          <action-button label="ログイン"></action-button>
          <div>または<router-link to="/signup" class="underline">ユーザー登録</router-link></div>
      </div>
    </form>
    <div v-else class="md:col-start-2 md:col-span-1 md:row-start-2 md:row-span-1">
      <div>
        <p class="text-center font-bold text-xl my-4">ログイン済です</p>
        <link-button class="w-full text-center" to="/" label="ホーム画面へ"></link-button>
      </div>
    </div>
  </div>
</template>