<script setup lang="ts">
import { ref, useTemplateRef, onMounted, onBeforeUnmount } from "vue";
import { useRoom } from "./composables/useRoom.ts";
import FurniturePanel from "./components/FurniturePanel.vue";
import RoomSettingsPanel from "./components/RoomSettingsPanel.vue";
import FurniturePicker from "./components/FurniturePicker.vue";
import FloorNav from "./components/FloorNav.vue";

const roomContainer = useTemplateRef<HTMLDivElement>("roomContainer");

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
} = useRoom(roomContainer);

const pickerState = ref<"closed" | "loading" | "open">("closed");

function openPicker() {
  pickerState.value = "loading";
  setTimeout(() => {
    pickerState.value = "open";
  }, 600);
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
  <div class="room-app">
    <div ref="roomContainer" class="room-container" />

    <Transition name="slide-left">
      <FurniturePanel
        v-if="objectSelected"
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
      v-model:room-type="roomType"
      v-model:carpet-color="carpetColor"
      :picker-open="pickerState !== 'closed'"
      @toggle-picker="togglePicker"
      @save="handleSave"
      @clear-all="clearAll"
    />

    <FurniturePicker :state="pickerState" @close="pickerState = 'closed'" @add="onPickerAdd" />

    <FloorNav :floor="floor" @change-floor="changeFloor" />
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
