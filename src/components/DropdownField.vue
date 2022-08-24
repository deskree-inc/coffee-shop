<template>
  <div class="dropdown-wrapper">
    <label :for="name">{{name}}</label>
    <select :name="name" :id="name" v-model="input" @change="$emit('update:modelValue', $event.target.value)">
      <option :value="option.value" v-for="option in options" :key="option.value">{{ option.name }}</option>
    </select>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';

export default defineComponent({
  name: "DropdownField",
  setup() {
    const input = ref("");
    return { input };
  },
  props: {
    name: {
      type: String,
      required: true
    },
    options:{
      type: Array,
      required: true
    }
  },
})
</script>

<style lang="scss" scoped>
.dropdown-wrapper {
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
  select {
    width: calc(100% + 16px);
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
    cursor: pointer;
  }
}
</style>