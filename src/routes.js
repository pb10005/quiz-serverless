import Home from './views/Home.vue'
import NotFound from './views/NotFound.vue'
import QuizMaster from './views/quiz/Master.vue'
import QuizPlay from './views/quiz/Play.vue'
import Login from './views/Login.vue'
import Profile from './views/Profile.vue'

/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
  { path: '/', component: Home, meta: { title: 'Home' } },
  { path: '/login', component: Login },
  { path: '/profile', component: Profile },
  { path: '/quiz/master/:id', component: QuizMaster },
  { path: '/quiz/play/:id', component: QuizPlay },
  { path: '/:path(.*)', component: NotFound }
]
