<script setup>
import { LinkButton, RoomCard } from '.'

defineProps(
    {
        player: {
            type: Object,
            default: {
                playerName: '',
                bio: ''
            }
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
        },
        unreadCount: {
            type: Number,
            default: 0
        }
    }
)
</script>
<template>
<div>
    <div class="bg-cyan-50 p-4 rounded-xl shadow-xl mt-2">
        <div class="flex mb-2">
            <div class="overflow-hidden relative w-10 h-10 bg-gray-100 rounded-full dark:bg-gray-600 mr-2">
                <svg class="absolute -left-1 w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
            </div>
            <div class="text-xl font-extrabold my-2">
                {{player.playerName}}
            </div>
        </div>
        <div class="p-4">{{player.bio}}</div>
        <link-button to="/profile" label="編集" class="mr-2"></link-button>
        <link-button to="/direct-message" :label="`ダイレクトメッセージ${unreadCount > 0 ? ('('+ unreadCount + ')') : ''}`"></link-button>
    </div>
    <div class="text-lg font-bold my-4">あなたが参加中の部屋</div>
    <div class="grid md:grid-cols-12">
        <div v-if="participatingRooms?.length === 0" class="flex justify-center items-center col-span-12 my-4">
            <link-button to="/?tab=quiz" label="参加する部屋を探しましょう"></link-button>
        </div>
        <div v-for="item in participatingRooms" :key="item.rooms.id" class="md:col-span-4 p-2">
        <room-card
            class=""
            :title="item.rooms.title"
            :ownerId="item.rooms.master_id"
            :owner="item.rooms.players.player_name"
            :tags="['ウミガメのスープ']"
            :roomId="item.rooms.id"
            :isMaster="userId === item.master_id">
        </room-card>
        </div>
    </div>
    <div class="text-lg font-bold my-4">あなたが作成した部屋</div>
    <div class="grid md:grid-cols-12">
        <div v-if="ownRooms?.length === 0" class="flex justify-center items-center col-span-12 my-4">
            <link-button to="/?tab=post" label="部屋を作成しましょう"></link-button>
        </div>
        <div v-for="item in ownRooms" :key="item.id" class="md:col-span-4 p-2">
        <room-card
            class=""
            :title="item.title"
            :ownerId="item.master_id"
            :owner="item.players.player_name"
            :tags="['ウミガメのスープ']"
            :roomId="item.id"
            :isMaster="userId === item.master_id">
        </room-card>
        </div>
    </div>
</div>
</template>
