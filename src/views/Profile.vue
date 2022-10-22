<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store'
import client from '../supabase-client'
import { ActionButton } from '../components'

const router = useRouter()

const playerName = ref("")
const registeredName = ref("")

const setUsername = async () => {
    const { error } = await client.upsertProfile({
        id: store.user.id,
        player_name: playerName.value,
        bio: 'None'
    })
    if(!error) {
        router.push("/")
    }
}

const getUsername = async () => {
    const username = await client.getUsername()
    registeredName.value = username
    playerName.value = username
}

onMounted(async () => {
    await getUsername()
})

</script>
<template>
    <div class="p-2">
        <div v-if="registeredName">ユーザー名を変更</div>
        <div v-else>ユーザー名を登録してはじめて出題、参加することができます</div>
        <form @submit.prevent="setUsername">
            <input type="text" v-model="playerName" class="px-4 py-2 mr-1 h-10 border-0 border-b-2 border-indigo-700" placeholder="ユーザー名" required />
            <action-button label="登録"></action-button>
        </form>
    </div>
</template>