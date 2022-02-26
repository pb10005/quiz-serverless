<script setup>
defineProps({
    players: {
        type: Array,
        default: []
    }
})
</script>
<template>
    <div class="text-lg font-bold">参加者一覧</div>
    <div v-for="item in players">
        {{item.player_number}}: {{item.players.player_name}}
    </div>
</template>