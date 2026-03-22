<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import type { ConfirmDialogState } from "../composables/useDialog.ts";

const props = defineProps<{
  state: ConfirmDialogState;
}>();

const emit = defineEmits<{
  (e: "confirm", result: boolean): void;
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

watch(
  () => props.state.isOpen,
  async (isOpen) => {
    await nextTick();
    if (dialogRef.value) {
      if (isOpen) {
        dialogRef.value.showModal();
      } else {
        dialogRef.value.close();
      }
    }
  },
);

function handleConfirm() {
  emit("confirm", true);
}

function handleCancel() {
  emit("confirm", false);
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === dialogRef.value) {
    handleCancel();
  }
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="confirm-dialog"
    @click="handleBackdropClick"
    @cancel="handleCancel"
  >
    <div class="confirm-content">
      <h3 class="confirm-title">{{ state.title }}</h3>
      <p class="confirm-message">{{ state.message }}</p>
      <div class="confirm-actions">
        <button type="button" class="confirm-btn confirm-btn-cancel" @click="handleCancel">
          {{ state.cancelText }}
        </button>
        <button type="button" class="confirm-btn confirm-btn-confirm" @click="handleConfirm">
          {{ state.confirmText }}
        </button>
      </div>
    </div>
  </dialog>
</template>
