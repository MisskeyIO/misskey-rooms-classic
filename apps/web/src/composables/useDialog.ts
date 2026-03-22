import { ref, reactive } from "vue";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error";
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  resolve: ((value: boolean) => void) | null;
}

const toasts = ref<ToastMessage[]>([]);

const confirmState = reactive<ConfirmDialogState>({
  isOpen: false,
  title: "確認",
  message: "",
  confirmText: "OK",
  cancelText: "キャンセル",
  resolve: null,
});

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function useDialog() {
  function showToast(message: string, type: "success" | "error" = "success") {
    const id = generateId();
    toasts.value.push({ id, message, type });

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  }

  function showConfirm(
    message: string,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
    },
  ): Promise<boolean> {
    return new Promise((resolve) => {
      confirmState.title = options?.title ?? "確認";
      confirmState.message = message;
      confirmState.confirmText = options?.confirmText ?? "OK";
      confirmState.cancelText = options?.cancelText ?? "キャンセル";
      confirmState.resolve = resolve;
      confirmState.isOpen = true;
    });
  }

  function confirmDialog(result: boolean) {
    if (confirmState.resolve) {
      confirmState.resolve(result);
      confirmState.resolve = null;
    }
    confirmState.isOpen = false;
  }

  return {
    toasts,
    confirmState,
    showToast,
    removeToast,
    showConfirm,
    confirmDialog,
  };
}
