import { ref } from 'vue'
import { defineStore } from 'pinia'

// 简单的密码加密函数
const hashPassword = (password: string): string => {
  return btoa(password).split('').reverse().join('')
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  
  // 从环境变量获取加密后的密码
  const VALID_PASSWORD_HASH = hashPassword(import.meta.env.VITE_APP_PASSWORD)
  
  const login = async (password: string) => {
    return new Promise((resolve, reject) => {
      if (hashPassword(password) === VALID_PASSWORD_HASH) {
        isAuthenticated.value = true
        localStorage.setItem('fs_auth', VALID_PASSWORD_HASH)
        resolve(true)
      } else {
        reject(new Error('Invalid password'))
      }
    })
  }
  
  const logout = () => {
    isAuthenticated.value = false
    localStorage.removeItem('fs_auth')
  }
  
  const checkAuth = () => {
    const storedHash = localStorage.getItem('fs_auth')
    isAuthenticated.value = storedHash === VALID_PASSWORD_HASH
  }
  
  return {
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
}) 