<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store'
import client from '../supabase-client'

const router = useRouter()

const email = ref("")
const password = ref("")

const signUp = async () => {
  const { error } = await client.signUp({ email: email.value, password: password.value })
  if(error) {
    alert(error.message)
  } else {
    alert('ユーザ登録の確認メールを送信しました。メールボックスをチェックしてください。')
  }
}

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
  <div class="md:grid md:grid-cols-3">
    <div v-if="!store.user?.id" class="md:col-start-2 md:col-span-1 p-2 rounded bg-white shadow mt-2">
        <div class="mb-2">
            <input type="email" v-model="email" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="メールアドレス"/>
        </div>
        <div class="mb-2">
            <input type="password" v-model="password" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="パスワード"/>
        </div>
        <div>
            <button @click="signUp" class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1">登録</button>
            <button @click="signIn" class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 ml-2 px-3 py-1">ログイン</button>
        </div>
    </div>
    <div v-else>
        <div>ログイン済です</div>
        <router-link to="/" class="rounded border-solid border-2 ml-2 px-3 py-1">ホーム画面へ</router-link>
    </div>
  </div>
</template>