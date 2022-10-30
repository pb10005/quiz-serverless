<script setup>
defineProps({
    room: {
        type: Object,
        default: null
    }
})
</script>
<template>
    <div class="text-xl font-bold my-2">
        {{ room?.title }}
    </div>
    <div class="break-words whitespace-pre-wrap">
        {{room?.description}}
    </div>
</template>
