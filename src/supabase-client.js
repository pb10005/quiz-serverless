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
        const { error } = await supabase.auth.signInWithPassword({
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
    async resetPassword(password) {
        const { user, error } = await supabase.auth.update({
            password
          })
        return {
            user,
            error
        }
    },
    // profile
    async upsertProfile({ id, player_name, bio }) {
        const { error } = await supabase
            .from('players')
            .upsert({
                id,
                player_name,
                bio
            })
        return {
            error
        }
    },
    async getProfile() {
        const { data, error } = await supabase
            .from('players')
            .select('player_name, bio')
            .match({ id: store.user?.id })
        if(error) return null
        if(data.length === 0) return null
        return {
            playerName: data[0].player_name,
            bio: data[0].bio,
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
    async selectParticipatingRooms() {
        if(!store.user) {
            return {
                data: []
            }
        }
        const { data, error } = await supabase
            .from('room_players')
            .select('room_id, rooms(id, title, players!rooms_master_id_fkey(player_name)), players(player_name)')
            .match({ player_id: store.user?.id })
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
            .channel('rooms')
            .on('postgres_changes',
                {
                  event: 'INSERT',
                  schema: 'public',
                  table: 'rooms',
                },
                handleEvents)
            .on('postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'rooms',
            }, handleEvents)
            .on('postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'rooms',
            }, handleEvents)
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
    async addHint({
        quiz_id,
        hint
    }) {
        await supabase
            .from('quizzes')
            .update({
                hint
            })
            .match({ id: quiz_id })
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
    async getQuizHistories({
        room_id
    }) {
        const { data, error } = await supabase
            .from('quizzes')
            .select()
            .match({room_id, status: '2'})
            .order('quiz_number', { ascending: true })
        if(error) return null
        return data.map(d => {
            return {
                id: d.id,
                roomId: d.room_id,
                quizNumber: d.quiz_number,
                question: d.question,
                answer: d.answer,
                hint: d.hint
            }
        })
    },
    async subscribeQuizzes({ room_id }, handleEvents) {
        const subscription = await supabase
            .channel('quizzes')
            .on('postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'quizzes',
              filter: `room_id=eq.${room_id}`
            }, handleEvents)
            .on('postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'quizzes',
              filter: `room_id=eq.${room_id}`
            }, handleEvents)
            .on('postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'quizzes',
              filter: `room_id=eq.${room_id}`
            }, handleEvents)
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
            .channel('room_players')
            .on('postgres_changes',
                {
                event: 'INSERT',
                schema: 'public',
                table: 'room_players',
                filter: `room_id=eq.${room_id}`
                }, handleEvents)
            .on('postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'room_players',
              filter: `room_id=eq.${room_id}`
            }, handleEvents)
            .on('postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'room_players',
              filter: `room_id=eq.${room_id}`
            }, handleEvents)
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
    async updateChat({ chat_id, content }) {
        await supabase
            .from('room_chats')
            .update({
                'content': content
            })
            .match({'id': chat_id})
    },
    async selectRoomChats({ room_id }) {
        const { data, error } = await supabase
            .from('room_chats')
            .select('id, content, sender_id, players(player_name), created_at')
            .match({ room_id })
            .order('created_at', { ascending: true })
        if(error) return null
        return data
    },
    async subscribeRoomChats({ room_id }, handleEvents) {
        const subscription = await supabase
            .channel('room_chats')
            .on('postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'room_chats',
              filter: `room_id=eq.${room_id}`
            }, handleEvents)
            .on('postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'room_chats',
              filter: `room_id=eq.${room_id}`
            }, handleEvents)
            .on('postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'room_chats',
              filter: `room_id=eq.${room_id}`
            }, handleEvents)
            .subscribe()
        return subscription
    },

}