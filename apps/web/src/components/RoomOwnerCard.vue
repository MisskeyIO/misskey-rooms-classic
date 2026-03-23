<script setup lang="ts">
import { ref, watch } from "vue";
import { orpc } from "../composables/useApi.ts";

const props = defineProps<{
  userId: string | null;
}>();

interface UserInfo {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

const userInfo = ref<UserInfo | null>(null);

async function fetchUserInfo(userId: string) {
  try {
    userInfo.value = await orpc.getUserInfo({ userId });
  } catch (e) {
    console.error("Failed to fetch user info:", e);
    userInfo.value = null;
  }
}

watch(
  () => props.userId,
  (newUserId) => {
    if (newUserId) {
      void fetchUserInfo(newUserId);
    } else {
      userInfo.value = null;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="userId" class="room-owner-card">
    <div class="owner-content">
      <img v-if="userInfo?.avatarUrl" :src="userInfo.avatarUrl" class="owner-avatar" />
      <span class="owner-name">{{ userInfo?.name ?? userId }}</span>
      <span class="room-label">の部屋</span>
    </div>
  </div>
</template>

<style scoped>
.room-owner-card {
  position: absolute;
  top: 64px;
  right: 12px;
  background: var(--panel-bg);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 12px 16px;
  z-index: 90;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 10vw;
}

.owner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.owner-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.owner-name {
  font-weight: 600;
  color: var(--app-fg-strong);
  font-size: 14px;
  text-align: center;
  word-break: break-all;
  max-width: 300px;
}

.room-label {
  color: var(--app-fg);
  font-size: 12px;
  opacity: 0.8;
}
</style>
