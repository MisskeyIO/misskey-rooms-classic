<script setup lang="ts">
import { IconChevronUp, IconChevronDown, IconWalk } from "@tabler/icons-vue";
import IconButton from "./IconButton.vue";

defineProps<{
  floor: number;
}>();

const emit = defineEmits<{
  changeFloor: [delta: number];
}>();
</script>

<template>
  <div class="floor-nav">
    <IconButton @click="emit('changeFloor', 1)">
      <IconChevronUp :size="20" />
    </IconButton>
    <div class="floor-display">
      <span class="floor-number">{{ floor }}</span>
      <span class="floor-label">F</span>
    </div>
    <IconButton @click="emit('changeFloor', 0 - floor)">
      <IconWalk :size="18" />
    </IconButton>
    <IconButton @click="emit('changeFloor', -1)">
      <IconChevronDown :size="20" />
    </IconButton>
  </div>
</template>

<style scoped>
.floor-nav {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 10;
  background: var(--panel-bg);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 52px;
}

.floor-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
  color: var(--app-fg-strong);
  padding: 2px 0;
}

.floor-number {
  font-size: 16px;
  font-weight: bold;
}

.floor-label {
  font-size: 11px;
  color: var(--app-fg-muted);
}
</style>
