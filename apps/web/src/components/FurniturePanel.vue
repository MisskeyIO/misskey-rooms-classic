<script setup lang="ts">
import type { furnitureDefs } from "@misskey-rooms/shared";
import FurniturePreview from "./FurniturePreview.vue";
import { IconArrowsMove, IconRotate, IconPackage } from "@tabler/icons-vue";
import BaseButton from "./BaseButton.vue";

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
      <BaseButton class="action-button" :active="isTranslateMode" @click="emit('translate')">
        <IconArrowsMove :size="15" /> 移動
      </BaseButton>
      <BaseButton class="action-button" :active="isRotateMode" @click="emit('rotate')">
        <IconRotate :size="15" /> 回転
      </BaseButton>
      <BaseButton
        v-if="isTranslateMode || isRotateMode"
        class="action-button"
        variant="success"
        @click="emit('exitTransform')"
      >
        完了
      </BaseButton>
      <BaseButton class="action-button" variant="danger" @click="emit('removeFurniture')">
        <IconPackage :size="15" /> しまう
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.panel-left {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  background: var(--panel-bg);
  backdrop-filter: blur(6px);
  padding: 12px;
  width: 200px;
  color: var(--app-fg-strong);
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
  background: var(--preview-bg);
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
  color: var(--app-fg-muted);
  margin-bottom: 3px;
}

.prop-item input[type="color"] {
  width: 100%;
  height: 30px;
  border: 1px solid var(--button-border);
  border-radius: 6px;
  background: var(--input-bg);
  cursor: pointer;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.action-button {
  width: 100%;
  justify-content: center;
}
</style>
