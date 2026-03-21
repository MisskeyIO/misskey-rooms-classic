<script setup lang="ts">
import { IconChevronUp, IconChevronDown, IconWalk } from "@tabler/icons-vue";

defineProps<{
  floor: number;
}>();

const emit = defineEmits<{
  changeFloor: [delta: number];
}>();
</script>

<template>
  <div class="floor-nav">
    <button class="floor-btn" @click="emit('changeFloor', 1)">
      <IconChevronUp :size="20" />
    </button>
    <div class="floor-display">
      <span class="floor-number">{{ floor }}</span>
      <span class="floor-label">F</span>
    </div>
    <button class="floor-btn avatar-btn" @click="emit('changeFloor', 0 - floor)">
      <IconWalk :size="18" />
    </button>
    <button class="floor-btn" @click="emit('changeFloor', -1)">
      <IconChevronDown :size="20" />
    </button>
  </div>
</template>

<style scoped>
.floor-nav {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 10;
  background: rgba(80, 20, 20, 0.82);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 52px;
}

.floor-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.floor-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.avatar-btn {
  font-size: 14px;
}

.floor-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
  color: #fff;
  padding: 2px 0;
}

.floor-number {
  font-size: 16px;
  font-weight: bold;
}

.floor-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}
</style>
