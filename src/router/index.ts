import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import SignUpView from "@/views/SignUpView.vue";
import DashboardView from "@/views/DashboardView.vue";
import store from "@/store";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/sign-up',
    name: 'signup',
    component: SignUpView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from) => {
  const user = await store.getters["user"];
  const isAuthenticated = Object.prototype.hasOwnProperty.call(user, "token");
  if (!isAuthenticated && to.name !== 'login' && to.name !== 'signup') {
    // redirect the user to the login page
    return { name: 'login' }
  }
})

export default router
