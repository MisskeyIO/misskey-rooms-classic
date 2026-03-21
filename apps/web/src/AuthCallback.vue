<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuth } from "./composables/useAuth.ts";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import BaseButton from "./components/BaseButton.vue";

const { handleJwtCallback } = useAuth();
const status = ref<"processing" | "error">("processing");

onMounted(async () => {
  const params = new URLSearchParams(location.search);
  const jwt = params.get("jwt");
  const returnTo = params.get("return_to") ?? "/";

  if (jwt) {
    const ok = await handleJwtCallback(jwt);
    if (ok) {
      location.replace(returnTo);
      return;
    }
  }

  status.value = "error";
});
</script>

<template>
  <div class="callback-page">
    <template v-if="status === 'processing'">
      <LoadingSpinner label="認証中..." />
    </template>
    <template v-else>
      <p class="error">認証に失敗しました。</p>
      <BaseButton href="/">トップへ戻る</BaseButton>
    </template>
  </div>
</template>

<style scoped>
.callback-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
  color: var(--app-fg-strong);
  background: var(--app-bg);
  font-size: 15px;
}

.error {
  color: var(--error);
}
</style>
