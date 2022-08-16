<template>
  <div id="login">
    <loading-spinner :text="preloader.text" :show="preloader.show"></loading-spinner>
    <div class="left-side">
    </div>
    <div class="right-side">
      <div class="form">
        <h1>Login</h1>
        <input-field name="email" placeholder="Your email" type="email" v-model="email"></input-field>
        <input-field name="password" placeholder="Your password" type="password" v-model="password"></input-field>
        <span class="error" v-if="errors.length > 0">{{ errors[0].detail }}</span>
        <button-primary text="Login" @click="login"></button-primary>
        <span class="choice">Not registered yet? <router-link to="sign-up">Sign Up</router-link> instead!</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import InputField from "@/components/InputField.vue";
import ButtonPrimary from "@/components/Button.vue";
import {client} from "@/server";
import {checkForErrors} from "@/utils";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

export default defineComponent({
  name: 'LoginView',
  components: {ButtonPrimary, InputField, LoadingSpinner},
  data() {
    return {
      preloader: {
        text: "",
        show: false
      },
      email: "",
      password: "",
      errors: [],
    };
  },
  methods: {
    resetLoader() {
      this.preloader.show = false;
      this.preloader.text = "";
    },
    async login() {
      try {
        this.preloader.show = true;
        this.preloader.text = "Logging in...";
        const userData = await client.post('/auth/accounts/sign-in/email', {
          email: this.email,
          password: this.password
        });
        const userObject = await client.get(`/rest/collections/users/${userData.data.data.uid}`);
        this.$store.commit('saveUser', {
          uid: userData.data.data.uid,
          name: userObject.data.data.name,
          email:  userData.data.data.email,
          roles:  userObject.data.data.roles,
          token:  userData.data.data.idToken,
          refreshToken:  userData.data.data.refreshToken,
        });
        this.resetLoader();
        this.$router.push("/dashboard");
      } catch (e: any) {
        this.resetLoader();
        console.error(e)
        if (checkForErrors(e.response)) {
          this.errors = e.response.data.errors;
        }
      }
    }
  }
});
</script>


<style lang="scss" scoped>
#login {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: row;

  .left-side, .right-side {
    width: 50%;
    height: 100vh;
  }

  .left-side {
    background-image: url('~@/assets/coffee-background.jpg');
    background-position: center;
    background-size: cover;
  }

  .right-side {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px;
    border-style: solid;
    border-width: 1px;
    border-color: rgba(210, 210, 213, 0.5);
    background-color: #fff;
    width: 80%;

    .choice {
      font-size: 16px;
      line-height: 30px;
      text-align: center;
    }

    .error {
      color: #a25f4b;
      margin: 20px;
    }
  }
}
</style>