<script setup>
defineProps({
    room: {
        type: Object,
        default: null
    }
})
</script>
<template>
    <div class="text-xl font-bold my-4">
        {{ room?.title }}
    </div>
</template>
