<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import type { ToastMessage } from "../composables/useDialog.ts";

const props = defineProps<{
  toast: ToastMessage;
}>();

const emit = defineEmits<{
  (e: "close", id: string): void;
}>();

const isVisible = ref(false);

watch(
  () => props.toast,
  async () => {
    await nextTick();
    requestAnimationFrame(() => {
      isVisible.value = true;
    });
  },
  { immediate: true },
);

function handleClose() {
  isVisible.value = false;
  setTimeout(() => {
    emit("close", props.toast.id);
  }, 200);
}
</script>

<template>
  <div
    class="toast-notification"
    :class="[`type-${toast.type}`, { visible: isVisible }]"
    role="status"
    aria-live="polite"
    @click="handleClose"
  >
    <div class="toast-content">
      <span class="toast-message">{{ toast.message }}</span>
    </div>
  </div>
</template>
