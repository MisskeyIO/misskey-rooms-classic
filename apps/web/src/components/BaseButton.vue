<script setup lang="ts">
defineProps<{
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
  href?: string;
}>();
</script>

<template>
  <a v-if="href" :href="href" class="btn" :class="variant ?? 'default'">
    <slot />
  </a>
  <button v-else class="btn" :class="variant ?? 'default'" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.12);
  border: none;
  color: white;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 13px;
  text-decoration: none;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.primary {
  background: rgba(134, 201, 232, 0.25);
}

.btn.primary:hover:not(:disabled) {
  background: rgba(134, 201, 232, 0.4);
}

.btn.danger {
  background: rgba(248, 113, 113, 0.2);
}

.btn.danger:hover:not(:disabled) {
  background: rgba(248, 113, 113, 0.35);
}
</style>
