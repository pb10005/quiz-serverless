<script setup>
defineProps({
    room: {
        type: Object,
        default: null
    }
})
</script>
<template>
    <div class="text-xl font-bold">
        {{ room?.title }}
    </div>
</template>
