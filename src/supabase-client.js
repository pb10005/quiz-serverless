import { supabase } from './supabase'
import { store } from './store'

const LOG_TYPE_QUIZ_BEGIN = '01'
const LOG_TYPE_QUIZ_END = '02'
const LOG_TYPE_ROOM_CLOSED = '03'
const LOG_TYPE_ROOM_REOPENED = '04'

const insertRoomLogs = async ({room_id, type, payload}) => {
    const { error } = await supabase
        .from('room_logs')
        .insert({
            room_id,
            type,
            payload
        })
    return error
}
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
    async getProfileById(userId) {
        const { data, error } = await supabase
            .from('players')
            .select('player_name, bio')
            .match({ id: userId })
        if(error) return null
        if(data.length === 0) return null
        return {
            playerName: data[0].player_name,
            bio: data[0].bio,
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
            .select('room_id, rooms(id, title, master_id, players!rooms_master_id_fkey(player_name)), players(player_name)')
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
        const { error } = await supabase
            .from('rooms')
            .update({
                status: '1'
            })
            .match({id: room_id})
        if(!error) {
            await insertRoomLogs({
                room_id,
                type: LOG_TYPE_ROOM_CLOSED, 
                payload: ''
            })
        }
    },
    async changeRoomVisibility({ room_id, visibility }) {
        await supabase
            .from('rooms')
            .update({
                is_public: visibility
            })
            .match({id: room_id})
    },
    async reopenParticipation({ room_id }) {
        const { error } = await supabase
            .from('rooms')
            .update({
                status: '0'
            })
            .match({id: room_id})
        if(!error) {
            const { error } = await insertRoomLogs({
                room_id,
                type: LOG_TYPE_ROOM_REOPENED,
                payload: ''
            })
        }
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
            .select()
        if(error) return
        if(data[0]) {
            const { error } = await supabase
                .from('quiz_hiddens')
                .insert({
                    id: data[0].id,
                    room_id,
                    answer
                })
            await insertRoomLogs({
                room_id,
                type: LOG_TYPE_QUIZ_BEGIN,
                payload: quiz_number.toString()
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
            const quiz = await supabase
                .from('quizzes')
                .update({
                    answer: data[0].answer,
                    status: '1'
                })
                .match({ id: quiz_id })
                .select()
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
        const quiz = await supabase
            .from('quizzes')
            .update({
                status: '2'
            })
            .match({ id: quiz_id })
            .select('rooms(id), quiz_number')
        const { error } = await insertRoomLogs({
            room_id: quiz.data[0].rooms.id,
            type: LOG_TYPE_QUIZ_END,
            payload: quiz.data[0].quiz_number.toString()
        })
        if(error) {
            alert(error.message)
        }
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
    // direct messages
    async selectDirectMessages(partner_id) {
        const { data, error } = await supabase
            .from('direct_messages')
            .select('id, from_id, to_id, from_name:players!direct_messages_from_id_fkey(player_name), to_name:players!direct_messages_to_id_fkey(player_name), content, read, created_at')
            .or(`and(from_id.eq.${partner_id}, to_id.eq.${store.user.id}), and(from_id.eq.${store.user.id}, to_id.eq.${partner_id})`)
            .order('created_at', { ascending: true })
        if(error) return null
        return data
    },
    async selectAllDirectMessages() {
        const { data, error } = await supabase
            .rpc('direct_messages')
            .order('id', { ascending: true })
        if(error) return null
        return data
    },
    async countUnread() {
        const { data, error } = await supabase
            .rpc('direct_message_unread_count')
        if(error) return 0
        return data
    },
    async markAsRead(partnerId) {
        const { error } = await supabase
            .from('direct_messages')
            .update({
                'read': true
            })
            .match({'from_id': partnerId, 'to_id': store.user.id, 'read': false})
        if(error) {
            console.log('Error', error)
        }
    },
    async sendDirectMessageChat({
        from_id,
        to_id,
        content
    }) {
        await supabase
            .from('direct_messages')
            .insert({
              from_id,
              to_id,
              content
            })
    },
    async subscribeDirectMessages(handleEvents) {
        const subscription = await supabase
            .channel('direct_messages')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `from_id=eq.${store.user.id}`
                }, handleEvents)
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `to_id=eq.${store.user.id}`
                }, handleEvents)
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `from_id=eq.${store.user.id}`
                }, handleEvents)
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `to_id=eq.${store.user.id}`
                }, handleEvents)
            .on('postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `from_id=eq.${store.user.id}`
                }, handleEvents)
            .on('postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `to_id=eq.${store.user.id}`
                }, handleEvents)
            .subscribe()
        return subscription
    },
    // notifications
    async selectNotifications() {
        const { data, error } = await supabase
            .from('player_notifications')
            .select(`
                notifications(id, type, payload),
                player_id,
                created_at,
                read
            `)
            .match({'player_id': `${store.user.id}`})
        if(error) {
            return []
        }
        return data
    },
    async markNotificationAsRead(id) {
        const { error } = await supabase
            .from('player_notifications')
            .update({
                'read': true
            })
            .match({'notification_id': id, 'player_id': store.user.id, 'read': false})
        if(error) {
            console.log('Error', error)
        }
    },
    async subscribeNotifications(handleEvents) {
        const subscription = await supabase
            .channel('player_notifications')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'player_notifications',
                    filter: `player_id=eq.${store.user.id}`
                }, handleEvents)
                .on('postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'player_notifications',
                        filter: `player_id=eq.${store.user.id}`
                    }, handleEvents)
            .subscribe()
        return subscription
    },
    // room logs
    async selectRoomLogs({ room_id }) {
        const { data, error } = await supabase
            .from('room_logs')
            .select()
            .match({'room_id': room_id})
        if(error) return null
        return data
    },
    async subscribeRoomLogs(roomId, handleEvents) {
        const subscription = await supabase
            .channel('room_logs')
            .on('postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'player_notifications',
                filter: `room_id=eq.${roomId}`
            }, handleEvents)
            .subscribe()
        return subscription
    }
}