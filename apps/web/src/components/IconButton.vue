<script setup lang="ts">
import BaseButton from "./BaseButton.vue";
</script>

<template>
  <BaseButton class="icon-btn">
    <slot />
  </BaseButton>
</template>

<style scoped>
.icon-btn {
  width: 36px;
  height: 36px;
  padding: 0;
}
</style>
