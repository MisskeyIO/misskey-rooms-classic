<script setup lang="ts">
import { IconArmchair, IconDeviceFloppy, IconTrash } from "@tabler/icons-vue";

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
    <button class="add-btn" @click="emit('togglePicker')">
      <IconArmchair :size="16" /> 家具を置く
    </button>

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

    <button class="save-btn" @click="emit('save')"><IconDeviceFloppy :size="16" /> 保存</button>
    <button class="clear-btn" @click="emit('clearAll')"><IconTrash :size="16" /> 片付け</button>
  </div>
</template>

<style scoped>
.panel-right {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  background: rgba(80, 20, 20, 0.82);
  backdrop-filter: blur(6px);
  padding: 12px;
  width: 200px;
  color: #fff;
  font-size: 13px;
  border-radius: 0 0 0 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-btn {
  width: 100%;
  padding: 9px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  transition: background 0.15s;
}
.add-btn:hover {
  background: rgba(255, 255, 255, 0.22);
}

.room-settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.setting-label select {
  width: 100%;
  padding: 5px 6px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 13px;
}

.setting-color {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.setting-color input[type="color"] {
  width: 48px;
  height: 26px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.save-btn,
.clear-btn {
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
.save-btn:hover {
  background: rgba(255, 255, 255, 0.22);
}
.clear-btn:hover {
  background: rgba(180, 40, 40, 0.5);
}
</style>
