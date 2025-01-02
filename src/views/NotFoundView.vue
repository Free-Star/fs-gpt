<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="content">
      <div class="error-code">404</div>
      <h1>页面未找到</h1>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <div class="actions">
        <button class="btn back-btn" @click="goBack">
          <span class="icon">←</span>
          返回上页
        </button>
        <button class="btn home-btn" @click="goHome">
          <span class="icon">🏠</span>
          回到首页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  color: var(--text-primary);
}

.content {
  text-align: center;
  padding: 40px;
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  line-height: 1;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 24px;
}

h1 {
  font-size: 32px;
  margin-bottom: 16px;
  color: var(--text-primary);
}

p {
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-speed);
}

.back-btn {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.back-btn:hover {
  background: var(--secondary);
  transform: translateY(-1px);
}

.home-btn {
  background: var(--primary);
  background-image: var(--primary-gradient);
  color: var(--text-inverse);
}

.home-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.icon {
  font-size: 1.2em;
}

/* 添加动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content {
  animation: fadeIn 0.5s ease-out;
}
</style> 