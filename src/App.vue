<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'
import { watch, onMounted, watchEffect } from 'vue'
import type { themes } from '@/styles/theme'

// 更新 CSS 变量的函数
function updateThemeVariables(theme: any) {
  const root = document.documentElement
  root.style.setProperty('--primary', theme.primary)
  root.style.setProperty('--primary-gradient', theme.primaryGradient)
  root.style.setProperty('--secondary', theme.secondary)
  root.style.setProperty('--background', theme.background)
  root.style.setProperty('--surface', theme.surface)
  root.style.setProperty('--surface-rgb', theme['surface-rgb'])
  root.style.setProperty('--border', theme.border)
  root.style.setProperty('--text-primary', theme.text.primary)
  root.style.setProperty('--text-secondary', theme.text.secondary)
  root.style.setProperty('--text-inverse', theme.text.inverse)
}

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)

// 使用 watchEffect 代替 watch + immediate
watchEffect(() => {
  updateThemeVariables(theme.value)
})

// 确保在页面加载时应用保存的主题
onMounted(() => {
  const savedTheme = localStorage.getItem('fs_theme')
  if (savedTheme && savedTheme !== themeStore.currentTheme) {
    themeStore.setTheme(savedTheme as keyof typeof themes)
  }
})
</script>

<template>
  <router-view />
</template>

<style>
:root {
  --transition-speed: 0.3s;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Inter, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
}

#app {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--background);
  color: var(--text-primary);
  transition: all var(--transition-speed);
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* 全局过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-speed);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全局按钮样式 */
button {
  font-family: inherit;
}

/* 全局链接样式 */
a {
  color: var(--primary);
  text-decoration: none;
  transition: opacity var(--transition-speed);
}

a:hover {
  opacity: 0.8;
}
</style>
