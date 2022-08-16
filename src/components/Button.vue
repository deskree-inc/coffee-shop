<template>
  <button :type="type">{{text}}</button>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "ButtonPrimary",
  props: {
    text: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: "button"
    }
  }
})
</script>

<style lang="scss" scoped>
button {
  position: relative;
  z-index: 50;
  display: inline-block;
  padding: 18px 24px;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  border-radius: 0;
  background-color: #1d1f2e;
  box-shadow: none;
  -webkit-transition: background-color 400ms ease, opacity 400ms ease, box-shadow 400ms ease;
  transition: background-color 400ms ease, opacity 400ms ease, box-shadow 400ms ease;
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 2px;
  text-decoration: none;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  margin-bottom: 20px;
  width: fit-content;
}
</style>