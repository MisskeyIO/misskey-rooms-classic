<script setup lang="ts">
defineProps<{ label?: string }>();
</script>

<template>
  <div class="loading-spinner">
    <div class="spinner" />
    <span v-if="label">{{ label }}</span>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--app-fg-muted);
  font-size: 13px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--spinner-track);
  border-top-color: var(--spinner-head);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
