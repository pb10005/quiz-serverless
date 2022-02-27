import { supabase } from './supabase'
import { store } from './store'

export default {
    // auth
    async signUp({ email, password }) {
        const { error } = await supabase.auth.signUp({
            email,
            password
        })
        return {
            error
        }
    },
    async signIn({ email, password }) {
        const { error } = await supabase.auth.signIn({
            email,
            password
        })
        return {
            error
        }
    },
    async signOut() {
        const { error } = await supabase.auth.signOut()
        return {
            error
        }
    },
    // profile
    async upsertProfile({ id, player_name }) {
        const { error } = await supabase
            .from('players')
            .upsert({
                id,
                player_name
            })
        return {
            error
        }
    },
    async getUsername() {
        const { data, error } = await supabase
            .from('players')
            .select('player_name')
            .match({ id: store.user?.id })
        if(error) return null
        if(data.length === 0) return null
        return data[0].player_name
    },
    // room
    async createRoom({
        title,
        description,
        is_public
    }) {
        const { data, error } = await supabase
            .from('rooms')
            .insert({
                title,
                description,
                is_public,
                master_id: store.user.id
            })
        return {
            data,
            error
        }
    },
    async selectRooms({ status }) {
        const { data, error } = await supabase
            .from('rooms')
            .select('id, title, status, master_id, players!rooms_master_id_fkey(player_name)')
            .match({status, is_public: true})
        return {
            data,
            error
        }
    },
    async selectOwnRooms() {
        if(!store.user) {
            return {
                data: []
            }
        }
        const { data, error } = await supabase
            .from('rooms')
            .select('id, title, status, master_id, players!rooms_master_id_fkey(player_name)')
            .match({ master_id: store.user?.id })
        return {
            data,
            error
        }
    },
    async getRoomById(room_id) {
        const { data, error } = await supabase
            .from('rooms')
            .select()
            .match({id: room_id})
        if(error) return null
        if(data.length === 0) return null
        return {
            data: data[0]
        }
    },
    async closeParticipation({ room_id }) {
        await supabase
            .from('rooms')
            .update({
                status: '1'
            })
            .match({id: room_id})
    },
    async reopenParticipation({ room_id }) {
        await supabase
            .from('rooms')
            .update({
                status: '0'
            })
            .match({id: room_id})
    },
    async subscribeRooms(handleEvents) {
        const subscription = await supabase
            .from('rooms')
            .on('INSERT', handleEvents)
            .on('UPDATE', handleEvents)
            .on('DELETE', handleEvents)
            .subscribe()
        return subscription
    },
    // quiz
    async getMaxQuizNumber({
        room_id
    }) {
        const { data, error } = await supabase
            .from('quizzes')
            .select('quiz_number')
            .match({room_id})
            .order('quiz_number', { ascending: false })
        if(error) {
            return {
                error
            }
        }
        if(!data) {
            return {
                number: 0
            }
        } else if(data.length === 0) {
            return {
                number: 0
            }
        } else {
            return {
                number: data[0].quiz_number
            }
        }
    },
    async createQuiz({
        quiz_number,
        room_id,
        question,
        answer
    }) {
        const { data, error } = await supabase
            .from('quizzes')
            .insert({
                room_id,
                question,
                quiz_number
            })
        if(error) return
        if(data[0]) {
            await supabase
                .from('quiz_hiddens')
                .insert({
                    id: data[0].id,
                    room_id,
                    answer
                })
        }
    },
    async showAnswer({
        quiz_id
    }) {
        const { data, error } = await supabase
            .from('quiz_hiddens')
            .select()
            .match({ id: quiz_id })
        if(error) return
        if(data.length > 0) {
            await supabase
                .from('quizzes')
                .update({
                    answer: data[0].answer,
                    status: '1'
                })
                .match({ id: quiz_id })
        }
    },
    async closeQuiz({
        quiz_id
    }) {
        await supabase
            .from('quizzes')
            .update({
                status: '2'
            })
            .match({ id: quiz_id })
    },
    async getCurrentQuiz({
        room_id
    }) {
        const { data, error } = await supabase
            .from('quizzes')
            .select()
            .match({room_id})
            .order('quiz_number', { ascending: false })
            .limit(1)
        if(error) return null
        if(data.length === 0) return null
        return data[0]
    },
    async subscribeQuizzes({ room_id }, handleEvents) {
        const subscription = await supabase
            .from(`quizzes:room_id=eq.${room_id}`)
            .on('INSERT', handleEvents)
            .on('UPDATE', handleEvents)
            .on('DELETE', handleEvents)
            .subscribe()
        return subscription
    },
    // quiz hiddens
    async getCurrentQuizHidden({
        id
    }) {
        const { data, error } = await supabase
            .from('quiz_hiddens')
            .select()
            .match({ id })
            .limit(1)
        if(error) return null
        if(data.length === 0) return null
        return data[0]
    },
    // room players
    
    async getMaxPlayerNumber({
        room_id
    }) {
        const { data, error } = await supabase
            .from('room_players')
            .select('player_number')
            .match({room_id})
            .order('player_number', { ascending: false })
        if(error) {
            return {
                error
            }
        }
        if(!data) {
            return {
                number: 0
            }
        } else if(data.length === 0) {
            return {
                number: 0
            }
        } else {
            return {
                number: data[0].player_number
            }
        }
    },
    async joinRoom({
        player_number,
        player_id,
        room_id
    }) {
        const { error } = await supabase
            .from('room_players')
            .insert({
                player_number,
                player_id,
                room_id
            })
        return {
            error
        }
    },
    async selectRoomPlayers({ room_id }){
        const { data, error } = await supabase
            .from('room_players')
            .select('room_id, player_id, players(player_name), player_number')
            .match({ room_id })
        if(error) return null
        return {
            data
        }
    },
    async subscribeRoomPlayers({ room_id }, handleEvents){
        const subscription = await supabase
            .from(`room_players:room_id=eq.${room_id}`)
            .on('INSERT', handleEvents)
            .on('UPDATE', handleEvents)
            .on('DELETE', handleEvents)
            .subscribe()
        return subscription
    },
    // room chats
    async sendChat({
        room_id,
        sender_id,
        content
    }) {
        await supabase
            .from('room_chats')
            .insert({
              room_id,
              sender_id,
              content
            })
    },
    async selectRoomChats({ room_id }) {
        const { data, error } = await supabase
            .from('room_chats')
            .select('id, content, sender_id, players(player_name), created_at')
            .match({ room_id })
            .order('created_at', { ascending: false })
        if(error) return null
        return data
    },
    async subscribeRoomChats({ room_id }, handleEvents) {
        const subscription = await supabase
            .from(`room_chats:room_id=eq.${room_id}`)
            .on('INSERT', handleEvents)
            .on('UPDATE', handleEvents)
            .on('DELETE', handleEvents)
            .subscribe()
        return subscription
    },

}