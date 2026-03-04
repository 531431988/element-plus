<script setup lang="ts">
  import * as echarts from 'echarts'
  import { ref, onMounted, watch, onUnmounted } from 'vue'

  // 定义组件属性
  const props = defineProps<{
    code: string // 图表配置代码
    width?: string // 图表宽度，默认100%
    height?: string // 图表高度，默认400px
    theme?: string // 图表主题
  }>()

  // 响应式变量
  const echartRef = ref<HTMLElement>()
  let myChart: echarts.ECharts | null = null // 图表实例
  const loading = ref<boolean>(true) // 加载状态

  /**
   * 防抖函数
   * @param fn 要执行的函数
   * @param delay 延迟时间（毫秒）
   * @returns 防抖处理后的函数
   */
  function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timer: number | null = null
    return function (...args: Parameters<T>) {
      if (timer) clearTimeout(timer)
      timer = window.setTimeout(() => {
        fn(...args)
      }, delay)
    }
  }

  /**
   * 解析ECharts配置
   * @param code 配置代码字符串
   * @returns 解析后的配置对象
   */
  function parseEChartsOption(code: string): any {
    try {
      // 清理代码格式
      let cleanedCode = code.replace(/^```echarts/, '').replace(/```$/, '')
      cleanedCode = cleanedCode.replace(/^option\s*=\s*/, '').replace(/;\s*$/, '')

      // 使用Function构造函数解析包含函数的配置
      const option = new Function('return ' + cleanedCode)()
      return option
    } catch (error) {
      console.error('解析ECharts配置失败:', error)
      return null
    }
  }

  /**
   * 渲染图表
   * 防抖处理，避免频繁渲染
   */
  const renderChart = debounce(() => {
    if (!echartRef.value) return

    try {
      // 解析配置
      const option = parseEChartsOption(props.code)

      // 检查解析结果
      if (!option) {
        console.error('配置解析失败')
        loading.value = false
        return
      } else {
        // 初始化或更新图表
        if (!myChart) {
          myChart = echarts.init(echartRef.value, props.theme)
        }
        myChart.setOption(option)

        // 渲染完成，隐藏loading
        loading.value = false
      }
    } catch (error) {
      console.error('图表渲染失败:', error)
      loading.value = false
    }
  }, 300)

  /**
   * 处理窗口大小变化
   */
  function handleResize() {
    myChart?.resize()
  }

  /**
   * 销毁图表实例
   */
  function destroyChart() {
    if (myChart) {
      myChart.dispose()
      myChart = null
    }
    window.removeEventListener('resize', handleResize)
  }

  // 生命周期钩子
  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  // 监听配置变化
  watch(
    () => props.code,
    () => {
      loading.value = true
      renderChart()
    },
    { immediate: true }
  )

  onUnmounted(() => {
    destroyChart()
  })
</script>

<template>
  <div ref="echartRef" class="h-100 w-full">
    <div v-if="loading" class="h-100 w-full flex-center">
      <ArtSvgIcon icon="line-md:loading-twotone-loop" class="text-xl" />
      <span>图表加载中...</span>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
