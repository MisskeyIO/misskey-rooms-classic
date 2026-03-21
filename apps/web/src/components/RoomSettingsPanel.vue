<script setup lang="ts">
import { IconArmchair, IconDeviceFloppy, IconTrash } from "@tabler/icons-vue";
import BaseButton from "./BaseButton.vue";

defineProps<{
  pickerOpen: boolean;
}>();

const roomType = defineModel<string>("roomType", { required: true });
const carpetColor = defineModel<string>("carpetColor", { required: true });

const emit = defineEmits<{
  togglePicker: [];
  save: [];
  clearAll: [];
}>();
</script>

<template>
  <div class="panel-right">
    <BaseButton class="panel-button" @click="emit('togglePicker')">
      <IconArmchair :size="16" /> 家具を置く
    </BaseButton>

    <div class="room-settings">
      <label class="setting-label">
        <span>部屋のタイプ</span>
        <select v-model="roomType">
          <option value="default">デフォルト</option>
          <option value="washitsu">和室</option>
        </select>
      </label>

      <label v-if="roomType === 'default'" class="setting-label setting-color">
        <span>床の色</span>
        <input v-model="carpetColor" type="color" />
      </label>
    </div>

    <BaseButton class="panel-button" @click="emit('save')">
      <IconDeviceFloppy :size="16" /> 保存
    </BaseButton>
    <BaseButton class="panel-button" variant="danger" @click="emit('clearAll')">
      <IconTrash :size="16" /> 片付け
    </BaseButton>
  </div>
</template>

<style scoped>
.panel-right {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  background: var(--panel-bg);
  backdrop-filter: blur(6px);
  padding: 12px;
  width: 200px;
  color: var(--app-fg-strong);
  font-size: 13px;
  border-radius: 0 0 0 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-button {
  width: 100%;
  justify-content: center;
}

.room-settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px 0;
  border-top: 1px solid var(--panel-border);
  border-bottom: 1px solid var(--panel-border);
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: var(--app-fg-muted);
}

.setting-label select {
  width: 100%;
  padding: 7px 8px;
  border-radius: 6px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--app-fg-strong);
  font-size: 13px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.03);
}

.setting-color {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.setting-color input[type="color"] {
  width: 48px;
  height: 30px;
  border: 1px solid var(--button-border);
  border-radius: 6px;
  background: var(--input-bg);
  cursor: pointer;
}
</style>
