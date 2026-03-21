<script setup lang="ts">
import { useAuth } from "../composables/useAuth.ts";
import BaseButton from "./BaseButton.vue";

const { isLoggedIn, currentUser, startLogin, logout } = useAuth();
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
  background: rgb(from var(--accent) r g b / 0.6);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px 12px;
  z-index: 100;
  color: white;
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
  color: #86c9e8;
}
</style>
