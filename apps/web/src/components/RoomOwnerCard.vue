<script setup lang="ts">
import { ref, watch, computed } from "vue";
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
      <div class="avatar-container">
        <img v-if="userInfo?.avatarUrl" :src="userInfo.avatarUrl" class="owner-avatar" />
        <div v-else class="owner-avatar-placeholder"></div>
      </div>
      <div class="owner-info">
        <span class="owner-name">{{ userInfo?.name ?? userId }}</span>
        <span class="owner-acct">@{{ userId }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.room-owner-card {
  position: absolute;
  top: 16px;
  left: 16px;
  background: var(--panel-bg);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 12px 16px;
  z-index: 90;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--divider);
}

.owner-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.avatar-container {
  flex-shrink: 0;
}

.owner-avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
}

.owner-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--bg);
}

.owner-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.owner-name {
  font-weight: 700;
  color: var(--app-fg-strong);
  font-size: 15px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.owner-acct {
  color: var(--app-fg);
  font-size: 13px;
  opacity: 0.7;
  line-height: 1.3;
  font-weight: 500;
}
</style>
