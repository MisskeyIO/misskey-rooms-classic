<script setup lang="ts">
import { computed } from "vue";
import { useAuth } from "../composables/useAuth.ts";
import BaseButton from "./BaseButton.vue";

const { isLoggedIn, currentUser, startLogin, logout } = useAuth();
const myRoomHref = computed(() =>
  currentUser.value ? `/${encodeURIComponent(currentUser.value.userId)}` : undefined,
);
</script>

<template>
  <div class="login-panel">
    <template v-if="isLoggedIn">
      <img
        v-if="currentUser!.picture"
        :src="currentUser!.picture"
        class="avatar"
        :alt="currentUser!.name"
      />
      <span class="username">@{{ currentUser!.userId }}</span>
      <BaseButton v-if="myRoomHref" :href="myRoomHref">自分の部屋へ</BaseButton>
      <BaseButton @click="logout">ログアウト</BaseButton>
    </template>
    <template v-else>
      <BaseButton variant="primary" @click="startLogin()">ログインしてルームを作成する</BaseButton>
    </template>
  </div>
</template>

<style scoped>
.login-panel {
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--panel-bg);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px 12px;
  z-index: 100;
  color: var(--app-fg-strong);
  font-size: 13px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: 600;
  color: var(--link);
}
</style>
