<script setup>
import { defineProps } from 'vue'
import { RoomCard } from '../components'

defineProps(
    {
        playerName: {
            type: String,
            default: ''
        },
        userId: {
            type: String,
            default: ''
        },
        participatingRooms: {
            type: Array,
            default: []
        },
        ownRooms: {
            type: Array,
            default: []
        }
    }
)
</script>
<template>
<div>
    <div class="text-xl my-2">{{playerName}}</div>
    <router-link to="/profile" class="rounded border-0 bg-indigo-200 hover:bg-indigo-700 hover:text-white ease-in-out duration-300 px-3 py-1">編集</router-link>
    <div class="text-lg font-bold my-4">あなたが参加中の部屋</div>
    <div class="grid md:grid-cols-12">
        <div v-for="item in participatingRooms" :key="item.rooms.id" class="md:col-span-4 p-2">
        <room-card
            class=""
            :title="item.rooms.title"
            :owner="item.rooms.players.player_name"
            :tags="['ウミガメのスープ']"
            :roomId="item.rooms.id"
            :isMaster="userId === item.master_id">
        </room-card>
        </div>
    </div>
    <div class="text-lg font-bold my-4">あなたが作成した部屋</div>
    <div class="grid md:grid-cols-12">
        <div v-for="item in ownRooms" :key="item.id" class="md:col-span-4 p-2">
        <room-card
            class=""
            :title="item.title"
            :owner="item.players.player_name"
            :tags="['ウミガメのスープ']"
            :roomId="item.id"
            :isMaster="userId === item.master_id">
        </room-card>
        </div>
    </div>
</div>
</template>
