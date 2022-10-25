<script setup>
defineProps({
    players: {
        type: Array,
        default: []
    }
})
</script>
<template>
    <div class="font-bold">参加者一覧</div>
    <div class="divide-y">
        <button v-for="item in players" class="pl-2 text-left text-sm py-2 block w-full" @click="$router.push(`/user/${item.player_id}`)">
            {{item.player_number}}: {{item.players.player_name}}
        </button>
    </div>
</template>