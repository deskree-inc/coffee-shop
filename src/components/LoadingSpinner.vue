<template>
  <div class="backdrop" v-show="show">
    <div class="content">
      <div class="animation">
        <lottie-animation path="lottie/spinner.json" />
      </div>
      <p>{{ text }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LottieAnimation from "lottie-vuejs/src/LottieAnimation.vue";

export default defineComponent({
  name: "LoadingSpinner",
  components: {
    LottieAnimation,
  },
  props: {
    text: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped lang="scss">
.backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(20, 20, 20, 0.8);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .content {
    max-width: 250px;
    font: normal normal 600 14px/14px Open Sans;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    .animation {
      max-width: 150px;
      width: 100%;
      margin-bottom: 20px;
    }
  }
}
</style>
