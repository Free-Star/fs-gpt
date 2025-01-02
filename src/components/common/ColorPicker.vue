<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const colorPicker = ref<HTMLElement | null>(null)

const themes = [
  { name: '浅色', value: 'light', icon: '🌞', gradient: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)' },
  { name: '深色', value: 'dark', icon: '🌙', gradient: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' },
  { name: '蓝色', value: 'blue', icon: '🌊', gradient: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' },
  { name: '绿色', value: 'green', icon: '🌿', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { name: '橙色', value: 'orange', icon: '🔥', gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }
] as const

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'select': [theme: string]
}>()

const selectTheme = (theme: string) => {
  themeStore.setTheme(theme as keyof typeof themes)
  emit('select', theme)
  emit('update:isOpen', false)
}

const handleClickOutside = (event: MouseEvent) => {
  event.stopPropagation()
  if (props.isOpen && colorPicker.value && !colorPicker.value.contains(event.target as Node)) {
    emit('update:isOpen', false)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="color-picker" ref="colorPicker" @click.stop>
    <div v-if="isOpen" class="color-dropdown">
      <div class="theme-grid">
        <button 
          v-for="theme in themes" 
          :key="theme.value"
          class="theme-option"
          :class="{ active: themeStore.currentTheme === theme.value }"
          @click="selectTheme(theme.value)"
        >
          <div 
            class="theme-preview" 
            :style="{ background: theme.gradient }"
          >
            <span class="theme-icon">{{ theme.icon }}</span>
          </div>
          <span class="theme-name">{{ theme.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-picker {
  position: relative;
}

.color-dropdown {
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translate(40%, -140%);
  width: max-content;
  margin: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slide-left 0.2s ease-out;
  z-index: 100;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  min-width: 300px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 6px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-primary);
  transition: all var(--transition-speed);
}

.theme-option:hover {
  background: var(--sidebar-hover);
}

.theme-option.active {
  background: var(--primary-gradient);
  color: var(--text-inverse);
}

.theme-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: transform var(--transition-speed);
}

.theme-option:hover .theme-preview {
  transform: scale(1.1);
}

.theme-name {
  font-size: 0.75rem;
  white-space: nowrap;
}

@keyframes slide-left {
  from {
    opacity: 0;
    transform: translate(40%, -100%);
  }
  to {
    opacity: 1;
    transform: translate(40%, -140%);
  }
}
</style> 