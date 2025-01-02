<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ChatMessage } from '@/types/chat'
import MarkdownIt from 'markdown-it'

const props = defineProps<{
  message: ChatMessage
}>()

const displayContent = ref('')
const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string) {
    // 为代码块添加语言标识和复制按钮
    return `<div class="code-block">
              <div class="code-header">
                ${lang ? `<span class="code-lang">${lang}</span>` : ''}
                <button class="code-copy-btn" data-code="${encodeURIComponent(str)}">
                  <span class="icon">📋</span>
                </button>
              </div>
              <pre><code class="language-${lang || 'text'}">${str}</code></pre>
            </div>`
  }
})

// 处理代码块的函数
const processCodeBlocks = (content: string) => {
  const blocks = []
  let currentBlock = ''
  let isInCodeBlock = false
  let currentLang = ''
  
  // 按行分割内容
  const lines = content.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const codeBlockMatch = line.match(/^```(\w*)$/)
    
    if (codeBlockMatch) {
      if (!isInCodeBlock) {
        // 开始新的代码块
        isInCodeBlock = true
        currentLang = codeBlockMatch[1]
        if (currentBlock) {
          blocks.push({ type: 'text', content: currentBlock.trim() })
          currentBlock = ''
        }
      } else {
        // 结束当前代码块
        isInCodeBlock = false
        blocks.push({ 
          type: 'code', 
          content: currentBlock.trim(),
          lang: currentLang 
        })
        currentBlock = ''
      }
    } else {
      currentBlock += (currentBlock ? '\n' : '') + line
    }
  }
  
  // 处理最后一个块
  if (currentBlock) {
    blocks.push({
      type: isInCodeBlock ? 'code' : 'text',
      content: currentBlock.trim(),
      lang: isInCodeBlock ? currentLang : ''
    })
  }
  
  // 重新组合内容，移除多余的空行
  return blocks.map(block => {
    if (block.type === 'code') {
      return `\`\`\`${block.lang}\n${block.content}\n\`\`\``
    }
    // 处理文本块中的多余空行
    return block.content.replace(/\n{3,}/g, '\n\n')
  }).join('\n')  // 使用单个换行符连接块
}

// 监听消息内容变化并解析 Markdown
watch(() => props.message.content, (newContent) => {
  if (props.message.role === 'assistant') {
    // 预处理代码块
    const processedContent = processCodeBlocks(newContent)
    // 渲染 Markdown
    displayContent.value = md.render(processedContent.trim())
  } else {
    displayContent.value = newContent
  }
}, { immediate: true })

const isCopied = ref(false)

const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 代码块复制功能
const handleClick = async (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const copyBtn = target.closest('.code-copy-btn') as HTMLButtonElement
  
  if (copyBtn) {
    const code = decodeURIComponent(copyBtn.dataset.code || '')
    try {
      await navigator.clipboard.writeText(code)
      copyBtn.classList.add('copied')
      setTimeout(() => {
        copyBtn.classList.remove('copied')
      }, 2000)
    } catch (err) {
      console.error('复制代码失败:', err)
    }
  }
}
</script>

<template>
  <div :class="['message-wrapper', message.role]">
    <div class="message-content">
      <div 
        class="message-bubble"
        :class="{ 
          'typing': message.role === 'assistant' && message.status === 'sending',
          'sent': message.status === 'sent',
          'error': message.status === 'error'
        }"
      >
        <img 
          v-if="message.role === 'assistant'" 
          src="/hamster.svg" 
          alt="AI" 
          class="ai-avatar"
        >
        <div 
          v-if="message.role === 'assistant'" 
          v-html="displayContent" 
          class="markdown-body"
          @click="handleClick"
        ></div>
        <div v-else>{{ displayContent }}</div>
        <div class="message-actions" v-if="message.role === 'assistant'">
          <button class="action-btn" @click="copyMessage">
            <span class="icon">{{ isCopied ? '✓' : '📋' }}</span>
            <span class="tooltip">{{ isCopied ? '已复制' : '复制' }}</span>
          </button>
        </div>
      </div>
      <div class="message-info" v-if="message.status === 'error'">
        <span class="error-badge">发送失败</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-wrapper {
  padding: 12px 20px;
  animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: center;
}

.message-content {
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  position: relative;
  padding: 12px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.5;
  transition: all var(--transition-speed);
  word-break: break-word;
  width: fit-content;
  max-width: 80%;
}

/* 用户消息靠右 */
.user .message-content {
  align-items: flex-end;
}

.user .message-bubble {
  background: var(--primary);
  background-image: var(--primary-gradient);
  color: var(--text-inverse);
  border: none;
}

/* AI消息靠左 */
.assistant .message-content {
  align-items: flex-start;
  width: 100%;
}

.assistant .message-bubble {
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding-bottom: 36px;
  width: 100%;
  max-width: 100%;
  margin-left: 32px;
}

/* 打字机效果 */
.message-bubble.typing::after {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: currentColor;
  margin-left: 4px;
  vertical-align: middle;
  animation: blink 0.8s step-end infinite;
}

.assistant .message-bubble {
  margin-right: auto;
}

.user .message-bubble {
  margin-left: auto;
  max-width: 80%;
}

.error .message-bubble {
  background: var(--message-error);
  color: var(--text-inverse);
}

.copy-btn {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-speed);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.message-bubble:hover .copy-btn {
  opacity: 1;
  transform: translateY(0);
}

.copy-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.copy-btn.copied {
  color: var(--primary);
  background: rgba(0, 0, 0, 0.05);
}

.copy-btn .tooltip {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  background: var(--surface);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(4px);
  transition: all var(--transition-speed);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.copy-btn:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
}

.message-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 0 8px;
}

.timestamp {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.error-badge {
  font-size: 0.75rem;
  color: var(--message-error);
  background: var(--surface);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid currentColor;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-bubble.typing::after {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: currentColor;
  margin-left: 4px;
  vertical-align: middle;
  animation: blink 0.8s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.message-bubble.sent::after {
  display: none;
}

/* Markdown 样式 */
.markdown-body {
  font-size: 0.95rem;
  line-height: 1.6;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin: 1em 0 0.5em;
  line-height: 1.4;
  font-weight: 600;
}

.markdown-body :deep(p) {
  margin: 0.5em 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-body :deep(li) {
  margin: 0.25em 0;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  margin: 0;
  padding: 2.5em 1em 1em;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  padding: 0;
  background: none;
}

.markdown-body :deep(blockquote) {
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 4px solid var(--border);
  color: var(--text-secondary);
}

.markdown-body :deep(a) {
  color: var(--primary);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(table) {
  width: 100%;
  margin: 0.5em 0;
  border-collapse: collapse;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 0.5em;
  border: 1px solid var(--border);
}

.markdown-body :deep(th) {
  background: rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

/* 代码块样式优化 */
.markdown-body :deep(.code-block) {
  position: relative;
  margin: 0.5em 0;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  overflow: hidden;
}

.markdown-body :deep(.code-header) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.markdown-body :deep(.code-lang) {
  font-family: monospace;
  font-size: 0.85em;
  color: var(--text-secondary);
}

.markdown-body :deep(.code-copy-btn) {
  padding: 2px 6px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  transition: all var(--transition-speed);
}

.markdown-body :deep(pre) {
  margin: 0;
  padding: 12px;
  padding-top: 40px;
  background: transparent;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  padding: 0;
  background: none;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
  line-height: 1.4;
}

/* 内联代码样式 */
.markdown-body :deep(:not(pre) > code) {
  padding: 0.2em 0.4em;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
  color: var(--text-primary);
}

.action-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.action-btn .icon {
  width: 16px;
  height: 16px;
}

.action-btn .tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  background: var(--surface);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s;
}

.action-btn:hover .tooltip {
  opacity: 1;
}

/* 移除所有旧的按钮样式 */
.copy-btn, .regenerate-btn {
  display: none;
}

.regenerate-btn,
.regenerate-btn .icon,
.regenerate-btn .tooltip {
  display: none;
}

.message-actions {
  position: absolute;
  left: 8px;
  bottom: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

/* 移除旧的复制按钮样式 */
.copy-btn {
  display: none;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  position: absolute;
  left: -32px;
  border-radius: 50%;
}
</style> 