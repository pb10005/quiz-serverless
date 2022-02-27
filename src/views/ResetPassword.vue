<script setup>
import { ref } from 'vue'
import client from '../supabase-client'

const password = ref("")
const resetPassword = async () => {
    const { user, error } = await client.resetPassword(password.value)
    if(error) {
        alert(error.message)
    }
    console.log(user)
}
</script>
<template>
    <div>パスワードを変更</div>
    <form @submit.prevent="resetPassword">
        <input type="password" v-model="password" class="px-2 py-1 h-10 border-0 border-b-2 border-indigo-700 mb-2" placeholder="パスワード" /><br>
        <button class="bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-2">リセット</button>
    </form>
</template>