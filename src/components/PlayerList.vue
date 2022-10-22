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
        <div v-for="item in players" class="px-1 text-sm  py-2">
            {{item.player_number}}: {{item.players.player_name}}
        </div>
    </div>
</template>