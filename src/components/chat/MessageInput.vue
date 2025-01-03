<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps<{
  isTyping: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const input = ref<HTMLTextAreaElement | null>(null)
const inputMessage = ref('')

// 自动调整高度的函数
const adjustHeight = () => {
  if (!input.value) return
  
  // 重置高度以获取正确的 scrollHeight
  input.value.style.height = 'auto'
  
  // 计算行数
  const lineHeight = parseInt(getComputedStyle(input.value).lineHeight)
  const maxHeight = lineHeight * 5 // 最多显示5行
  
  // 设置新高度，但不超过最大高度
  const newHeight = Math.min(input.value.scrollHeight, maxHeight)
  input.value.style.height = `${newHeight}px`
}

// 处理输入事件
const handleInput = () => {
  adjustHeight()
}

// 处理按键事件
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    if (e.shiftKey) {
      // Shift+Enter 换行
      return
    }
    // 普通 Enter 发送
    e.preventDefault()
    handleSend()
  }
}

const handleSend = () => {
  if (inputMessage.value.trim() && !props.isTyping) {
    emit('send', inputMessage.value)
    inputMessage.value = ''
    // 重置高度
    if (input.value) {
      input.value.style.height = 'auto'
    }
    // 提交后自动聚焦
    input.value?.focus()
  }
}

// 添加设置输入内容的方法
const setInputContent = (content: string) => {
  inputMessage.value = content
  nextTick(() => {
    input.value?.focus()
    adjustHeight()
  })
}

// 暴露聚焦方法给父组件
defineExpose({
  focus: () => input.value?.focus(),
  setInputContent
})
</script>

<template>
  <div class="input-container">
    <div class="input-area">
      <textarea
        ref="input"
        v-model="inputMessage"
        @input="handleInput"
        @keydown="handleKeydown"
        placeholder="给 FS 发送消息 (Shift + Enter 换行)"
        :disabled="isTyping"
        rows="1"
      />
      <button 
        class="send-btn"
        @click="handleSend"
        :disabled="isTyping || !inputMessage.trim()"
      >
        {{ isTyping ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-container {
  padding: 20px;
  border-top: 1px solid var(--border);
  background: var(--surface);
  transition: all var(--transition-speed);
}

.input-area {
  max-width: 800px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

textarea {
  flex: 1;
  padding: 8px 12px;
  border: none;
  font-size: 0.95rem;
  color: var(--text-primary);
  background: var(--surface);
  transition: all var(--transition-speed);
  resize: none;
  overflow-y: auto;
  min-height: 40px;
  line-height: 1.5;
  font-family: inherit;
}

textarea::-webkit-scrollbar {
  width: 4px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

textarea::placeholder {
  color: var(--text-secondary);
}

textarea:focus {
  outline: none;
}

.send-btn {
  padding: 8px 20px;
  background: var(--primary);
  background-image: var(--primary-gradient);
  color: var(--text-inverse);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all var(--transition-speed);
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.send-btn:disabled {
  background: var(--border);
  color: var(--text-secondary);
  cursor: not-allowed;
  background-image: none;
}
</style> 