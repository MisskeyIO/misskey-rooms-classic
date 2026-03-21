<script setup lang="ts">
defineProps<{
  variant?: "default" | "primary" | "success" | "danger";
  disabled?: boolean;
  href?: string;
  active?: boolean;
}>();
</script>

<template>
  <a v-if="href" :href="href" class="btn" :class="[variant ?? 'default', { active }]">
    <slot />
  </a>
  <button v-else class="btn" :class="[variant ?? 'default', { active }]" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--button-bg);
  border: 1px solid var(--button-border);
  color: var(--button-fg);
  border-radius: 6px;
  padding: 7px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
  box-shadow: 0 1px 2px var(--button-shadow);
  transition:
    background 0.15s,
    box-shadow 0.15s,
    transform 0.15s,
    border-color 0.15s,
    color 0.15s;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  background: var(--button-bg-hover);
  box-shadow: 0 3px 10px var(--button-shadow-hover);
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn.active {
  background: var(--surface-soft-active);
  box-shadow: inset 0 0 0 1px var(--surface-soft-ring);
}

.btn.primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-fg);
  border-color: transparent;
  box-shadow: 0 2px 8px var(--button-primary-shadow);
}

.btn.primary:hover:not(:disabled) {
  background: var(--button-primary-bg-hover);
}

.btn.success {
  background: var(--button-success-bg);
  color: var(--button-success-fg);
  border-color: transparent;
}

.btn.success:hover:not(:disabled) {
  background: var(--button-success-bg-hover);
}

.btn.danger {
  background: var(--button-danger-bg);
  color: var(--button-danger-fg);
  border-color: transparent;
}

.btn.danger:hover:not(:disabled) {
  background: var(--button-danger-bg-hover);
}
</style>
