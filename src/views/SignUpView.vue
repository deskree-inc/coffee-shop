<template>
  <div id="signup">
    <loading-spinner :text="preloader.text" :show="preloader.show"></loading-spinner>
    <div class="left-side">
    </div>
    <div class="right-side">
      <form class="form">
        <h1>Sign Up</h1>
        <input-field name="full name" placeholder="Your full name" type="text" v-model="fullName"></input-field>
        <input-field name="email" placeholder="Your email" type="email" v-model="email"></input-field>
        <input-field name="password" placeholder="Your password" type="password" v-model="password"></input-field>
        <span class="error" v-if="errors.length > 0">{{errors[0].detail}}</span>
        <button-primary text="Sign up" @click="signUp"></button-primary>
        <span class="choice">Already a member? <router-link to="login">Login </router-link> instead!</span>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InputField from "@/components/InputField.vue";
import ButtonPrimary from "@/components/Button.vue";
import { client } from "@/server";
import { checkForErrors } from "@/utils";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

export default defineComponent({
  name: 'SignUpView',
  components: {ButtonPrimary, InputField, LoadingSpinner},
  data() {
    return {
      preloader: {
        text: "",
        show: false
      },
      fullName: "",
      email: "",
      password: "",
      errors: [],
    };
  },
  mounted() {
    setTimeout(() => {
      this.preloader.show = false;
    }, 5000);
  },
  methods: {
    resetLoader() {
      this.preloader.show = false;
      this.preloader.text = "";
    },
    async signUp() {
      try {
        this.preloader.show = true;
        this.preloader.text = "Creating account...";
        // Create account with email and password
        const userData = await client.post('/auth/accounts/signup', {
          email: this.email,
          password: this.password
        });

        // Update user object in the database
        const userObject = await client.patch(`/rest/collections/users/${userData.data.data.uid}`, {
          name: this.fullName
        });


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
#signup {
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