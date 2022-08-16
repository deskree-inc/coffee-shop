<template>
  <div class="input-wrapper">
    <label>{{name}}</label>
    <input :placeholder="placeholder" :type="type" @input="$emit('update:modelValue', $event.target.value)" v-model="input" :name="name">
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import {defineComponent} from "vue";

export default defineComponent({
  name: "InputField",
  setup() {
    const input = ref("");
    return { input };
  },
  props: {
    name: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: false
    },
    type: {
      type: String,
      default: "text"
    }
  },
})
</script>

<style lang="scss" scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
  width: 100%;
  label {
    display: block;
    margin-bottom: 12px;
    color: rgba(29, 31, 46, 0.6);
    font-size: 12px;
    line-height: 18px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  input {
    width: calc(100% - 36px);
    display: block;
    margin-bottom: 20px;
    padding: 18px 24px;
    border: 1px solid #e5e5e7;
    border-radius: 0;
    -webkit-transition: border 400ms ease, color 400ms ease;
    transition: border 400ms ease, color 400ms ease;
    font-size: 12px;
    line-height: 18px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
  }
}
</style>