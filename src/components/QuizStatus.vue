<script setup>
const quizStatus = {
    '0': '出題中',
    '1': '正解発表',
    '2': '終了'
}
defineProps({
    quiz: {
        type: Object,
        default: null
    }
})
</script>
<template>
    <div class="font-bold">出題状況</div>
    <div class="p-1">
        <span v-if="quiz">第{{ quiz.quiz_number }}問: {{ quizStatus[quiz.status ] }}</span>
        <span v-else>出題待ち</span>
    </div>
</template>