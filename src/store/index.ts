import { createStore } from 'vuex'

export default createStore({
  state() {
    return {
      user: {}
    }
  },
  getters: {
    user(state: any) {
      const data: string | null = localStorage.getItem("user");
      return data ? JSON.parse(data) : state.user;
    }
  },
  mutations: {
    saveUser(state, user) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    logout(state) {
      state.user = {};
      localStorage.removeItem("user");
    }
  },
});
