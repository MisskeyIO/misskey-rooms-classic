<script setup lang="ts"></script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="service-end-overlay">
        <div class="overlay-content">
          <h1 class="title">Misskey Rooms Classic</h1>
          <p class="message">2026年4月30日をもってサービスを終了いたしました</p>
          <div class="new-project">
            <span class="sparkle">✨</span>
            <p class="new-project-text">
              新しい Misskey Rooms も準備中です！<br />
              お楽しみに！！
            </p>
            <span class="sparkle">✨</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.service-end-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-bg);
  padding: 2rem;
}

.overlay-content {
  text-align: center;
  max-width: 600px;
  color: var(--app-fg-strong);
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.4;
  color: var(--app-fg-strong);
}

.message {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  opacity: 0.9;
  line-height: 1.6;
  color: var(--app-fg);
}

.new-project {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.sparkle {
  font-size: 1.5rem;
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle:nth-child(3) {
  animation-delay: 0.5s;
}

.new-project-text {
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 500;
  color: var(--app-fg-strong);
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .title {
    font-size: 1.5rem;
  }

  .message {
    font-size: 1rem;
  }
}
</style>
