import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { themes } from '@/styles/theme'

type ThemeType = keyof typeof themes

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeType>(
    (localStorage.getItem('fs_theme') as ThemeType) || 'light'
  )
  
  const theme = computed(() => {
    return themes[currentTheme.value]
  })

  const setTheme = (newTheme: ThemeType) => {
    currentTheme.value = newTheme
    localStorage.setItem('fs_theme', newTheme)
  }

  return {
    currentTheme,
    theme,
    setTheme
  }
}) 