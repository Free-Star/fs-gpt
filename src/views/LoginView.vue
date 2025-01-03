<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!password.value) {
    error.value = '请输入密码'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await authStore.login(password.value)
    router.push('/')
  } catch (e) {
    error.value = '密码错误'
  } finally {
    isLoading.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !isLoading.value) {
    handleLogin()
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>FreeStarGPT</h1>
      <p class="subtitle">请输入访问密码</p>
      
      <div class="notice">
        <p>FreeStar温馨提示：</p>
        <p>完成更新，采用了简洁的UI设计</p>
        <p>和强大好用deepseek接口</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          :disabled="isLoading"
          @keydown="handleKeydown"
          autofocus
        />
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button 
          type="submit"
          :disabled="isLoading || !password.trim()"
          class="login-btn"
        >
          {{ isLoading ? '验证中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  text-align: center;
}

h1 {
  margin-bottom: 8px;
  color: var(--text-primary);
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

input {
  width: 100%;
  padding: 12px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all var(--transition-speed);
}

input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-gradient);
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  background-image: var(--primary-gradient);
  color: var(--text-inverse);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-speed);
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.notice {
  margin-bottom: 24px;
  padding: 12px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: left;
}

.notice p {
  margin: 4px 0;
}
</style> 