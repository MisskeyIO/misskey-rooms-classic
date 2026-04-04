<script setup lang="ts">
import { furnitureDefs } from "@misskey-rooms/shared";
import LoadingSpinner from "./LoadingSpinner.vue";

defineProps<{
  state: "closed" | "loading" | "open";
}>();

const emit = defineEmits<{
  close: [];
  add: [id: string];
}>();
</script>

<template>
  <Transition name="fade">
    <div v-if="state !== 'closed'" class="furniture-picker-overlay" @click.self="emit('close')">
      <div class="furniture-picker">
        <div class="picker-header">家具を選ぶ</div>

        <div v-if="state === 'loading'" class="picker-loading">
          <LoadingSpinner label="読み込み中..." />
        </div>

        <div v-else class="picker-grid">
          <button
            v-for="f in furnitureDefs"
            :key="f.id"
            class="picker-item"
            @click="emit('add', f.id)"
          >
            <div class="picker-preview">
              <img
                :src="`/room/furnitures/${f.id}/thumbnail.png`"
                :alt="f.name"
                class="preview-image"
                loading="lazy"
                draggable="false"
              />
            </div>
            <span>{{ f.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.furniture-picker-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.furniture-picker {
  background: var(--panel-bg-strong);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  width: 560px;
  max-width: 90vw;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.picker-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: bold;
  color: var(--app-fg-strong);
  border-bottom: 1px solid var(--panel-border);
}

.picker-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px;
  overflow-y: auto;
}

.picker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  border: 1px solid var(--button-border);
  border-radius: 6px;
  background: var(--button-bg);
  color: var(--button-fg);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 1px 2px var(--button-shadow);
  transition:
    background 0.15s,
    box-shadow 0.15s,
    transform 0.15s;
  text-align: center;
}

.picker-item:hover {
  background: var(--button-bg-hover);
  box-shadow: 0 3px 10px var(--button-shadow-hover);
  transform: translateY(-1px);
}

.picker-preview {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--preview-bg);
  pointer-events: none;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
