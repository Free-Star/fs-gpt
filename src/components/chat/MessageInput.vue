<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isTyping: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const input = ref<HTMLInputElement | null>(null)
const inputMessage = ref('')

const handleSend = () => {
  if (inputMessage.value.trim() && !props.isTyping) {
    emit('send', inputMessage.value)
    inputMessage.value = ''
    // 提交后自动聚焦
    input.value?.focus()
  }
}

// 暴露聚焦方法给父组件
defineExpose({
  focus: () => input.value?.focus()
})
</script>

<template>
  <div class="input-container">
    <div class="input-area">
      <input 
        ref="input"
        v-model="inputMessage"
        @keyup.enter="handleSend"
        placeholder="给 FS 发送消息"
        type="text"
        :disabled="isTyping"
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
  align-items: center;
  gap: 12px;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  font-size: 0.95rem;
  color: var(--text-primary);
  background: var(--surface);
  transition: all var(--transition-speed);
}

input::placeholder {
  color: var(--text-secondary);
}

input:focus {
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