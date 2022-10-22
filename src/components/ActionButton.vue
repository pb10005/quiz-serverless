<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
    label: {
        type: String,
        default: 'button'
    }
})

const emit = defineEmits(['click'])
const click = _ => {
    emit('click', _)
}
</script>
<template>
    <button @click="click" class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br hover:bg-gradient-to-bl from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800">
        <div class="w-full relative px-5 py-2.5 transition-all ease-in duration-75 dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            {{ label }}
        </div>
    </button>
</template>