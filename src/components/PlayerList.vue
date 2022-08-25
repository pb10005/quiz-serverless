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
    <div class="divide-y p-1">
        <div v-for="item in players" class="p-1 text-sm">
            {{item.player_number}}: {{item.players.player_name}}
        </div>
    </div>
</template>