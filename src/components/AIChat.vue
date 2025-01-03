<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue'
import Sidebar from './chat/Sidebar.vue'
import MessageList from './chat/MessageList.vue'
import MessageInput from './chat/MessageInput.vue'
import type { ChatSession, ChatMessage } from '@/types/chat'
import { streamMessage } from '@/services/ai'

// 从 localStorage 读取数据或使用默认值
const messages = ref<ChatMessage[]>([])
const chatSessions = ref<ChatSession[]>([])
const activeSessionId = ref<number>(0)
const isTyping = ref(false)
const isSidebarOpen = ref(true)

// 添加 ref 用于获取 MessageInput 组件实例
const messageInput = ref()

// 初始化数据
onMounted(() => {
  loadFromLocalStorage()
})

// 从 localStorage 加载数据
const loadFromLocalStorage = () => {
  try {
    // 加载会话列表
    const storedSessions = localStorage.getItem('fs_chat_sessions')
    if (storedSessions) {
      chatSessions.value = JSON.parse(storedSessions)
    }

    // 加载当前活动会话ID
    const storedActiveId = localStorage.getItem('fs_active_session_id')
    if (storedActiveId) {
      activeSessionId.value = Number(storedActiveId)
    } else if (chatSessions.value.length > 0) {
      activeSessionId.value = chatSessions.value[0].id
    }

    // 如果没有会话，创建一个新会话
    if (chatSessions.value.length === 0) {
      handleCreateNewChat()
      return
    }

    // 加载当前会话的消息
    loadSessionMessages(activeSessionId.value)
  } catch (error) {
    console.error('加载本地存储数据失败:', error)
    handleCreateNewChat()
  }
}

// 加载指定会话的消息
const loadSessionMessages = (sessionId: number) => {
  try {
    const key = `fs_messages_${sessionId}`
    const storedMessages = localStorage.getItem(key)
    messages.value = storedMessages ? JSON.parse(storedMessages) : []
  } catch (error) {
    console.error('加载会话消息失败:', error)
    messages.value = []
  }
}

// 保存当前会话的消息
const saveCurrentMessages = () => {
  if (activeSessionId.value) {
    const key = `fs_messages_${activeSessionId.value}`
    localStorage.setItem(key, JSON.stringify(messages.value))
  }
}

// 保存会话列表和当前活动会话ID
const saveSessionsData = () => {
  localStorage.setItem('fs_chat_sessions', JSON.stringify(chatSessions.value))
  localStorage.setItem('fs_active_session_id', String(activeSessionId.value))
}

// 添加一个更新会话标题的函数
const updateSessionTitle = (sessionId: number, content: string) => {
  const session = chatSessions.value.find(s => s.id === sessionId)
  if (session) {
    // 截取前8个字符作为标题，如果超过8个字符则添加省略号
    session.title = content.length > 8 ? content.slice(0, 8) + '...' : content
    saveSessionsData()
  }
}

const handleSendMessage = async (content: string) => {
  if (!content.trim() || isTyping.value) return
  
  // 使用更可靠的 ID 生成方式
  const userMessageId = Date.now() * 1000 + Math.floor(Math.random() * 1000)
  
  const userMessage: ChatMessage = {
    id: userMessageId,
    role: 'user',
    content,
    timestamp: formatTimestamp(),
    status: 'sent'
  }
  
  // 如果是会话的第一条消息，更新会话标题
  if (messages.value.length === 0) {
    updateSessionTitle(activeSessionId.value, content)
  }
  
  messages.value.push(userMessage)
  saveCurrentMessages()
  
  isTyping.value = true
  
  try {
    const systemMessage: ChatMessage = {
      id: Date.now() * 1000 - 1,
      role: 'system',
      content: '你是FreeStarGPT,一个友好的AI助手，请用简洁、专业的方式回答问题。',
      timestamp: formatTimestamp()
    }
    
    const messageHistory: ChatMessage[] = [
      systemMessage,
      ...messages.value.map(msg => ({
        ...msg,
        role: msg.role
      }))
    ]
    
    // 为 AI 消息生成唯一 ID
    const aiMessageId = Date.now() * 1000 + Math.floor(Math.random() * 1000)
    
    const aiMessage = reactive<ChatMessage>({
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: formatTimestamp(),
      status: 'sending'
    })
    
    messages.value.push(aiMessage)
    
    // 使用流式响应
    for await (const chunk of streamMessage(messageHistory)) {
      aiMessage.content += chunk
      saveCurrentMessages() // 实时保存AI响应
    }
    
    aiMessage.status = 'sent'
    updateLastMessage(aiMessage.content)
  } catch (error) {
    console.error('发送消息失败:', error)
    userMessage.status = 'error'
    handleError()
  } finally {
    isTyping.value = false
    saveCurrentMessages()
    // 使用 nextTick 确保在 DOM 更新后再聚焦
    nextTick(() => {
      messageInput.value?.focus()
    })
  }
}

const updateLastMessage = (content: string) => {
  const currentSession = chatSessions.value.find(s => s.id === activeSessionId.value)
  if (currentSession) {
    currentSession.lastMessage = content
    currentSession.timestamp = formatTimestamp()
    saveSessionsData()
  }
}

const handleError = () => {
  const errorMessageId = Date.now() * 1000 + Math.floor(Math.random() * 1000)
  
  const errorMessage: ChatMessage = {
    id: errorMessageId,
    role: 'assistant',
    content: '抱歉，处理消息时出现错误。请稍后重试。',
    timestamp: formatTimestamp(),
    status: 'error'
  }
  messages.value.push(errorMessage)
  saveSessionsData()
}

const handleCreateNewChat = () => {
  saveCurrentMessages()
  
  const newSession = {
    id: Date.now(),
    title: '新对话',
    lastMessage: '开始新的对话...',
    timestamp: formatTimestamp()
  }
  
  chatSessions.value.unshift(newSession)
  activeSessionId.value = newSession.id
  messages.value = []
  
  saveSessionsData()
}

const handleSessionSelect = (sessionId: number) => {
  // 保存当前会话的消息
  saveCurrentMessages()
  
  activeSessionId.value = sessionId
  loadSessionMessages(sessionId)
  saveSessionsData()
}

const handleDeleteSession = (sessionId: number) => {
  // 删除会话的消息记录
  localStorage.removeItem(`fs_messages_${sessionId}`)
  
  chatSessions.value = chatSessions.value.filter(s => s.id !== sessionId)
  
  if (activeSessionId.value === sessionId) {
    if (chatSessions.value.length > 0) {
      activeSessionId.value = chatSessions.value[0].id
      loadSessionMessages(chatSessions.value[0].id)
    } else {
      handleCreateNewChat()
    }
  }
  
  saveSessionsData()
}

const formatTimestamp = () => {
  return new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 添加编辑消息的处理函数
const handleEditMessage = (content: string) => {
  if (messageInput.value) {
    messageInput.value.setInputContent(content)
  }
}
</script>

<template>
  <div class="app-container">
    <Sidebar
      :sessions="chatSessions"
      :is-open="isSidebarOpen"
      :active-session-id="activeSessionId"
      @create-new-chat="handleCreateNewChat"
      @select-session="handleSessionSelect"
      @delete-session="handleDeleteSession"
    />
    
    <div class="main-container" :class="{ 'sidebar-closed': !isSidebarOpen }">
      <div class="main-header">
        <button class="toggle-sidebar-btn" @click="toggleSidebar">
          <svg 
            class="icon" 
            viewBox="0 0 24 24" 
            width="20" 
            height="20" 
            stroke="currentColor" 
            stroke-width="2" 
            fill="none"
          >
            <path 
              d="M15 6L9 12L15 18" 
              :class="{ 'reversed': !isSidebarOpen }"
            />
          </svg>
        </button>
      </div>
      
      <MessageList 
        :messages="messages"
        :is-typing="isTyping"
        @edit="handleEditMessage"
      />
      <MessageInput
        ref="messageInput"
        :is-typing="isTyping"
        @send="handleSendMessage"
      />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  height: 100%;
  background: var(--background);
  overflow: hidden;
  transition: background-color var(--transition-speed);
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  background: var(--surface);
  transition: all var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
  padding-left: 0;
}

.main-header {
  padding: 12px;
  display: flex;
  align-items: center;
}

.toggle-sidebar-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-speed);
  margin-right: 12px;
}

.toggle-sidebar-btn:hover {
  background: var(--secondary);
  color: var(--text-primary);
  transform: translateX(2px);
}

.toggle-sidebar-btn .icon {
  transition: all var(--transition-speed);
}

.toggle-sidebar-btn:hover .icon {
  transform: scale(1.1);
}

.icon path {
  transition: all var(--transition-speed);
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icon path.reversed {
  transform: rotate(180deg);
  transform-origin: center;
}

.toggle-sidebar-btn:active {
  transform: scale(0.95);
}

.toggle-sidebar-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary-gradient);
}

.sidebar-closed .main-container {
  padding-left: 12px;
}

@media (max-width: 768px) {
  .toggle-sidebar-btn {
    width: 32px;
    height: 32px;
  }
  
  .toggle-sidebar-btn .icon {
    width: 18px;
    height: 18px;
  }
}
</style> 