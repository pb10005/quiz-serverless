<script setup>
import { ref } from 'vue'
import client from '../supabase-client'
import { ActionButton } from '@/components';

const err = ref("")
const info = ref("")
const email = ref("")
const password = ref("")

const signUp = async () => {
  const { error } = await client.signUp({ email: email.value, password: password.value })
  if(err.message) {
    alert(err)
    err.value = error.message
    info.value = ''
  } else {
    err.value = ''
    info.value = 'ユーザ登録の確認メールを送信しました。メールボックスをチェックしてください。'
  }
}
</script>


<template>
      <div class="md:grid md:grid-cols-3">
            <div class="md:col-start-2 md:col-span-1 p-2 rounded bg-white shadow my-2">
                  <div v-if="err" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                        <p class="font-bold">エラー</p>
                        <div>{{err}}</div>
                  </div>
                  <div v-if="info" class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
                        <p class="font-bold">お知らせ</p>
                        <div>{{info}}</div>
                  </div>
                  <form @submit.prevent="signUp">
                        <div class="mb-2">
                              <input type="email" v-model="email" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="メールアドレス" required/>
                        </div>
                        <div class="mb-2">
                              <input type="password" v-model="password" class="px-4 py-2 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="パスワード" required/>
                        </div>
                        <div class="text-sm mb-2">登録したメールアドレス宛に確認メールを送信します。</div>
                        <action-button label="登録"></action-button>
                  </form>
            </div>
      </div>
</template>