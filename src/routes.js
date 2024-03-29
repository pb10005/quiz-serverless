import Home from './views/Home.vue'
import NotFound from './views/NotFound.vue'
import QuizMaster from './views/quiz/Master.vue'
import QuizPlay from './views/quiz/Play.vue'
import PlayWithAI from './views/quiz/PlayWithAI.vue'
import Login from './views/Login.vue'
import Profile from './views/Profile.vue'
import ResetPassword from './views/ResetPassword.vue'
import User from './views/User.vue'
import DirectMessage from './views/DirectMessage.vue'
import SignUp from './views/SignUp.vue'

/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
  { path: '/', component: Home, meta: { title: 'Home' } },
  { path: '/login', component: Login },
  { path: '/signup', component: SignUp },
  { path: '/profile', component: Profile },
  { path: '/quiz/master/:id', component: QuizMaster },
  { path: '/quiz/play/:id', component: QuizPlay },
  { path: '/quiz/play-with-ai', component: PlayWithAI },
  { path: '/reset-password', component: ResetPassword},
  { path: '/user/:id', component: User },
  { path: '/direct-message/', component: DirectMessage },
  { path: '/direct-message/:id', component: DirectMessage },
  { path: '/:path(.*)', component: NotFound }
]
