<script setup lang="ts">
import { ref, useTemplateRef, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoom } from "./composables/useRoom.ts";
import { useDialog } from "./composables/useDialog.ts";
import FurniturePanel from "./components/FurniturePanel.vue";
import RoomSettingsPanel from "./components/RoomSettingsPanel.vue";
import FurniturePicker from "./components/FurniturePicker.vue";
import FloorNav from "./components/FloorNav.vue";
import LoginPanel from "./components/LoginPanel.vue";
import ToastNotification from "./components/ToastNotification.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";

const roomContainer = useTemplateRef<HTMLDivElement>("roomContainer");

const { toasts, confirmState, showToast, removeToast, showConfirm, confirmDialog } = useDialog();

// iframe検出
const isIframe = computed(() => {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
});

const {
  floor,
  roomType,
  carpetColor,
  objectSelected,
  selectedFurnitureName,
  selectedFurnitureProps,
  selectedFurnitureDef,
  isTranslateMode,
  isRotateMode,
  isMyRoom,
  loadRoom,
  handleSave,
  addFurniture,
  translate,
  rotate,
  exitTransform,
  removeFurniture,
  clearAll,
  updateProp,
  changeFloor,
  destroy,
} = useRoom(roomContainer, { showToast, showConfirm });

const pickerState = ref<"closed" | "loading" | "open">("closed");

function openPicker() {
  pickerState.value = "open";
}

function togglePicker() {
  if (pickerState.value === "closed") {
    openPicker();
  } else {
    pickerState.value = "closed";
  }
}

function onPickerAdd(id: string) {
  addFurniture(id);
  pickerState.value = "closed";
}

onMounted(() => loadRoom());
onBeforeUnmount(() => destroy());
</script>

<template>
  <div class="room-app" :class="{ 'is-iframe': isIframe }">
    <div ref="roomContainer" class="room-container" />

    <LoginPanel />

    <Transition name="slide-left">
      <FurniturePanel
        v-if="objectSelected && isMyRoom"
        :furniture-name="selectedFurnitureName"
        :furniture-def="selectedFurnitureDef"
        :furniture-props="selectedFurnitureProps"
        :is-translate-mode="isTranslateMode"
        :is-rotate-mode="isRotateMode"
        @translate="translate"
        @rotate="rotate"
        @exit-transform="exitTransform"
        @remove-furniture="removeFurniture"
        @update-prop="updateProp"
      />
    </Transition>

    <RoomSettingsPanel
      v-if="isMyRoom"
      v-model:room-type="roomType"
      v-model:carpet-color="carpetColor"
      :picker-open="pickerState !== 'closed'"
      @toggle-picker="togglePicker"
      @save="handleSave"
      @clear-all="clearAll"
    />

    <FurniturePicker :state="pickerState" @close="pickerState = 'closed'" @add="onPickerAdd" />

    <FloorNav :floor="floor" @change-floor="changeFloor" />

    <ToastNotification
      v-for="toast in toasts"
      :key="toast.id"
      :toast="toast"
      @close="removeToast"
    />

    <ConfirmDialog :state="confirmState" @confirm="confirmDialog" />
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.room-app {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.room-container {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.room-container :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

/* iframe表示用のスタイル調整 */
.room-app.is-iframe {
  /* 親ページの余白を除去 */
  position: fixed;
  inset: 0;
}

.room-app.is-iframe .room-container :deep(canvas) {
  /* iframe内でより鮮明に表示 */
  image-rendering: auto;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
