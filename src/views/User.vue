<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { LinkButton } from '../components'
import client from '../supabase-client'

const state = reactive({
    player: {
        id: '',
        playerName: '',
        bio: ''
    }
})

const route = useRoute()

onMounted(async () => {
    const data = await client.getProfileById(route.params.id)
    state.player = {
        id: route.params.id,
        playerName: data.playerName,
        bio: data.bio,
    }
})
</script>
<template>
    <div class="bg-cyan-50 p-4 rounded-xl shadow-xl mt-2">
        <div class="flex mb-2">
            <div class="overflow-hidden relative w-10 h-10 bg-gray-100 rounded-full dark:bg-gray-600 mr-2">
                <svg class="absolute -left-1 w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
            </div>
            <div class="text-xl font-extrabold my-2">
                {{state.player.playerName}}
            </div>
        </div>
        <div class="p-4">{{state.player.bio}}</div>
        <link-button :to="`/direct-message/${state.player.id}`" label="DMを送る"></link-button>
    </div>
</template>
