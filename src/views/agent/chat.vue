<script setup lang="ts">
  import {
    Sender,
    Attachments,
    BubbleList,
    Typewriter,
    XMarkdown,
    useXStream
  } from 'vue-element-plus-x'
  import { ref, computed, watch, nextTick } from 'vue'
  import { debounce } from 'lodash-es'
  import FilesSelect from './modules/FilesSelect.vue'
  import ModelSelect from './modules/ModelSelect.vue'
  import { useFilesStore } from '@stores/modules/files'
  import { useUserStore } from '@stores/modules/user'
  import Echarts from '@/components/EChartsRenderer.vue'

  // 类型定义
  interface MessageItem {
    key: number
    avatar: string
    avatarSize: string
    role: 'user' | 'system'
    placement: 'start' | 'end'
    isMarkdown: boolean
    loading: boolean
    content: string
    reasoning_content: string
    thinkingStatus: 'start' | 'loading' | 'end'
    thinlCollapse: boolean
    noStyle: boolean
    typing?: boolean
  }

  // 配置
  const CONFIG = {
    API_URL: 'http://192.168.120.39:8090/v1/chat-messages',
    API_KEY: 'app-NVz8xJbVqDKqoCN7nWo7ml24',
    SCROLL_DELAY: 350,
    USER_ID: 'abc-123'
  }

  const filesStore = useFilesStore()
  const userStore = useUserStore()

  // 用户头像
  const avatar = computed(() => {
    const userInfo = userStore.userInfo
    return userInfo?.avatar || 'https://avatars.githubusercontent.com/u/76239030?v=4'
  })

  const inputValue = ref('')
  const senderRef = ref<InstanceType<typeof Sender> | null>(null)
  const bubbleItems = ref<MessageItem[]>([])
  const bubbleListRef = ref(null)

  // 使用 useXStream 处理流式请求
  const { startStream, cancel, isLoading, data, error } = useXStream()
  console.log('useXStream error', error.value)
  // 防抖处理滚动
  const scrollToBottom = debounce(() => {
    bubbleListRef.value?.scrollToBottom()
  }, 100)

  watchEffect(() => {
    let content = ''
    let isMessageEnd = false

    if (data.value.length) {
      content = data.value.reduce((text, chunkItem) => {
        try {
          const parsedChunk = JSON.parse(chunkItem.data)
          switch (parsedChunk.event) {
            case 'message_end':
              isMessageEnd = true
              return text
            case 'node_finished':
            case 'node_started':
            case 'workflow_started':
            case 'iteration_started':
            case 'iteration_next':
            case 'iteration_completed':
              break
            case 'error':
              break
            case 'message':
              if (parsedChunk.answer) return text + parsedChunk.answer
              break
            default:
              console.log('未知事件类型:', parsedChunk.event)
          }
        } catch (error) {
          console.error('解析数据时出错:', error)
        }
        return text
      }, '')
    }

    // 直接修改最后一个元素
    if (bubbleItems.value.length) {
      const lastIndex = bubbleItems.value.length - 1
      const shouldCloseLoading = content || isMessageEnd
      bubbleItems.value[lastIndex] = {
        ...bubbleItems.value[lastIndex],
        content,
        loading: !shouldCloseLoading
      }

      // 只有当有内容变化时才滚动和输出日志
      if (content) {
        scrollToBottom()
        console.log('Current answer:', content)
      }
    }
  })
  // 网络请求函数
  async function fetchChatResponse(content: string) {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        inputs: {},
        query: content,
        response_mode: 'streaming',
        conversation_id: null,
        user: CONFIG.USER_ID
      })
    })
    return response
  }

  const selfCodeXRender = {
    // 渲染自定义代码块标识符 javascript, 返回一个组件
    javascript: (props: { raw: any }) => {
      return h(
        'pre',
        { class: 'language-javascript' },
        h('code', { class: 'language-javascript' }, props.raw.content)
      )
    },

    // 渲染自定义代码块标识符 echarts, Echarts 是自己封装的Vue组件
    echarts: (props: { raw: any }) => h(Echarts, { code: props.raw.content })
  }
  /**
   * 发送请求并处理流式连接
   * @async
   * @function startSSE
   * @description 建立与服务器的流式连接，接收AI回答并实时更新UI
   */
  const startSSE = async (content = inputValue.value) => {
    if (!content) return
    data.value = []
    // 插入用户消息
    addMessage(content, true)

    // 添加AI回答占位符
    addMessage('', false)

    // 滚动到底部
    scrollToBottom()

    // 重置输入
    inputValue.value = ''

    try {
      // 开始流式请求
      const response = await fetchChatResponse(content)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      startStream({
        readableStream: response.body
      })
    } catch (error) {
      console.error('请求错误:', error)
      // 停止打字器状态
      if (bubbleItems.value.length) {
        bubbleItems.value[bubbleItems.value.length - 1].typing = false
      }
    }
  }

  /**
   * 停止流式连接
   * @function cancelSSE
   * @description 中断流式连接并重置状态
   */
  async function cancelSSE() {
    // 中断流式连接
    cancel()
    // 结束最后一条消息打字状态
    if (bubbleItems.value.length) {
      bubbleItems.value[bubbleItems.value.length - 1].typing = false
    }
  }

  // 添加消息 - 维护聊天记录
  function addMessage(message: string, isUser: boolean) {
    const i = bubbleItems.value.length
    const obj: MessageItem = {
      key: i,
      avatar: isUser
        ? avatar.value
        : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      avatarSize: '42px',
      role: isUser ? 'user' : 'system',
      placement: isUser ? 'end' : 'start',
      isMarkdown: !isUser,
      loading: !isUser,
      content: message || '',
      reasoning_content: '',
      thinkingStatus: 'start',
      thinlCollapse: false,
      noStyle: !isUser
    }
    bubbleItems.value.push(obj)
    console.log('添加消息:', obj)
  }

  // 展开收起 事件展示
  function handleChange(payload: { value: boolean; status: 'start' | 'loading' | 'end' }) {
    console.log('value', payload.value, 'status', payload.status)
  }

  function handleDeleteCard(_item, index: number) {
    filesStore.deleteFileByIndex(index)
  }

  watch(
    () => filesStore.filesList.length,
    (val) => {
      if (val > 0) {
        nextTick(() => {
          senderRef.value?.openHeader()
        })
      } else {
        nextTick(() => {
          senderRef.value?.closeHeader()
        })
      }
    }
  )
</script>

<template>
  <div class="chat-container relative flex-col flex-center w-4/5 m-auto h-full">
    <div
      class="chat-warp flex-col justify-center w-full"
      :class="{ 'justify-between': bubbleItems.length }"
    >
      <BubbleList
        ref="bubbleListRef"
        :list="bubbleItems"
        max-height="calc(100vh - 240px)"
        v-if="bubbleItems.length"
      >
        <template #header="{ item }">
          <Thinking
            v-if="item.reasoning_content"
            v-model="item.thinlCollapse"
            :content="item.reasoning_content"
            :status="item.thinkingStatus"
            class="thinking-chain-warp"
            @change="handleChange"
          />
        </template>

        <template #content="{ item }">
          <!-- chat 内容走 markdown -->
          <div v-if="item.content && item.role === 'system'">
            <XMarkdown
              :markdown="item.content"
              class="markdown-body"
              :themes="{ light: 'github-light', dark: 'github-dark' }"
              default-theme-mode="light"
              :code-x-render="selfCodeXRender"
            />
          </div>
          <!-- user 内容 纯文本 -->
          <div v-else-if="item.content && item.role === 'user'" class="user-content">
            {{ item.content }}
          </div>
        </template>
      </BubbleList>
      <div class="flex-center text-2xl mb-4 font-bold" v-if="!bubbleItems.length">
        <Typewriter
          content="您好！我是 Element Plus X"
          :typing="{
            step: 2,
            interval: 45
          }"
          :is-fog="{
            bgColor: '#fff'
          }"
        />
      </div>
      <Sender
        ref="senderRef"
        v-model="inputValue"
        class="chat-defaul-sender"
        :auto-size="{
          maxRows: 6,
          minRows: 2
        }"
        variant="updown"
        clearable
        allow-speech
        :loading="isLoading"
        @submit="startSSE"
        @cancel="cancelSSE"
      >
        <template #header>
          <div class="sender-header px-3 pt-1.5">
            <Attachments
              overflow="scrollX"
              :items="filesStore.filesList"
              :hide-upload="true"
              @delete-card="handleDeleteCard"
            >
              <template #prev-button="{ show, onScrollLeft }">
                <div
                  v-if="show"
                  class="prev-next-btn left-8px flex-center w-22px h-22px rounded-8px border-1px border-solid border-[rgba(0,0,0,0.08)] c-[rgba(0,0,0,.4)] hover:bg-#f3f4f6 bg-#fff font-size-10px"
                  @click="onScrollLeft"
                >
                  <ArtSvg icon="ion:chevron-back" />
                </div>
              </template>

              <template #next-button="{ show, onScrollRight }">
                <div
                  v-if="show"
                  class="prev-next-btn right-8px flex-center w-22px h-22px rounded-8px border-1px border-solid border-[rgba(0,0,0,0.08)] c-[rgba(0,0,0,.4)] hover:bg-#f3f4f6 bg-#fff font-size-10px"
                  @click="onScrollRight"
                >
                  <ArtSvg icon="ion:chevron-forward" />
                </div>
              </template>
            </Attachments>
          </div>
        </template>
        <template #prefix>
          <div class="flex-1 flex items-center gap-1 flex-none w-fit overflow-hidden">
            <FilesSelect />
            <ModelSelect />
          </div>
        </template>
      </Sender>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .chat-container {
    position: relative;

    .chat-warp {
      height: calc(100vh - 60px);

      .thinking-chain-warp {
        margin-bottom: 12px;
      }
    }

    :deep() {
      .el-bubble-list {
        padding-top: 24px;
      }

      .el-bubble {
        padding: 0 12px;
        padding-bottom: 24px;
      }

      .el-typewriter {
        overflow: hidden;
        border-radius: 12px;
      }

      .user-content {
        // 换行
        white-space: pre-wrap;
      }

      .markdown-body {
        background-color: transparent;
      }

      .markdown-elxLanguage-header-div {
        top: -25px !important;
      }

      // xmarkdown 样式
      .elx-xmarkdown-container {
        padding: 8px 4px;
      }
    }

    .chat-defaul-sender {
      width: 100%;
      margin-bottom: 22px;
    }
  }
</style>
