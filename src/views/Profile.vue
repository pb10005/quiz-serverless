<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store'
import client from '../supabase-client'
import { ActionButton } from '../components'

const router = useRouter()

const playerName = ref("")
const bio = ref("")
const registeredName = ref("")

const setUsername = async () => {
    const { error } = await client.upsertProfile({
        id: store.user.id,
        player_name: playerName.value,
        bio: bio.value
    })
    if(!error) {
        router.push("/")
    }
}

const getUsername = async () => {
    const profile = await client.getProfile()
    registeredName.value = profile.playerName
    playerName.value = profile.playerName
    bio.value = profile.bio
}

onMounted(async () => {
    await getUsername()
})

</script>
<template>
    <div class="grid grid-cols-12">
        <div class="p-2 col-span-12 md:col-start-3 md:col-span-8">
            <div v-if="registeredName" class="font-bold text-lg mb-2">プロフィールを更新</div>
            <div v-else>ユーザー名を登録してはじめて出題、参加することができます</div>
            <form @submit.prevent="setUsername">
                <input type="text" v-model="playerName" class="px-4 py-2 mb-2 mr-1 h-10 border-0 border-b-2 border-indigo-700 w-full" placeholder="ユーザー名" required /><br>
                <textarea type="text" v-model="bio" class="px-4 py-2 h-40 border-0 border-b-2 border-indigo-700 w-full" placeholder="自己紹介" /><br>
                <action-button label="登録"></action-button>
            </form>
        </div>
    </div>
</template>