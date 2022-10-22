<script setup>
defineProps({
    to: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: 'button'
    }
})
</script>
<template>
    <router-link :to="to" class="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800">
        <div class="w-full relative px-5 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            {{ label }}
        </div>
    </router-link>
</template>