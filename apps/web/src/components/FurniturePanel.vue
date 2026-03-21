<script setup lang="ts">
import type { furnitureDefs } from "@misskey-rooms/shared";
import FurniturePreview from "./FurniturePreview.vue";
import { IconArrowsMove, IconRotate, IconPackage } from "@tabler/icons-vue";

defineProps<{
  furnitureName: string;
  furnitureDef: (typeof furnitureDefs)[number] | null;
  furnitureProps: Record<string, string> | null;
  isTranslateMode: boolean;
  isRotateMode: boolean;
}>();

const emit = defineEmits<{
  translate: [];
  rotate: [];
  exitTransform: [];
  removeFurniture: [];
  updateProp: [key: string, value: string];
}>();
</script>

<template>
  <div class="panel panel-left">
    <div class="furniture-header">
      {{ furnitureDef?.name ?? furnitureName }}
    </div>
    <div class="furniture-preview">
      <FurniturePreview :furniture-id="furnitureName" />
    </div>

    <template v-if="furnitureDef?.props">
      <div v-for="(propType, key) in furnitureDef.props" :key="key" class="prop-item">
        <label>{{ key }}</label>
        <input
          v-if="propType === 'color'"
          type="color"
          :value="furnitureProps?.[key as string] ?? '#ffffff'"
          @change="emit('updateProp', key as string, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </template>

    <div class="action-buttons">
      <button :class="{ active: isTranslateMode }" @click="emit('translate')">
        <IconArrowsMove :size="15" /> 移動
      </button>
      <button :class="{ active: isRotateMode }" @click="emit('rotate')">
        <IconRotate :size="15" /> 回転
      </button>
      <button
        v-if="isTranslateMode || isRotateMode"
        class="done-btn"
        @click="emit('exitTransform')"
      >
        完了
      </button>
      <button class="remove-btn" @click="emit('removeFurniture')">
        <IconPackage :size="15" /> しまう
      </button>
    </div>
  </div>
</template>

<style scoped>
.panel-left {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  background: rgba(80, 20, 20, 0.82);
  backdrop-filter: blur(6px);
  padding: 12px;
  width: 200px;
  color: #fff;
  font-size: 13px;
  border-radius: 0 0 8px 0;
}

.furniture-header {
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 8px;
}

.furniture-preview {
  width: 100%;
  aspect-ratio: 1;
  background: #000;
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.prop-item {
  margin-bottom: 8px;
}

.prop-item label {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 3px;
}

.prop-item input[type="color"] {
  width: 100%;
  height: 28px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.action-buttons button {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  text-align: center;
  transition: background 0.15s;
}

.action-buttons button:hover {
  background: rgba(255, 255, 255, 0.22);
}

.action-buttons button.active {
  background: rgba(255, 255, 255, 0.28);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

.done-btn {
  background: rgba(46, 204, 113, 0.4) !important;
}
.done-btn:hover {
  background: rgba(46, 204, 113, 0.6) !important;
}

.remove-btn {
  background: rgba(180, 40, 40, 0.5) !important;
}
.remove-btn:hover {
  background: rgba(180, 40, 40, 0.75) !important;
}
</style>
