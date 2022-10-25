<script setup>
defineProps({
    position: {
        type: String,
        default: ''
    },
    sender: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    }
})
</script>
<template>
    <div
        v-if="position === 'left'"
        class="flex item-end">
        <div
            class="rounded-full rounded-bl-none space-x-1 bg-blue-100 shadow px-4 py-2">
            <span class="text-xs text-gray-500">{{sender}}</span>
            <span class="text-sm">{{content}}</span>
        </div>
    </div>
    <div
        v-if="position === 'right'"
        class="flex item-end justify-end">
        <div
            class="rounded-full rounded-br-none space-x-1 bg-teal-50 shadow px-4 py-2">
            <span class="text-xs text-gray-500">{{sender}}</span>
            <span class="text-sm">{{content}}</span>
        </div>
    </div>
</template>
