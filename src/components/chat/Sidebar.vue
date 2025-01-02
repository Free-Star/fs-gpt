<script setup lang="ts">
import { ref } from 'vue'
import type { ChatSession } from '@/types/chat'
import ColorPicker from '../common/ColorPicker.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

// 添加 props 定义
defineProps<{
  sessions: ChatSession[]
  isOpen: boolean
  activeSessionId: number
}>()

const emit = defineEmits<{
  'create-new-chat': []
  'select-session': [id: number]
  'delete-session': [id: number]
}>()

const authStore = useAuthStore()
const router = useRouter()

// 添加删除确认相关的状态
const showDeleteConfirm = ref(false)
const sessionToDelete = ref<number | null>(null)

const handleSessionClick = (sessionId: number) => {
  emit('select-session', sessionId)
}

// 修改删除处理逻辑
const handleDelete = (sessionId: number) => {
  sessionToDelete.value = sessionId
  showDeleteConfirm.value = true
}

// 确认删除
const confirmDelete = () => {
  if (sessionToDelete.value !== null) {
    emit('delete-session', sessionToDelete.value)
  }
  closeDeleteConfirm()
}

// 关闭确认对话框
const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
  sessionToDelete.value = null
}

const themePickerOpen = ref(false)

const handleThemeSelect = () => {
  themePickerOpen.value = false
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="sidebar" :class="{ 'sidebar-closed': !isOpen }">
    <div class="sidebar-header">
      <h2>FreeStarGPT</h2>
    </div>
    
    <button class="new-chat-btn" @click="emit('create-new-chat')">
      <span class="icon">+</span> 开启新对话
    </button>
    
    <div class="time-divider">今天</div>
    
    <div class="chat-sessions">
      <div v-for="session in sessions" 
           :key="session.id" 
           class="chat-session"
           @click="handleSessionClick(session.id)"
           :class="{ 'active': session.id === activeSessionId }"
      >
        <div class="session-content">
          <div class="session-icon">
            <span class="icon">💬</span>
            <span class="hover-icon">✏️</span>
          </div>
          <div class="session-info">
            <div class="session-title">{{ session.title }}</div>
            <div class="session-message">{{ session.lastMessage }}</div>
          </div>
          <div class="session-actions">
            <button class="action-btn delete-btn" @click.stop="handleDelete(session.id)">
              <span class="icon">🗑️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <div class="footer-btn theme-btn" @click.stop="themePickerOpen = !themePickerOpen">
        <span class="btn-icon">🎨</span>
        <span class="btn-text">主题设置</span>
        <ColorPicker 
          class="theme-picker" 
          v-model:isOpen="themePickerOpen"
          @select="handleThemeSelect"
        />
      </div>
      
      <div class="footer-btn" @click="handleLogout">
        <span class="btn-icon">🚪</span>
        <span class="btn-text">退出登录</span>
      </div>
    </div>
    
    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="delete-confirm-overlay">
      <div class="delete-confirm-dialog">
        <h3>删除确认</h3>
        <p>确定要删除这个对话吗？此操作不可恢复。</p>
        <div class="dialog-actions">
          <button 
            class="cancel-btn"
            @click="closeDeleteConfirm"
          >
            取消
          </button>
          <button 
            class="confirm-btn"
            @click="confirmDelete"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  flex-shrink: 0;
  transition: all var(--transition-speed);
}

/* 添加折叠状态样式 */
.sidebar-closed {
  width: 0;
  overflow: hidden;
  border-right: none;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.new-chat-btn {
  margin: 16px;
  padding: 8px 16px;
  background: var(--primary);
  background-image: var(--primary-gradient);
  color: var(--text-inverse);
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-speed);
}

.new-chat-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.icon {
  font-size: 1.2em;
}

.time-divider {
  padding: 8px 16px;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.chat-sessions {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.chat-session {
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-speed);
  position: relative;
  overflow: hidden;
}

.chat-session::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--transition-speed);
  z-index: 0;
}

.chat-session:hover::before {
  opacity: 0.05;
}

.session-content {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.session-icon {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-gradient);
  color: var(--text-inverse);
  border-radius: 8px;
  font-size: 1.2rem;
  transition: all var(--transition-speed);
}

.session-icon .icon {
  transition: transform var(--transition-speed);
}

.session-icon .hover-icon {
  position: absolute;
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--transition-speed);
}

.chat-session:hover .session-icon .icon {
  transform: scale(0.8);
  opacity: 0;
}

.chat-session:hover .session-icon .hover-icon {
  transform: scale(1);
  opacity: 1;
}

.session-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateX(10px);
  transition: all var(--transition-speed);
}

.chat-session:hover .session-actions {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-speed);
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
}

.delete-btn:hover {
  color: #ef4444;
}

.session-info {
  flex: 1;
  min-width: 0; /* 防止文本溢出 */
}

.session-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.session-message {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
}

/* 活跃状态样式优化 */
.chat-session.active {
  background: var(--primary);
  background-image: var(--primary-gradient);
}

.chat-session.active::before {
  display: none;
}

.chat-session.active .session-title,
.chat-session.active .session-message,
.chat-session.active .action-btn {
  color: var(--text-inverse);
}

.chat-session.active .session-icon {
  background: rgba(255, 255, 255, 0.2);
}

.chat-session.active .action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 动画效果 */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.chat-session {
  animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-btn {
  width: 100%;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-primary);
  transition: all var(--transition-speed);
  position: relative;
}

.footer-btn:hover {
  background: var(--sidebar-hover);
  transform: translateY(-1px);
}

.theme-btn {
  position: relative;
}

.theme-picker {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  transition: all var(--transition-speed);
}

.btn-icon {
  font-size: 1.2em;
}

.btn-text {
  font-size: 0.9rem;
}

/* 自定义滚动条 */
.chat-sessions::-webkit-scrollbar {
  width: 4px;
}

.chat-sessions::-webkit-scrollbar-track {
  background: transparent;
}

.chat-sessions::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.chat-sessions::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* 删除确认对话框样式 */
.delete-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-confirm-dialog {
  background: var(--surface);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: dialog-fade-in 0.2s ease-out;
}

@keyframes dialog-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.delete-confirm-dialog h3 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.delete-confirm-dialog p {
  margin: 0 0 24px 0;
  color: var(--text-secondary);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-actions button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-speed);
}

.cancel-btn {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.cancel-btn:hover {
  background: var(--secondary);
}

.confirm-btn {
  background: #ef4444;
  color: white;
}

.confirm-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style> 